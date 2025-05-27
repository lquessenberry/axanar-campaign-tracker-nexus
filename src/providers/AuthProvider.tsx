import React, { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DonorProfile, UserProfile } from '@/types/supabase';
import { safeFrom } from '@/types/database';
import { AuthContext } from '@/contexts/AuthContext';
import { SupabaseAuthResponse } from '@/contexts/AuthContextType';

/**
 * Authentication Provider component
 * Manages user authentication state and profile data
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile and donor profile data
  // Using useCallback to prevent unnecessary re-renders
  const fetchUserProfiles = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user profiles for user ID:', userId);
      
      // Fetch user profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // If profile doesn't exist, create one (happens for migrated users)
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating a new one for migrated user');
        
        // Get user data to extract metadata
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Create new profile for the user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              full_name: user.user_metadata?.first_name && user.user_metadata?.last_name ? 
                `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : null,
              username: null,
              avatar_url: null,
              bio: null,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating user profile:', createError);
            setProfile(null);
            setIsAdmin(false);
            return;
          }
          
          console.log('Created new profile for migrated user:', newProfile);
          setProfile(newProfile as UserProfile);
        } else {
          console.error('Error fetching user data for profile creation');
          setProfile(null);
          setIsAdmin(false);
          return;
        }
      } else if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Still set the user as authenticated even if profile fetch fails
        setProfile(null);
        setIsAdmin(false);
        return;
      } else {
        // Profile exists, set it
        setProfile(profileData as UserProfile);
      }
      
      // Get the user's email to check for admin privileges and look up donor profile
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;
      
      // Check for admin privileges (add admin emails here)
      if (userEmail && ['admin@example.com', 'admin@axanar.com'].includes(userEmail.toLowerCase())) {
        console.log('User is an admin');
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      // Use profile from DB or newly created one
      const profileToUse = profile || profileData;
      
      // Fetch donor profile if linked, or try to find one by email
      if (profileToUse?.donor_profile_id) {
        console.log('Fetching donor profile with ID:', profileToUse.donor_profile_id);
        
        // Using safeFrom helper to safely access the donors table
        const { data: donorData, error: donorError } = await safeFrom(supabase, 'donors')
          .select('*')
          .eq('id', profileToUse.donor_profile_id)
          .single();
          
        if (donorError) {
          console.error('Error fetching donor profile:', donorError);
          setDonorProfile(null);
        } else {
          console.log('Found donor profile by ID:', donorData);
          setDonorProfile(donorData as DonorProfile);
        }
      } else if (userEmail) {
        // If no donor profile is linked yet, try to find one by email
        console.log('No donor profile linked, searching by email:', userEmail);
        
        // Using safeFrom helper to safely access the donors table
        const { data: donorDataByEmail, error: donorEmailError } = await safeFrom(supabase, 'donors')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();
          
        if (donorEmailError) {
          console.error('Error searching for donor profile by email:', donorEmailError);
          setDonorProfile(null);
        } else if (!donorDataByEmail) {
          console.log('No donor profile found by email');
          setDonorProfile(null);
        } else {
          console.log('Found donor profile by email:', donorDataByEmail);
          
          // Link the donor profile to the user profile
          if (profileToUse && donorDataByEmail && 'id' in donorDataByEmail) {
            const updatedProfile = {
              ...profileToUse,
              donor_profile_id: donorDataByEmail.id as string
            };
            setProfile(updatedProfile as UserProfile);
          }
          if (profileData && donorDataByEmail && 'id' in donorDataByEmail) {
            console.log('Updating user profile with donor_profile_id');
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ donor_profile_id: donorDataByEmail.id as string })
              .eq('id', userId);
            
            if (updateError) {
              console.error('Error linking donor profile:', updateError);
            } else {
              console.log('Successfully linked donor profile');
            }
          }
          // Cast to proper type when setting the donor profile
          setDonorProfile(donorDataByEmail as unknown as DonorProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfiles:', error);
    }
  }, [profile]);


  // Function to refresh user profile data (can be called after updates)
  const refreshUserProfile = async () => {
    if (user?.id) {
      await fetchUserProfiles(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    console.log('Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', { event, sessionExists: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user is logged in, fetch profiles
        if (session?.user) {
          console.log('User is logged in, fetching profiles for', session.user.id);
          await fetchUserProfiles(session.user.id);
        } else {
          console.log('No user session, resetting profiles');
          // Reset profiles when logged out
          setProfile(null);
          setDonorProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    console.log('Checking for existing session');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check result:', { 
        sessionExists: !!session, 
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // If user is logged in, fetch profiles
      if (session?.user) {
        console.log('Found existing user session, fetching profiles');
        await fetchUserProfiles(session.user.id);
      } else {
        console.log('No existing user session found');
      }
      
      setLoading(false);
    }).catch(error => {
      console.error('Error checking session:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfiles]);

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    donorProfile,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

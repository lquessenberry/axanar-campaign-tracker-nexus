import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import Profile from './Profile';

const VanityProfile = () => {
  const { username } = useParams<{ username: string }>();

  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['vanity-profile', username],
    queryFn: async () => {
      if (!username) throw new Error('No username provided');

      // First try to find by username in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('username', username)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (profile) {
        return { userId: profile.id, type: 'profile' };
      }

      // If no profile found, try username in donors table
      const { data: donor, error: donorError } = await supabase
        .from('donors')
        .select('id, auth_user_id, username, donor_name')
        .eq('username', username)
        .maybeSingle();

      if (donorError) throw donorError;

      if (donor) {
        return { 
          userId: donor.auth_user_id || donor.id, 
          type: donor.auth_user_id ? 'profile' : 'donor' 
        };
      }

      return null;
    },
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !userProfile) {
    return <Navigate to="/404" replace />;
  }

  // Redirect to the actual profile page with the resolved user ID
  return <Navigate to={`/profile/${userProfile.userId}`} replace />;
};

export default VanityProfile;
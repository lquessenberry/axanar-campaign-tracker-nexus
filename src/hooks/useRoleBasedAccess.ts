import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

type RoleType = 'admin' | 'editor' | 'viewer' | 'user';

interface RoleAccessState {
  hasRole: (role: RoleType) => boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  roles: RoleType[];
  user: User | null;
  loading: boolean;
}

/**
 * Hook for role-based access control throughout the application
 * Provides helper methods to check for specific roles
 * Can be used to conditionally render UI elements based on user roles
 */
const useRoleBasedAccess = (): RoleAccessState => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUserRoles = async () => {
      try {
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData?.session?.user || null;
        setUser(currentUser);

        if (!currentUser) {
          setRoles(['user']);
          setLoading(false);
          return;
        }

        // Get user metadata
        const { data: userData } = await supabase.auth.getUser();
        const userMetadata = userData?.user?.user_metadata;
        const userEmail = userData?.user?.email?.toLowerCase() || '';
        
        const userRoles: RoleType[] = ['user']; // Default role

        // Check metadata for role
        if (userMetadata?.role) {
          if (userMetadata.role === 'admin' || userMetadata.role === 'super_admin') {
            userRoles.push('admin');
            // Admins get all access levels
            userRoles.push('editor');
            userRoles.push('viewer');
          } else if (userMetadata.role === 'editor') {
            userRoles.push('editor');
            userRoles.push('viewer');
          } else if (userMetadata.role === 'viewer') {
            userRoles.push('viewer');
          }
        }

        // Check admin_users table using auth.users join
        const { data: adminUserData } = await supabase
          .from('admin_users')
          .select('user_id, is_super_admin')
          .eq('user_id', userData?.user?.id)
          .maybeSingle();

        // Super admin gets admin role
        if (adminUserData?.is_super_admin === true && !userRoles.includes('admin')) {
          userRoles.push('admin');
          
          // Admins get editor and viewer roles too
          if (!userRoles.includes('editor')) {
            userRoles.push('editor');
          }
          if (!userRoles.includes('viewer')) {
            userRoles.push('viewer');
          }
        }
        
        // For now, we're considering all database admin users to have editor access
        // This is a simplified approach until content manager field is properly defined in types
        if (adminUserData && !userRoles.includes('editor') && !userRoles.includes('admin')) {
          userRoles.push('editor');
          
          // Editors get viewer role too
          if (!userRoles.includes('viewer')) {
            userRoles.push('viewer');
          }
        }

        // For development convenience
        if (process.env.NODE_ENV === 'development') {
          const devTestEmails = [
            'test@example.com',
            'admin@example.com',
            'lee@axanar.com'
          ];

          if (devTestEmails.includes(userEmail) && !userRoles.includes('admin')) {
            userRoles.push('admin');
            userRoles.push('editor');
            userRoles.push('viewer');
            console.log('Development test user granted admin privileges');
          }
        }

        // Remove duplicates and set roles
        setRoles([...new Set(userRoles)]);
        setLoading(false);
      } catch (error) {
        console.error('Error checking user roles:', error);
        setRoles(['user']); // Fallback to basic user role
        setLoading(false);
      }
    };

    checkUserRoles();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log('Auth state changed in useRoleBasedAccess:', event);
        // Re-run role check on auth state change
        await checkUserRoles();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    hasRole: (role: RoleType) => roles.includes(role),
    isAdmin: roles.includes('admin'),
    isEditor: roles.includes('editor'),
    isViewer: roles.includes('viewer'),
    roles,
    user,
    loading
  };
};

export default useRoleBasedAccess;

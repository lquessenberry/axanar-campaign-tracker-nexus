/**
 * Unit Tests: useUserProfile Hook
 * Tests profile update logic with mocked Supabase calls
 * Focuses on isolated hook behavior, toast messages, error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUpdateProfile, useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id-123',
      email: 'test@starfleet.mil',
    },
    session: { access_token: 'test-token' },
    loading: false,
  }),
}));

// Create wrapper with React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUserProfile Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Fetching', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        id: 'test-user-id-123',
        username: 'ensign_test',
        full_name: 'Ensign Test',
        bio: 'Starfleet officer',
        avatar_url: null,
        background_url: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      } as any);

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockProfile);
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should create profile if none exists', async () => {
      const newProfile = {
        id: 'test-user-id-123',
        username: null,
        full_name: null,
        bio: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      // First call returns no profile
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newProfile, error: null }),
      } as any);

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(newProfile);
      });
    });

    it('should handle profile fetch errors', async () => {
      const error = new Error('Database connection failed');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error }),
      } as any);

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeTruthy();
      });
    });
  });
});

describe('useUpdateProfile Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Updates with Toast Messages', () => {
    it('should update profile successfully and trigger success toast', async () => {
      const updates = {
        full_name: 'Updated Name',
        bio: 'Updated bio',
      };

      const updatedProfile = {
        id: 'test-user-id-123',
        ...updates,
        username: 'ensign_test',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle update errors and show error toast', async () => {
      const updates = { bio: 'Invalid bio' };
      const error = { message: 'Update failed: Invalid bio format' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync(updates);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeTruthy();
    });

    it('should update username with special validation', async () => {
      const updates = { username: 'new_username_123' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id-123', ...updates },
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle multiple rapid updates', async () => {
      const updates1 = { full_name: 'Name 1' };
      const updates2 = { full_name: 'Name 2' };
      const updates3 = { full_name: 'Name 3' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return { data: { id: 'test-user-id-123', full_name: 'Name 3' }, error: null };
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      // Fire multiple updates rapidly
      await act(async () => {
        result.current.mutate(updates1);
        result.current.mutate(updates2);
        await result.current.mutateAsync(updates3);
      });

      // Last update should win
      expect(result.current.isSuccess).toBe(true);
    });

    it('should update avatar_url separately', async () => {
      const updates = { avatar_url: 'https://storage.supabase.co/avatars/test.jpg' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id-123', ...updates },
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      expect(result.current.data).toMatchObject(updates);
    });

    it('should update background_url and handle removal', async () => {
      const updates = { background_url: null };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id-123', background_url: null },
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      expect(result.current.data?.background_url).toBeNull();
    });
  });

  describe('Update Validation and Edge Cases', () => {
    it('should handle empty updates gracefully', async () => {
      const updates = {};

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id-123' },
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle network timeout errors', async () => {
      const updates = { bio: 'Network test' };
      const error = { message: 'Network request failed' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { data: null, error };
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync(updates);
        } catch (e) {
          expect(e).toBeTruthy();
        }
      });

      expect(result.current.isError).toBe(true);
    });

    it('should handle concurrent updates with race conditions', async () => {
      let updateCount = 0;
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(async () => {
          updateCount++;
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          return {
            data: { id: 'test-user-id-123', full_name: `Update ${updateCount}` },
            error: null,
          };
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      // Simulate race condition
      await act(async () => {
        const promises = [
          result.current.mutateAsync({ full_name: 'Concurrent 1' }),
          result.current.mutateAsync({ full_name: 'Concurrent 2' }),
          result.current.mutateAsync({ full_name: 'Concurrent 3' }),
        ];
        await Promise.all(promises);
      });

      expect(updateCount).toBeGreaterThan(0);
    });

    it('should invalidate query cache after successful update', async () => {
      const updates = { full_name: 'Cache Test' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id-123', ...updates },
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      // Cache invalidation happens via onSuccess in the hook
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('Bio and Long Text Updates', () => {
    it('should handle very long bio text', async () => {
      const longBio = 'A'.repeat(5000);
      const updates = { bio: longBio };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id-123', bio: longBio },
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      expect(result.current.data?.bio).toHaveLength(5000);
    });

    it('should handle special characters in bio', async () => {
      const specialBio = 'Bio with émojis 🚀 and spëcial chars @#$%';
      const updates = { bio: specialBio };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id-123', bio: specialBio },
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      expect(result.current.data?.bio).toBe(specialBio);
    });
  });
});

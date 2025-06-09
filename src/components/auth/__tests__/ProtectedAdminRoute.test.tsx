import { vi, describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { User, AuthError, Session } from '@supabase/supabase-js';
import React from 'react'; // Import React for JSX in mocks

// Mock react-router-dom: Navigate becomes a vi.fn()
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return {
    ...actual, // Spread actual to keep other exports like MemoryRouter, Routes, Route if needed by RTL context
    Navigate: vi.fn(({ to, state }) => (
      <div data-testid="navigate-mock" data-to={to} data-state={JSON.stringify(state)}>
        Mocked Navigate to: {to}
      </div>
    )),
    useLocation: () => ({ pathname: '/admin' }),
  };
});

// Mock Supabase client: All methods are vi.fn() created internally
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } }, 
        error: null 
      })),
    },
    from: vi.fn(),
  },
}));

// Mock useRoleBasedAccess hook: Default export is a vi.fn() created internally
vi.mock('@/hooks/useRoleBasedAccess', () => ({
  default: vi.fn(),
}));

// Import the component and MOCKED utilities AFTER all vi.mock calls
import ProtectedAdminRoute from '../ProtectedAdminRoute';
import { Navigate as MockedNavigate } from 'react-router-dom';
import { supabase as mockedSupabase } from '@/integrations/supabase/client';
import mockedUseRoleBasedAccess from '@/hooks/useRoleBasedAccess';

interface SessionResponse { data: { session: Session | null }; error: AuthError | null; }
interface UserResponse { data: { user: User | null }; error: AuthError | null; }

describe('ProtectedAdminRoute', () => {
  let actualMockedNavigate: ReturnType<typeof vi.fn>;
  let actualMockGetSession: ReturnType<typeof vi.fn>;
  let actualMockGetUser: ReturnType<typeof vi.fn>;
  let actualMockOnAuthStateChange: ReturnType<typeof vi.fn>;
  let actualMockFrom: ReturnType<typeof vi.fn>;
  let actualMockUseRoleBasedAccess: ReturnType<typeof vi.fn>;
  let unsubscribeAuthMockFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    actualMockedNavigate = MockedNavigate as ReturnType<typeof vi.fn>;
    actualMockGetSession = mockedSupabase.auth.getSession as ReturnType<typeof vi.fn>;
    actualMockGetUser = mockedSupabase.auth.getUser as ReturnType<typeof vi.fn>;
    actualMockOnAuthStateChange = mockedSupabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>;
    actualMockFrom = mockedSupabase.from as ReturnType<typeof vi.fn>;
    actualMockUseRoleBasedAccess = mockedUseRoleBasedAccess as ReturnType<typeof vi.fn>;

    actualMockedNavigate.mockReset();
    actualMockGetSession.mockReset();
    actualMockGetUser.mockReset();
    actualMockOnAuthStateChange.mockReset();
    actualMockFrom.mockReset();
    actualMockUseRoleBasedAccess.mockReset();

    unsubscribeAuthMockFn = vi.fn();
    actualMockOnAuthStateChange.mockReturnValue({ 
      data: { subscription: { unsubscribe: unsubscribeAuthMockFn } }, 
      error: null 
    });
    actualMockUseRoleBasedAccess.mockReturnValue({
      isAdmin: false, isEditor: false, isViewer: false, hasRole: () => false, roles: [], loading: false, user: null,
    });
  });

  test('renders loading spinner, then redirects unauthenticated user', async () => {
    actualMockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    render(<ProtectedAdminRoute><div>Protected Content</div></ProtectedAdminRoute>);
    
    expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/checking authentication/i)).not.toBeInTheDocument();
      expect(actualMockedNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/login', state: { from: '/admin' } }),
        expect.anything()
      );
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('redirects non-admin users from admin routes', async () => {
    const mockUser: Partial<User> = { id: '123', email: 'regular@example.com', user_metadata: { role: 'user' } }; 
    actualMockGetSession.mockResolvedValue({ data: { session: { user: mockUser } as Session }, error: null });
    actualMockGetUser.mockResolvedValue({ data: { user: mockUser as User }, error: null });
    actualMockFrom.mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) });

    render(<ProtectedAdminRoute><div>Admin Content</div></ProtectedAdminRoute>);
    await waitFor(() => {
      expect(actualMockedNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/' }), expect.anything());
    });
  });

  test('redirects unauthenticated users to login (direct test)', async () => {
    actualMockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    render(<ProtectedAdminRoute><div>Admin content</div></ProtectedAdminRoute>);
    await waitFor(() => {
      expect(actualMockedNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/login', state: { from: '/admin' } }), expect.anything());
    });
  });

  test('should allow access to super admin users (via admin_users table)', async () => {
    const mockUser: Partial<User> = { id: '123', email: 'admin@axanarproductions.com', user_metadata: { role: 'user' } }; 
    actualMockGetSession.mockResolvedValue({ data: { session: { user: mockUser } as Session }, error: null });
    actualMockGetUser.mockResolvedValue({ data: { user: mockUser as User }, error: null });
    const mockAdminResult = { id: 1, user_id: '123', email: 'admin@axanarproductions.com', role: 'admin' };
    actualMockFrom.mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: mockAdminResult, error: null }) });

    render(<ProtectedAdminRoute><div data-testid="admin-content">Admin content</div></ProtectedAdminRoute>);
    await waitFor(() => expect(screen.getByTestId('admin-content')).toBeInTheDocument());
    expect(actualMockedNavigate).not.toHaveBeenCalled();
  });

  test('should allow access to super admin users (via metadata)', async () => {
    const mockUser: Partial<User> = { id: '124', email: 'super@example.com', user_metadata: { role: 'admin' } }; 
    actualMockGetSession.mockResolvedValue({ data: { session: { user: mockUser } as Session }, error: null });
    actualMockGetUser.mockResolvedValue({ data: { user: mockUser as User }, error: null });
    actualMockFrom.mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) });

    render(<ProtectedAdminRoute><div data-testid="admin-content">Admin content via metadata</div></ProtectedAdminRoute>);
    await waitFor(() => expect(screen.getByTestId('admin-content')).toBeInTheDocument());
    expect(actualMockedNavigate).not.toHaveBeenCalled();
  });

  test('redirects non-admin users to home page (alternative scenario)', async () => {
    const mockUser: Partial<User> = { id: '456', email: 'viewer@example.com', user_metadata: { role: 'viewer' } };
    actualMockGetSession.mockResolvedValue({ data: { session: { user: mockUser } as Session }, error: null });
    actualMockGetUser.mockResolvedValue({ data: { user: mockUser as User }, error: null });
    actualMockFrom.mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) });

    render(<ProtectedAdminRoute><div>Protected Admin Content</div></ProtectedAdminRoute>);
    await waitFor(() => {
      expect(actualMockedNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/' }), expect.anything());
    });
  });

  test('allows access in development mode with bypass', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const mockUser: Partial<User> = { id: '789', email: 'test@example.com', user_metadata: { role: 'user' } }; 
    actualMockGetSession.mockResolvedValue({ data: { session: { user: mockUser } as Session }, error: null });
    actualMockGetUser.mockResolvedValue({ data: { user: mockUser as User }, error: null });
    actualMockFrom.mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) });

    render(<ProtectedAdminRoute><div data-testid="admin-content">Development Mode Bypass</div></ProtectedAdminRoute>);
    await waitFor(() => expect(screen.getByTestId('admin-content')).toBeInTheDocument());
    expect(actualMockedNavigate).not.toHaveBeenCalled();
    process.env.NODE_ENV = originalNodeEnv;
  });
});

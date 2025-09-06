import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface AuthGuardProps {
  user?: any;
  isAdmin?: boolean;
  requiredRole?: 'user' | 'admin';
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  user, 
  isAdmin = false, 
  requiredRole = 'user', 
  children 
}) => {
  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access messages and communicate with our support team.
            </p>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Admin role required but user is not admin
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You need administrator privileges to access this page.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/messages">
                <Button variant="outline">
                  User Messages
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button>
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // User role required but user is admin (redirect to admin interface)
  if (requiredRole === 'user' && isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard Available</h1>
            <p className="text-muted-foreground mb-6">
              As an administrator, you can access the enhanced admin message dashboard 
              to manage all user conversations.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/admin/messages">
                <Button>
                  Admin Dashboard
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
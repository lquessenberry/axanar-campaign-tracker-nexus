import React from 'react';
import { Eye, X, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { Link } from 'react-router-dom';

const ImpersonationBanner: React.FC = () => {
  const { impersonatedUser, isImpersonating, stopImpersonation } = useImpersonation();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  const displayName = impersonatedUser.full_name || impersonatedUser.username || impersonatedUser.email || 'Unknown User';

  return (
    <>
      {/* Fixed banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-black px-4 py-2 shadow-lg">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">
              Viewing as: <span className="font-bold">{displayName}</span>
            </span>
            {impersonatedUser.username && (
              <span className="text-amber-800">(@{impersonatedUser.username})</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {impersonatedUser.username && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-white/20 border-amber-700 hover:bg-white/30 text-black"
              >
                <Link to={`/u/${impersonatedUser.username}`}>
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-white/20 border-amber-700 hover:bg-white/30 text-black"
            >
              <Link to="/profile">
                <ExternalLink className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={stopImpersonation}
              className="bg-black text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              Exit View
            </Button>
          </div>
        </div>
      </div>
      {/* Spacer to push content down */}
      <div className="h-10" />
    </>
  );
};

export default ImpersonationBanner;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

interface RouteTransitionGuardProps {
  children: React.ReactNode;
}

/**
 * RouteTransitionGuard component
 * Shows a loading indicator during page transitions
 * Provides a consistent user experience when navigating between routes
 */
export default function RouteTransitionGuard({ children }: RouteTransitionGuardProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  const navigationType = useNavigationType();
  
  useEffect(() => {
    // Don't show transition for initial page load
    if (navigationType !== 'POP') {
      setIsTransitioning(true);
      
      // Set a short timeout to simulate transition and prevent flashing
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigationType]);
  
  return (
    <>
      {isTransitioning && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-axanar-teal border-t-transparent mb-3"></div>
            <p className="text-gray-700">Loading page...</p>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-foreground">Loading…</div>
  </div>
);

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user)
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

  return <>{children}</>;
};

export default RequireAuth;

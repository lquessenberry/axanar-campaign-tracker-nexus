import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Shared layout component for all admin pages
 * Provides consistent structure and admin access check
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = "Admin", 
  description 
}) => {
  // Ensure user has admin access
  useAdminCheck();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8 px-4 mx-auto">
        {title && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;

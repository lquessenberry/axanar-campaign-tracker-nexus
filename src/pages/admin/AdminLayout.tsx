import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Settings, BarChart3, Users, CreditCard, Layers } from 'lucide-react';
import useRoleBasedAccess from '@/hooks/useRoleBasedAccess';

// No props needed since we're using Outlet

export default function AdminLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAdmin, isEditor, hasRole, loading } = useRoleBasedAccess();

  // Enhanced isActive function to handle nested routes properly
  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin' || currentPath === '/admin/';
    }
    return currentPath.startsWith(path);
  };

  React.useEffect(() => {
    console.log('AdminLayout - Current path:', currentPath);
    console.log('AdminLayout - User roles:', { isAdmin, isEditor });
  }, [currentPath, isAdmin, isEditor]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-axanar-teal" style={{ fontSize: '1.875rem' }}>Admin Dashboard</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-axanar-dark rounded-lg p-4">
          <nav className="space-y-1">
            <Link 
              to="/admin"
              className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                isActive('/admin') 
                  ? 'bg-axanar-teal text-white' 
                  : 'text-white hover:bg-axanar-teal/20'
              }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            
            <Link 
              to="/admin/system-diagrams"
              className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                isActive('/admin/system-diagrams') 
                  ? 'bg-axanar-teal text-white' 
                  : 'text-white hover:bg-axanar-teal/20'
              }`}
            >
              <Layers className="mr-3 h-5 w-5" />
              System Architecture
            </Link>
            
            {isAdmin && (
              <Link 
                to="/admin/users"
                className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                  isActive('/admin/users') 
                    ? 'bg-axanar-teal text-white' 
                    : 'text-white hover:bg-axanar-teal/20'
                }`}
              >
                <Users className="mr-3 h-5 w-5" />
                User Management
              </Link>
            )}
            
            {(isAdmin || isEditor) && (
              <>
                <Link 
                  to="/admin/donors"
                  className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                    isActive('/admin/donors') 
                      ? 'bg-axanar-teal text-white' 
                      : 'text-white hover:bg-axanar-teal/20'
                  }`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Donor Management
                </Link>
                
                <Link 
                  to="/admin/pledges"
                  className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                    isActive('/admin/pledges') 
                      ? 'bg-axanar-teal text-white' 
                      : 'text-white hover:bg-axanar-teal/20'
                  }`}
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  Pledge Management
                </Link>
                
                <Link 
                  to="/admin/campaigns"
                  className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                    isActive('/admin/campaigns') 
                      ? 'bg-axanar-teal text-white' 
                      : 'text-white hover:bg-axanar-teal/20'
                  }`}
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Campaign Management
                </Link>
              </>
            )}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 bg-white rounded-lg shadow-md p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

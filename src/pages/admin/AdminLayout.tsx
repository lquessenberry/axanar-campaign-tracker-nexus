import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, BarChart3, Users, CreditCard, Layers } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => currentPath === path;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-axanar-teal" style={{ fontSize: '1.875rem' }}>{title}</h1>
      
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
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 bg-white rounded-lg shadow-md p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

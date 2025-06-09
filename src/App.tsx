import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import DebugPanel from "@/components/DebugPanel";
import Index from "./pages/Index";
import Campaign from "./pages/Campaign";
import Profile from "./pages/Profile";
import Dashboard from './pages/Dashboard';
import DonorDirectory from './pages/DonorDirectory';
import DonorProfile from './pages/DonorProfile';
import PledgeManager from './pages/PledgeManager';
import Analytics from './pages/Analytics';
import LeesDashboard from './pages/LeesDashboard';
import PublicDashboard from './pages/PublicDashboard';
import AdminTools from './pages/AdminTools';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import SystemDiagrams from './pages/admin/SystemDiagrams';
import UserManagement from './pages/admin/UserManagement';
import DonorManagement from './pages/admin/DonorManagement';

import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AdminPanel from './pages/AdminPanel';
import CampaignManagement from './pages/admin/CampaignManagement';
import PledgeManagement from './pages/admin/PledgeManagement';
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import RouteTransitionGuard from './components/ui/RouteTransitionGuard';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <DebugPanel />
              <RouteTransitionGuard>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/register" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/campaign/:id" element={<Campaign />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  } />
                  <Route path="/donor-directory" element={
                    <ErrorBoundary>
                      <DonorDirectory />
                    </ErrorBoundary>
                  } />
                  <Route path="/donor/:donorId" element={
                    <ErrorBoundary>
                      <DonorProfile />
                    </ErrorBoundary>
                  } />
                  <Route path="/pledges" element={
                    <ErrorBoundary>
                      <PledgeManager />
                    </ErrorBoundary>
                  } />
                  <Route path="/analytics" element={
                    <ErrorBoundary>
                      <Analytics />
                    </ErrorBoundary>
                  } />
                  <Route path="/lee" element={
                    <ErrorBoundary>
                      <LeesDashboard />
                    </ErrorBoundary>
                  } />
                  <Route path="/public" element={
                    <ErrorBoundary>
                      <PublicDashboard />
                    </ErrorBoundary>
                  } />
                  <Route path="/admin-tools" element={
                    <ErrorBoundary>
                      <AdminTools />
                    </ErrorBoundary>
                  } />
                  {/* Admin Routes - Nested for better organization and shared layout */}
                  <Route
                    path="/admin/*"
                    element={
                      <ErrorBoundary>
                        <ProtectedAdminRoute>
                          <AdminLayout />
                        </ProtectedAdminRoute>
                      </ErrorBoundary>
                    }
                  >
                    {/* Admin nested routes - these will render inside AdminLayout */}
                    <Route index element={<AdminDashboard />} />
                    <Route path="system-diagrams" element={<SystemDiagrams />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="donors" element={<DonorManagement />} />
                    <Route path="pledges" element={<PledgeManagement />} />
                    <Route path="campaigns" element={<CampaignManagement />} />
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RouteTransitionGuard>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

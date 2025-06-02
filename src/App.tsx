
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DebugPanel />
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
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ErrorBoundary>
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/system-diagrams"
              element={
                <ErrorBoundary>
                  <ProtectedAdminRoute>
                    <SystemDiagrams />
                  </ProtectedAdminRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ErrorBoundary>
                  <ProtectedAdminRoute>
                    <UserManagement />
                  </ProtectedAdminRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/donors"
              element={
                <ErrorBoundary>
                  <ProtectedAdminRoute>
                    <DonorManagement />
                  </ProtectedAdminRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/pledges"
              element={
                <ErrorBoundary>
                  <ProtectedAdminRoute>
                    <PledgeManagement />
                  </ProtectedAdminRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                <ErrorBoundary>
                  <ProtectedAdminRoute>
                    <CampaignManagement />
                  </ProtectedAdminRoute>
                </ErrorBoundary>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

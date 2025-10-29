
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThumbMenu from "@/components/ThumbMenu";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import DirectMessages from "./pages/DirectMessages";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import AdminDashboard from "./pages/admin/Dashboard";
import PasswordReset from "./pages/PasswordReset";
import LCARSShowcase from "./pages/LCARSShowcase";
import PublicProfile from "./pages/PublicProfile";
import ModelManager from "./pages/ModelManager";
import Campaign from "./pages/Campaign";
import Campaigns from "./pages/Campaigns";
import { Navigate } from "react-router-dom";
import RequireAdmin from "@/components/auth/RequireAdmin";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import RequireAuth from "@/components/auth/RequireAuth";
import SignInRequired from "./pages/SignInRequired";
import Forbidden from "./pages/Forbidden";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import TacticalBattle from "./pages/TacticalBattle";
import TacticalDemo from "./pages/TacticalDemo";
import VisitorAnalytics from "./pages/admin/VisitorAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth/reset-password" element={<PasswordReset />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/401" element={<SignInRequired />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route path="/messages" element={<Messages />} />
            <Route path="/direct-messages" element={<RequireAuth><DirectMessages /></RequireAuth>} />
            <Route path="/admin" element={<Admin />} />
            <Route
              path="/admin/dashboard"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <RequireAdmin>
                  <VisitorAnalytics />
                </RequireAdmin>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/lcars" element={<LCARSShowcase />} />
            <Route path="/models" element={<ModelManager />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/vanity/:username" element={<Navigate to="/u/:username" replace />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaign/:id" element={<Campaign />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/thread/:threadId" element={<ForumThread />} />
          <Route path="/tactical" element={<RequireAuth><TacticalDemo /></RequireAuth>} />
          <Route path="/tactical/:gameId" element={<RequireAuth><TacticalBattle /></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
          <ThumbMenu />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;


import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import ThumbMenu from "@/components/ThumbMenu";
import { GlobalPresenceTracker } from "@/components/GlobalPresenceTracker";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { DaystromCursorGlow } from "@/components/DaystromCursorGlow";
import { LCARSEdgeBars } from "@/components/LCARSEdgeBars";
import { Loader2 } from "lucide-react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better performance
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const DirectMessages = lazy(() => import("./pages/DirectMessages"));
const Admin = lazy(() => import("./pages/Admin"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Support = lazy(() => import("./pages/Support"));
const Terms = lazy(() => import("./pages/Terms"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const LCARSShowcase = lazy(() => import("./pages/LCARSShowcase"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const ModelManager = lazy(() => import("./pages/ModelManager"));
const Campaign = lazy(() => import("./pages/Campaign"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const Forum = lazy(() => import("./pages/Forum"));
const ForumThread = lazy(() => import("./pages/ForumThread"));
const TacticalBattle = lazy(() => import("./pages/TacticalBattle"));
const TacticalDemo = lazy(() => import("./pages/TacticalDemo"));
const VisitorAnalytics = lazy(() => import("./pages/admin/VisitorAnalytics"));
const HowToEarnARES = lazy(() => import("./pages/HowToEarnARES"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));

import { Navigate } from "react-router-dom";
import RequireAdmin from "@/components/auth/RequireAdmin";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import RequireAuth from "@/components/auth/RequireAuth";
import SignInRequired from "./pages/SignInRequired";
import Forbidden from "./pages/Forbidden";

// Optimized QueryClient with better caching strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
      <p className="text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

// Component to handle global message notifications
const GlobalMessageNotifications = () => {
  useMessageNotifications({ enabled: true });
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ChatProvider>
              <DaystromCursorGlow />
              <LCARSEdgeBars />
              <GlobalPresenceTracker />
              <GlobalMessageNotifications />
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
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
                    <Route path="/how-to-earn-ares" element={<HowToEarnARES />} />
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
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/tactical" element={<RequireAuth><TacticalDemo /></RequireAuth>} />
                    <Route path="/tactical/:gameId" element={<RequireAuth><TacticalBattle /></RequireAuth>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <ChatWindow />
              </ErrorBoundary>
          <ThumbMenu />
            </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

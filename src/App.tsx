import { GlobalPresenceTracker } from "@/components/GlobalPresenceTracker";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TourProvider } from "@/contexts/TourContext";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

// Eager load critical pages
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better performance
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DirectMessages = lazy(() => import("./pages/DirectMessages"));
const Admin = lazy(() => import("./pages/Admin"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Support = lazy(() => import("./pages/Support"));
const Terms = lazy(() => import("./pages/Terms"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const BackfillTitles = lazy(() => import("./pages/admin/BackfillTitles"));
const SendAnnouncement = lazy(() => import("./pages/admin/SendAnnouncement"));
const AdminGodView = lazy(() => import("./pages/admin/AdminGodView"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const LCARSShowcase = lazy(() => import("./pages/LCARSShowcase"));
const LCARSEvolution = lazy(() => import("./pages/LCARSEvolution"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const ModelManager = lazy(() => import("./pages/ModelManager"));
const Campaign = lazy(() => import("./pages/Campaign"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const Forum = lazy(() => import("./pages/Forum"));
const ForumThread = lazy(() => import("./pages/ForumThread"));
const HowToEarnARES = lazy(() => import("./pages/HowToEarnARES"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const KnownIssues = lazy(() => import("./pages/KnownIssues"));
const AxanarVideos = lazy(() => import("./pages/AxanarVideos"));

// Lazy load global components that aren't needed on initial render
const ImpersonationBanner = lazy(
  () => import("@/components/admin/ImpersonationBanner"),
);
const ChatWindow = lazy(() =>
  import("@/components/chat/ChatWindow").then((m) => ({
    default: m.ChatWindow,
  })),
);

import RequireAdmin from "@/components/auth/RequireAdmin";
import RequireAuth from "@/components/auth/RequireAuth";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Navigate } from "react-router-dom";

import Forbidden from "./pages/Forbidden";
import SignInRequired from "./pages/SignInRequired";
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

// Redirect /vanity/:username to /u/:username with actual param resolution
const VanityRedirect = () => {
  const { username } = useParams();
  return <Navigate to={`/u/${username}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ImpersonationProvider>
              <TourProvider>
                <ChatProvider>
                  {/* Skip link for gamepad/controller navigation */}
                  <a href="#main-content" className="skip-link">
                    Skip to main content
                  </a>
                  <Suspense fallback={null}>
                    <ImpersonationBanner />
                  </Suspense>
                  <GlobalPresenceTracker />
                  <GlobalMessageNotifications />
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <main id="main-content">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route
                            path="/login"
                            element={<Navigate to="/auth" replace />}
                          />
                          <Route
                            path="/auth/reset-password"
                            element={<PasswordReset />}
                          />
                          <Route
                            path="/register"
                            element={<Navigate to="/auth" replace />}
                          />
                          <Route path="/401" element={<SignInRequired />} />
                          <Route path="/403" element={<Forbidden />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route
                            path="/profile/:userId"
                            element={<Profile />}
                          />
                          <Route
                            path="/dashboard"
                            element={
                              <RequireAuth>
                                <Dashboard />
                              </RequireAuth>
                            }
                          />
                          <Route
                            path="/messages"
                            element={<Navigate to="/direct-messages" replace />}
                          />
                          <Route
                            path="/direct-messages"
                            element={
                              <RequireAuth>
                                <DirectMessages />
                              </RequireAuth>
                            }
                          />
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
                            path="/admin/backfill-titles"
                            element={
                              <RequireAdmin>
                                <BackfillTitles />
                              </RequireAdmin>
                            }
                          />
                          <Route
                            path="/admin/donor/:donorId?"
                            element={
                              <RequireAdmin>
                                <AdminGodView />
                              </RequireAdmin>
                            }
                          />
                          <Route
                            path="/admin/send-announcement"
                            element={
                              <RequireAdmin>
                                <SendAnnouncement />
                              </RequireAdmin>
                            }
                          />
                          <Route path="/about" element={<About />} />
                          <Route
                            path="/how-it-works"
                            element={<HowItWorks />}
                          />
                          <Route
                            path="/how-to-earn-ares"
                            element={<HowToEarnARES />}
                          />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/support" element={<Support />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/lcars" element={<LCARSShowcase />} />
                          <Route
                            path="/lcars-evolution"
                            element={<LCARSEvolution />}
                          />
                          <Route
                            path="/models"
                            element={
                              <RequireAuth>
                                <ModelManager />
                              </RequireAuth>
                            }
                          />
                          <Route
                            path="/u/:username"
                            element={<PublicProfile />}
                          />
                          <Route
                            path="/vanity/:username"
                            element={<VanityRedirect />}
                          />
                          <Route path="/campaigns" element={<Campaigns />} />
                          <Route path="/campaign/:id" element={<Campaign />} />
                          <Route path="/forum" element={<Forum />} />
                          <Route
                            path="/forum/thread/:threadId"
                            element={<ForumThread />}
                          />
                          <Route
                            path="/leaderboard"
                            element={<Leaderboard />}
                          />
                          <Route
                            path="/known-issues"
                            element={<KnownIssues />}
                          />
                          <Route
                            path="/status"
                            element={<Navigate to="/known-issues" replace />}
                          />
                          <Route path="/videos" element={<AxanarVideos />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </Suspense>
                    <Suspense fallback={null}>
                      <ChatWindow />
                    </Suspense>
                  </ErrorBoundary>
                </ChatProvider>
              </TourProvider>
            </ImpersonationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

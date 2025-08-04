
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
import AdminPledges from "./pages/admin/Pledges";
import AdminRewards from "./pages/admin/Rewards";
import AdminDonors from "./pages/admin/Donors";
import AdminManagement from "./pages/admin/Admins";
import AdminMessages from "./pages/admin/Messages";
import PasswordReset from "./pages/PasswordReset";
import LCARSShowcase from "./pages/LCARSShowcase";
import VanityProfile from "./pages/VanityProfile";
import ModelManager from "./pages/ModelManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth/reset-password" element={<PasswordReset />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/pledges" element={<AdminPledges />} />
            <Route path="/admin/rewards" element={<AdminRewards />} />
            <Route path="/admin/donors" element={<AdminDonors />} />
            <Route path="/admin/admins" element={<AdminManagement />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/lcars" element={<LCARSShowcase />} />
            <Route path="/models" element={<ModelManager />} />
            <Route path="/:username/profile" element={<VanityProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ThumbMenu />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

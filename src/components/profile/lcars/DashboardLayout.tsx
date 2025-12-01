/**
 * LCARS Okuda Triptych Layout (2265-2293 Film Era)
 * Classic three-column information architecture
 */

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  leftNav: React.ReactNode;
  centerContent: React.ReactNode;
  rightAux: React.ReactNode;
  header?: React.ReactNode;
}

export function DashboardLayout({
  leftNav,
  centerContent,
  rightAux,
  header,
}: DashboardLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar - 80px high, full-width */}
      {header && (
        <div className="sticky top-0 z-50 h-20 border-b border-border bg-background/95 backdrop-blur">
          {header}
        </div>
      )}

      {/* Mobile Nav Toggle */}
      <button
        onClick={() => setNavOpen(!navOpen)}
        className="fixed top-24 left-4 z-50 lg:hidden h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center"
        aria-label="Toggle navigation"
      >
        {navOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Okuda Triptych Grid */}
      <div className="flex gap-3 p-3">
        {/* Left Column - Primary Navigation (320px fixed, off-canvas on mobile) */}
        <aside
          className={cn(
            "fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] w-80 z-40 transition-transform duration-300",
            "lg:translate-x-0",
            navOpen ? "translate-x-0" : "-translate-x-full",
            "lg:block"
          )}
        >
          <div className="h-full overflow-y-auto bg-background lg:bg-transparent">
            {leftNav}
          </div>
        </aside>

        {/* Overlay for mobile nav */}
        {navOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setNavOpen(false)}
          />
        )}

        {/* Center Column - Main Content (fluid 60-70%) */}
        <main className="flex-1 min-w-0 lg:ml-80">
          <div className="space-y-2">
            {centerContent}
          </div>
        </main>

        {/* Right Column - Aux Stats (300px fixed, collapses below on smaller) */}
        <aside className="hidden xl:block w-75 flex-shrink-0">
          {rightAux}
        </aside>
      </div>

      {/* Right rail content below center on smaller screens */}
      <div className="xl:hidden p-3 pt-0">
        {rightAux}
      </div>
    </div>
  );
}

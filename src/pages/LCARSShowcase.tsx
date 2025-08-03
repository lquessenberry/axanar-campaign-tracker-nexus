import React from "react";
import { LCARSDemo } from "@/components/LCARSDemo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const LCARSShowcase = () => {
  return (
    <div className="min-h-screen">
      {/* Theme Toggle in Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <LCARSDemo />
    </div>
  );
};

export default LCARSShowcase;
import React, { useState } from "react";
import { LCARSDemo } from "@/components/LCARSDemo";
import { EnhancedLCARS } from "@/components/EnhancedLCARS";
import { CageEraInterface } from "@/components/CageEraInterface";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LCARSShowcase = () => {
  const [activeInterface, setActiveInterface] = useState<"classic" | "enhanced" | "cage">("enhanced");

  const interfaces = [
    { id: "classic", label: "Classic LCARS", component: LCARSDemo },
    { id: "enhanced", label: "Enhanced Pre-Kirk", component: EnhancedLCARS },
    { id: "cage", label: "The Cage Era (3D)", component: CageEraInterface }
  ];

  const ActiveComponent = interfaces.find(i => i.id === activeInterface)?.component || EnhancedLCARS;

  return (
    <div className="min-h-screen">
      {/* Interface Selector */}
      <div className="fixed top-4 left-4 z-50 flex flex-col space-y-2">
        <div className="flex space-x-2 p-3 bg-black/80 backdrop-blur-md rounded-lg border border-cyan-500/50">
          {interfaces.map((iface) => (
            <Button
              key={iface.id}
              variant={activeInterface === iface.id ? "default" : "outline"}
              onClick={() => setActiveInterface(iface.id as any)}
              className={`font-mono text-xs ${
                activeInterface === iface.id 
                  ? "bg-cyan-500 text-black" 
                  : "text-cyan-300 border-cyan-500 hover:bg-cyan-500/20"
              }`}
            >
              {iface.label}
            </Button>
          ))}
        </div>
        <Badge variant="secondary" className="bg-black/80 text-cyan-300 font-mono text-xs">
          Star Trek Interface Demo
        </Badge>
      </div>

      {/* Theme Toggle in Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <ActiveComponent />
    </div>
  );
};

export default LCARSShowcase;
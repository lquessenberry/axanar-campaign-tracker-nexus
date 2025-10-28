import React from 'react';
import { DemoGameCreator } from '@/components/tactical/DemoGameCreator';

const TacticalDemo = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">🎮 Tactical Battle System</h1>
        <p className="text-xl text-muted-foreground">
          Real-time, hex-based starship combat for the Axanar RPG
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <DemoGameCreator />
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Features</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Real-time hex-based tactical map</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Turn-based move submission by players</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>GM controls for resolving combat</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Live updates for all spectators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Ship stats: hull, shields, facing, weapons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Visual damage indicators and status effects</span>
            </li>
          </ul>

          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-2">How it Works</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Create or join a tactical game</li>
              <li>Players submit moves for their assigned ships</li>
              <li>GM reviews and resolves all moves simultaneously</li>
              <li>Battle map updates in real-time for all viewers</li>
              <li>Continue until victory conditions are met</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalDemo;

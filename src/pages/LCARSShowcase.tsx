import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import LCARSButton from '@/components/ui/lcars-button';
import { Sparkles, Zap, AlertTriangle, Radio } from 'lucide-react';

const LCARSShowcase = () => {
  const [clickCount, setClickCount] = useState(0);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-black overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/20 to-orange-950/20" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(251,146,60,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.h1 
              className="text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundSize: '200% auto',
              }}
            >
              LCARS 2399
            </motion.h1>
            <p className="text-2xl text-gray-400 font-light tracking-wider mb-4">
              THE FUTURE IS NOW
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Physics-based animations • Ripple effects • Haptic feedback • Neon okudagrams
            </p>
          </motion.div>

          {/* Button Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Primary Variant */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-orange-400 mb-2">PRIMARY</h3>
                <p className="text-sm text-gray-500">Command Operations</p>
              </div>
              <LCARSButton 
                variant="primary" 
                size="lg"
                onClick={() => setClickCount(c => c + 1)}
              >
                <Sparkles className="inline mr-2 h-6 w-6" />
                ENGAGE
              </LCARSButton>
              <LCARSButton variant="primary" size="md">
                WARP DRIVE
              </LCARSButton>
              <LCARSButton variant="primary" size="sm">
                SHIELDS
              </LCARSButton>
            </motion.div>

            {/* Secondary Variant */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-purple-400 mb-2">SECONDARY</h3>
                <p className="text-sm text-gray-500">Science & Sensors</p>
              </div>
              <LCARSButton variant="secondary" size="lg">
                HULL INTEGRITY
              </LCARSButton>
              <LCARSButton variant="secondary" size="md">
                <Radio className="inline mr-2 h-5 w-5" />
                SENSORS
              </LCARSButton>
              <LCARSButton variant="secondary" size="sm">
                SCAN
              </LCARSButton>
            </motion.div>

            {/* Alert Variant */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-red-400 mb-2">ALERT</h3>
                <p className="text-sm text-gray-500">Emergency Systems</p>
              </div>
              <LCARSButton variant="alert" size="lg">
                <AlertTriangle className="inline mr-2 h-6 w-6" />
                RED ALERT
              </LCARSButton>
              <LCARSButton variant="alert" size="md">
                EJECT CORE
              </LCARSButton>
              <LCARSButton variant="alert" size="sm">
                ABANDON SHIP
              </LCARSButton>
            </motion.div>

            {/* Accent Variant */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">ACCENT</h3>
                <p className="text-sm text-gray-500">Auxiliary Functions</p>
              </div>
              <LCARSButton variant="accent" size="lg">
                <Zap className="inline mr-2 h-6 w-6" />
                TRANSPORTER
              </LCARSButton>
              <LCARSButton variant="accent" size="md">
                REPLICATOR
              </LCARSButton>
              <LCARSButton variant="accent" size="sm">
                HOLODECK
              </LCARSButton>
            </motion.div>
          </div>

          {/* Disabled States */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-20"
          >
            <h3 className="text-3xl font-bold text-gray-400 mb-8">DISABLED STATES</h3>
            <div className="flex flex-wrap gap-6 justify-center">
              <LCARSButton variant="primary" disabled>
                OFFLINE
              </LCARSButton>
              <LCARSButton variant="secondary" disabled>
                DAMAGED
              </LCARSButton>
              <LCARSButton variant="alert" disabled>
                LOCKED
              </LCARSButton>
              <LCARSButton variant="accent" disabled>
                MAINTENANCE
              </LCARSButton>
            </div>
          </motion.div>

          {/* Interactive Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <div className="inline-block bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/50 rounded-lg px-12 py-8 backdrop-blur-xl">
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">System Interactions</p>
              <motion.p 
                className="text-6xl font-bold text-orange-400"
                key={clickCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {clickCount}
              </motion.p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="p-8 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 rounded-lg backdrop-blur-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-bold text-orange-400 mb-2">Physics-Based</h4>
              <p className="text-gray-400 text-sm">Framer Motion springs with real-world physics</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-lg backdrop-blur-sm">
              <div className="text-4xl mb-4">💫</div>
              <h4 className="text-xl font-bold text-purple-400 mb-2">Micro-Interactions</h4>
              <p className="text-gray-400 text-sm">Ripples, glows, and sweeping animations</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-lg backdrop-blur-sm">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-xl font-bold text-cyan-400 mb-2">Haptic Feedback</h4>
              <p className="text-gray-400 text-sm">Vibration support on mobile devices</p>
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-20 text-center"
          >
            <p className="text-gray-600 text-sm uppercase tracking-widest mb-4">Built With</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS', 'Vite'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded text-gray-400 text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LCARSShowcase;

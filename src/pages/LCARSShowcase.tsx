import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import LCARSSlab from '@/components/ui/lcars-slab';

const LCARSShowcase = () => {
  const [activePage, setActivePage] = useState('warp');
  const [clickCount, setClickCount] = useState(0);
  const [engageActive, setEngageActive] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

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
        <div className="relative z-10 container mx-auto px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
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
              AUTHENTIC TOUCH SLABS
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              No borders • No rounded corners • Labels on touch • Pure canon accuracy
            </p>
          </motion.div>

          {/* Real LCARS Panel Layout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-12 gap-2 mb-16"
          >
            {/* Left purple elbow bar – navigation */}
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
              <LCARSSlab 
                className="h-24"
                variant="secondary"
                active={activePage === 'warp'}
                showLabel="active"
                onTap={() => setActivePage('warp')}
              >
                WARP SYSTEMS
              </LCARSSlab>
              <LCARSSlab 
                className="h-24"
                variant="secondary"
                active={activePage === 'shields'}
                showLabel="active"
                onTap={() => setActivePage('shields')}
              >
                SHIELDS
              </LCARSSlab>
              <LCARSSlab 
                className="h-24"
                variant="secondary"
                active={activePage === 'tactical'}
                showLabel="active"
                onTap={() => setActivePage('tactical')}
              >
                TACTICAL
              </LCARSSlab>
              <LCARSSlab 
                className="h-32"
                variant="secondary"
                active={activePage === 'library'}
                showLabel="active"
                onTap={() => setActivePage('library')}
              >
                LIBRARY COMPUTER
              </LCARSSlab>
            </div>

            {/* Main area – orange primary actions */}
            <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
              <div className="flex gap-4">
                <LCARSSlab 
                  onTap={() => {
                    setEngageActive(true);
                    setClickCount(c => c + 1);
                    setTimeout(() => setEngageActive(false), 800);
                  }}
                  className="h-32 flex-1"
                  variant="primary"
                  active={engageActive}
                  showLabel="always"
                  withPulse
                >
                  ENGAGE
                </LCARSSlab>
                <LCARSSlab 
                  onTap={() => {
                    setAlertActive(!alertActive);
                  }}
                  className="h-32 w-48"
                  variant="alert"
                  active={alertActive}
                  showLabel="always"
                  withPulse={alertActive}
                >
                  RED ALERT
                </LCARSSlab>
              </div>

              {/* Status slabs – blue, no interaction */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <LCARSSlab className="h-24" variant="info" showLabel="always">
                  SHIELDS 98%
                </LCARSSlab>
                <LCARSSlab className="h-24" variant="info" showLabel="always">
                  HULL 100%
                </LCARSSlab>
                <LCARSSlab className="h-24" variant="info" showLabel="always">
                  POWER 95%
                </LCARSSlab>
                <LCARSSlab className="h-24" variant="info" showLabel="always">
                  LIFE SUPPORT
                </LCARSSlab>
              </div>

              {/* Accent action slabs */}
              <div className="grid grid-cols-3 gap-4">
                <LCARSSlab className="h-20" variant="accent" showLabel="hover">
                  TRANSPORTER
                </LCARSSlab>
                <LCARSSlab className="h-20" variant="accent" showLabel="hover">
                  REPLICATOR
                </LCARSSlab>
                <LCARSSlab className="h-20" variant="accent" showLabel="hover">
                  HOLODECK
                </LCARSSlab>
              </div>
            </div>
          </motion.div>

          {/* Interactive Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/50 px-12 py-8 backdrop-blur-xl">
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Panel Interactions</p>
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

          {/* Label Display Modes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-center text-orange-400 mb-8">LABEL DISPLAY MODES</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-center text-gray-400 text-sm uppercase">Always Visible</p>
                <LCARSSlab className="h-24" variant="primary" showLabel="always">
                  NAVIGATION
                </LCARSSlab>
              </div>
              <div className="space-y-4">
                <p className="text-center text-gray-400 text-sm uppercase">Show on Hover</p>
                <LCARSSlab className="h-24" variant="secondary" showLabel="hover">
                  SENSORS
                </LCARSSlab>
              </div>
              <div className="space-y-4">
                <p className="text-center text-gray-400 text-sm uppercase">Show When Active</p>
                <LCARSSlab className="h-24" variant="accent" showLabel="active">
                  TAP TO ACTIVATE
                </LCARSSlab>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="p-8 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 backdrop-blur-sm">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-bold text-orange-400 mb-2">Canon Accurate</h4>
              <p className="text-gray-400 text-sm">Flush panels with no visible borders until activated</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 backdrop-blur-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-bold text-purple-400 mb-2">Touch Response</h4>
              <p className="text-gray-400 text-sm">White flash + color change + haptic feedback</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 backdrop-blur-sm">
              <div className="text-4xl mb-4">📐</div>
              <h4 className="text-xl font-bold text-cyan-400 mb-2">Pure Rectangles</h4>
              <p className="text-gray-400 text-sm">Size and position define hierarchy, not decoration</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LCARSShowcase;

import React from 'react';
import { cn } from '@/lib/utils';

interface Section31PanelProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  status?: 'active' | 'locked' | 'classified' | 'offline';
}

const statusConfig = {
  active: {
    gradient: 'from-emerald-500 to-cyan-400',
    border: 'border-emerald-500',
    text: 'text-emerald-300',
    bg: 'bg-emerald-600/20',
  },
  locked: {
    gradient: 'from-red-600 to-orange-500',
    border: 'border-red-500',
    text: 'text-red-300',
    bg: 'bg-red-600/20',
  },
  classified: {
    gradient: 'from-purple-600 to-pink-500',
    border: 'border-purple-500',
    text: 'text-purple-300',
    bg: 'bg-purple-600/20',
  },
  offline: {
    gradient: 'from-gray-700 to-gray-900',
    border: 'border-gray-500',
    text: 'text-gray-300',
    bg: 'bg-gray-600/20',
  },
};

export const Section31Panel: React.FC<Section31PanelProps> = ({
  className,
  children,
  title = 'SECTION 31',
  status = 'classified',
}) => {
  const statusStyle = statusConfig[status];

  return (
    <div
      className={cn(
        'relative bg-black border-2 border-gray-800 rounded-lg overflow-hidden',
        'font-mono tracking-wider',
        'shadow-2xl shadow-black',
        className
      )}
    >
      {/* Animated scanning line background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-600/30 to-transparent animate-pulse" />
        <div
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-section31-scan"
        />
      </div>

      {/* Top bar - Section 31 signature */}
      <div className="relative border-b-4 border-gray-700 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Section 31 Symbol (black badge) */}
            <div className="w-12 h-12 bg-black border-2 border-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/60">
              <span className="text-purple-400 font-bold text-xl">31</span>
            </div>

            <h2 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400">
              {title}
            </h2>
          </div>

          {/* Status indicator */}
          <div
            className={cn(
              'px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border-2',
              'backdrop-blur-sm animate-pulse',
              statusStyle.bg,
              statusStyle.border,
              statusStyle.text
            )}
          >
            {status}
          </div>
        </div>

        {/* LCARS-style elbow connectors */}
        <div className="absolute left-0 top-full w-20 h-8 bg-gradient-to-r from-purple-600 to-transparent opacity-60" />
        <div className="absolute right-0 top-full w-32 h-12 bg-gradient-to-l from-emerald-600 to-transparent opacity-50" />
      </div>

      {/* Main content area */}
      <div className="relative p-6 text-emerald-300">
        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {children || (
          <div className="space-y-6 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['AGENT', 'CLEARANCE', 'DIRECTIVE', 'PROTOCOL'].map((label) => (
                <div key={label} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded blur-sm group-hover:opacity-100 opacity-50 transition-opacity" />
                  <div className="relative bg-gray-900/90 border border-gray-700 rounded p-4 backdrop-blur">
                    <div className="text-cyan-400 text-xs uppercase tracking-widest">{label}</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-2 animate-section31-flicker">
                      ████-██
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center py-8">
              <p className="text-purple-400 text-sm uppercase tracking-widest opacity-60">
                All records encrypted • Quantum key rotation active
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className="h-2 bg-gradient-to-r from-purple-700 via-emerald-600 to-cyan-500 opacity-80" />
    </div>
  );
};

export default Section31Panel;

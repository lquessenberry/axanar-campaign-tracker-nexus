import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const CosmicBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 100 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  
  const glowX = useTransform(x, [0, 1], ['40%', '60%']);
  const glowY = useTransform(y, [0, 1], ['40%', '60%']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base cosmic gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-nebula-dark via-background to-nebula-dark" />
      
      {/* Animated mouse-following glow orb */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl"
        style={{
          left: glowX,
          top: glowY,
          background: 'radial-gradient(circle, hsl(var(--nebula-purple)) 0%, hsl(var(--nebula-cyan)) 50%, transparent 70%)',
          x: '-50%',
          y: '-50%',
        }}
      />
      
      {/* Secondary glow layers */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-nebula-purple/20 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-nebula-cyan/20 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-nebula-pink/20 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      
      {/* Starfield */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `pulse-glow ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
    </div>
  );
};

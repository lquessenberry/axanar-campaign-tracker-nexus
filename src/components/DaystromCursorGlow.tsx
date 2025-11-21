import { useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

/**
 * Daystrom Design System - Global Cursor Glow (Proponent #7)
 * Single radial gradient that follows the mouse
 */
export function DaystromCursorGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const glowBackground = useMotionTemplate`
    radial-gradient(600px circle at ${mouseX}px ${mouseY}px, 
    hsl(var(--primary) / 0.15), transparent 80%)
  `;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-cursor-glow"
      style={{ background: glowBackground }}
    />
  );
}

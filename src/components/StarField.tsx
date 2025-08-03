
import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  color: string;
  size: number;
  twinkle: number;
  twinkleSpeed: number;
  vx: number; // velocity x
  vy: number; // velocity y
}

const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars();
    };

    const initializeStars = () => {
      const numStars = 200;
      const stars: Star[] = [];
      
      // Star color probabilities (TOS era style)
      const starColors = [
        { color: '#FFFFFF', weight: 85 }, // White stars (most common)
        { color: '#FFD700', weight: 8 },  // Yellow stars
        { color: '#FF6B6B', weight: 4 },  // Red stars
        { color: '#00FF7F', weight: 2 },  // Green stars
        { color: '#87CEEB', weight: 1 }   // Blue stars (rare)
      ];

      const getRandomStarColor = () => {
        const rand = Math.random() * 100;
        let cumulative = 0;
        for (const starColor of starColors) {
          cumulative += starColor.weight;
          if (rand <= cumulative) return starColor.color;
        }
        return starColors[0].color;
      };

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          color: getRandomStarColor(),
          size: Math.random() * 2 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          vx: (Math.random() - 0.5) * 0.2, // slow horizontal drift
          vy: (Math.random() - 0.5) * 0.2  // slow vertical drift
        });
      }
      
      starsRef.current = stars;
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // Update position with gentle drift
        star.x += star.vx;
        star.y += star.vy;
        
        // Wrap around screen edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
        
        // Update twinkle
        star.twinkle += star.twinkleSpeed;
        
        // Calculate opacity based on twinkle
        const opacity = 0.6 + 0.4 * Math.sin(star.twinkle);
        
        // Draw star with glow effect
        const glowSize = star.size * 3;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, glowSize
        );
        gradient.addColorStop(0, `${star.color}${Math.floor(opacity * 0.8 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Main star
        ctx.fillStyle = `${star.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Bright center for larger stars
        if (star.size > 1.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        background: 'linear-gradient(to bottom, #000000, #0a0a0a)',
        zIndex: 1
      }}
    />
  );
};

export default StarField;

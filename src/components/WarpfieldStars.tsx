import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  color: string;
  type: 'white' | 'red' | 'yellow' | 'blue';
  brightness: number;
  baseSize: number;
  twinklePhase: number;
  speed: number;
  trail: { x: number; y: number; opacity: number }[];
}

const WarpfieldStars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star color configurations
    const starTypes = [
      { type: 'white' as const, color: '#F1F0FB', weight: 70, size: 1.0, speed: 1.0 },
      { type: 'red' as const, color: '#FF6B6B', weight: 15, size: 1.2, speed: 0.8 },
      { type: 'yellow' as const, color: '#FFD93D', weight: 10, size: 1.1, speed: 0.9 },
      { type: 'blue' as const, color: '#4ECDC4', weight: 5, size: 1.3, speed: 0.7 }
    ];

    const getRandomStarType = () => {
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const starType of starTypes) {
        cumulative += starType.weight;
        if (rand <= cumulative) return starType;
      }
      return starTypes[0];
    };

    // Initialize stars - keeping 400 but with varied properties
    const numStars = 400;
    const stars: Star[] = [];
    
    for (let i = 0; i < numStars; i++) {
      const starType = getRandomStarType();
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000,
        prevX: 0,
        prevY: 0,
        color: starType.color,
        type: starType.type,
        brightness: 0.7 + Math.random() * 0.3,
        baseSize: starType.size * (0.8 + Math.random() * 0.4),
        twinklePhase: Math.random() * Math.PI * 2,
        speed: starType.speed * (0.8 + Math.random() * 0.4),
        trail: []
      });
    }
    
    starsRef.current = stars;

    const animate = () => {
      timeRef.current += 0.016; // ~60fps timing

      // Darker background with subtle transparency for trail effects
      ctx.fillStyle = 'rgba(26, 31, 44, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      starsRef.current.forEach((star) => {
        // Store previous position for trail
        const currentX = star.x / star.z * 300 + centerX;
        const currentY = star.y / star.z * 300 + centerY;

        // Add current position to trail
        star.trail.unshift({ 
          x: currentX, 
          y: currentY, 
          opacity: 1 
        });

        // Limit trail length and fade opacity
        if (star.trail.length > 15) star.trail.pop();
        star.trail.forEach((point, index) => {
          point.opacity = Math.max(0, 1 - (index / 15));
        });

        star.prevX = currentX;
        star.prevY = currentY;

        // Much slower movement - varies by star type and individual speed
        star.z -= 1.2 * star.speed;

        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
          star.z = 1000;
          star.trail = []; // Reset trail
        }

        const x = star.x / star.z * 300 + centerX;
        const y = star.y / star.z * 300 + centerY;

        const opacity = (1 - star.z / 1000) * star.brightness;
        
        // Twinkling effect
        const twinkle = 0.8 + 0.2 * Math.sin(star.twinklePhase + timeRef.current * 3);
        const size = (1 - star.z / 1000) * star.baseSize * twinkle;

        // Draw enhanced spectral trail
        if (star.trail.length > 1) {
          for (let i = 1; i < star.trail.length; i++) {
            const trailOpacity = opacity * star.trail[i].opacity * 0.6;
            const trailSize = size * (1 - i / star.trail.length) * 0.8;
            
            // Trail line with gradient effect
            const gradient = ctx.createLinearGradient(
              star.trail[i-1].x, star.trail[i-1].y,
              star.trail[i].x, star.trail[i].y
            );
            gradient.addColorStop(0, `${star.color}${Math.floor(trailOpacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${star.color}${Math.floor(trailOpacity * 0.3 * 255).toString(16).padStart(2, '0')}`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(0.5, trailSize);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(star.trail[i-1].x, star.trail[i-1].y);
            ctx.lineTo(star.trail[i].x, star.trail[i].y);
            ctx.stroke();
          }
        }

        // Draw main star with glow effect
        const glowSize = size * 3;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glowGradient.addColorStop(0, `${star.color}${Math.floor(opacity * 0.3 * 255).toString(16).padStart(2, '0')}`);
        glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Main star core
        ctx.fillStyle = `${star.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Bright center highlight for larger stars
        if (size > 1.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Update twinkle phase
        star.twinklePhase += 0.02;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

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
      style={{ background: 'transparent' }}
    />
  );
};

export default WarpfieldStars;

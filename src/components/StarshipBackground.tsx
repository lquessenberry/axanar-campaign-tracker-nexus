import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StarshipBackgroundProps {
  className?: string;
}

const StarshipBackground: React.FC<StarshipBackgroundProps> = ({ 
  className = "absolute top-10 left-10 w-32 h-32"
}) => {
  const { user } = useAuth();
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  // Fetch uploaded model files
  useEffect(() => {
    const fetchModels = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.storage
          .from('models')
          .list(user.id, {
            limit: 10,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) throw error;

        // Find the first .obj file
        const objFile = data?.find(file => file.name.toLowerCase().endsWith('.obj'));
        if (objFile) {
          const { data: publicData } = supabase.storage
            .from('models')
            .getPublicUrl(`${user.id}/${objFile.name}`);
          setModelUrl(publicData.publicUrl);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, [user]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });

    // Set renderer size to match container
    const container = mountRef.current;
    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 384; // Default to w-96 (384px)
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create a simple starship mesh if OBJ fails to load
    const createFallbackStarship = () => {
      const group = new THREE.Group();
      
      // Main hull
      const hullGeometry = new THREE.CylinderGeometry(0.3, 0.8, 3, 8);
      const hullMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        shininess: 100 
      });
      const hull = new THREE.Mesh(hullGeometry, hullMaterial);
      hull.rotation.z = Math.PI / 2;
      group.add(hull);

      // Nacelles
      const nacelleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 6);
      const nacelleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4444ff,
        emissive: 0x002244 
      });
      
      const nacelle1 = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
      nacelle1.position.set(0, 1, 0);
      nacelle1.rotation.z = Math.PI / 2;
      group.add(nacelle1);

      const nacelle2 = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
      nacelle2.position.set(0, -1, 0);
      nacelle2.rotation.z = Math.PI / 2;
      group.add(nacelle2);

      return group;
    };

    // Try to load uploaded OBJ model, fallback to simple mesh
    let starship: THREE.Object3D;

    if (modelUrl) {
      // TODO: Implement OBJLoader for uploaded models
      // For now, use fallback until we implement proper OBJ loading
      console.log('Using uploaded model URL:', modelUrl);
      starship = createFallbackStarship();
      scene.add(starship);
    } else {
      // Use fallback starship
      starship = createFallbackStarship();
      scene.add(starship);
    }

    // Position camera
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // Animation variables
    let time = 0;

    // Animation loop
    const animate = () => {
      time += 0.01;
      
      if (starship) {
        // Gentle floating motion
        starship.position.y = Math.sin(time * 2) * 0.3;
        starship.position.x = Math.cos(time * 1.5) * 0.2;
        
        // Slow rotation
        starship.rotation.y += 0.005;
        starship.rotation.z = Math.sin(time) * 0.1;
      }

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <div 
      ref={mountRef} 
      className={`${className} pointer-events-none opacity-60`}
      style={{ filter: 'drop-shadow(0 0 20px rgba(100, 140, 180, 0.6))' }}
    />
  );
};

export default StarshipBackground;
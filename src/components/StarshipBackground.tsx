import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
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
      
      // Main hull - oriented nose up
      const hullGeometry = new THREE.CylinderGeometry(0.3, 0.8, 3, 8);
      const hullMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        shininess: 100 
      });
      const hull = new THREE.Mesh(hullGeometry, hullMaterial);
      // No rotation needed - cylinder already points up by default
      group.add(hull);

      // Nacelles
      const nacelleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 6);
      const nacelleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4444ff,
        emissive: 0x002244 
      });
      
      const nacelle1 = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
      nacelle1.position.set(1, 0, 0);
      // No rotation needed for vertical orientation
      group.add(nacelle1);

      const nacelle2 = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
      nacelle2.position.set(-1, 0, 0);
      // No rotation needed for vertical orientation
      group.add(nacelle2);

      return group;
    };

    // Try to get the Ares 1650 model from Supabase storage
    const getAres1650ModelUrl = async (): Promise<string | null> => {
      try {
        // List files in the models bucket to find the Ares 1650 model
        const { data: files, error } = await supabase.storage
          .from('models')
          .list('', {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) throw error;

        // Look for Ares 1650 starship model (various possible names)
        const ares1650File = files?.find(file => 
          file.name.toLowerCase().includes('ares') && 
          file.name.toLowerCase().includes('1650') &&
          file.name.toLowerCase().endsWith('.obj')
        ) || files?.find(file => 
          file.name.toLowerCase().includes('starship') &&
          file.name.toLowerCase().endsWith('.obj')
        );

        if (ares1650File) {
          const { data: publicData } = supabase.storage
            .from('models')
            .getPublicUrl(ares1650File.name);
          
          console.log('Found Ares 1650 model:', ares1650File.name);
          return publicData.publicUrl;
        }

        return null;
      } catch (error) {
        console.error('Error fetching Ares 1650 model from storage:', error);
        return null;
      }
    };

    // Load models from Supabase storage
    let starship: THREE.Object3D;
    
    const loadModelsFromStorage = async () => {
      try {
        const loader = new OBJLoader();
        
        // Try to get Ares 1650 model from Supabase storage first
        const ares1650ModelUrl = await getAres1650ModelUrl();
        
        if (ares1650ModelUrl) {
          // Load the Ares 1650 model from storage
          const object = await new Promise<THREE.Object3D>((resolve, reject) => {
            loader.load(
              ares1650ModelUrl,
              (loadedObject) => {
                console.log('Ares 1650 model loaded successfully');
                
                // Apply materials to make it look like a starship
                loadedObject.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshPhongMaterial({ 
                      color: 0xcccccc,
                      shininess: 100,
                      specular: 0x222222
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                });
                
                // Scale and position the model
                const box = new THREE.Box3().setFromObject(loadedObject);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = maxDim > 0 ? 4 / maxDim : 1;
                loadedObject.scale.setScalar(scale);
                
                // Center the model
                const center = box.getCenter(new THREE.Vector3());
                loadedObject.position.sub(center.multiplyScalar(scale));
                
                // Orient starship nose up (rotate 90 degrees around X-axis)
                loadedObject.rotation.x = -Math.PI / 2;
                
                resolve(loadedObject);
              },
              undefined,
              (error) => {
                console.log('Ares 1650 model failed to load:', error);
                reject(error);
              }
            );
          });
          
          starship = object;
          scene.add(starship);
          
        } else {
          // Fallback to user uploaded model or simple mesh
          if (modelUrl) {
            try {
              const object = await new Promise<THREE.Object3D>((resolve, reject) => {
                loader.load(
                  modelUrl,
                  (loadedObject) => {
                    console.log('User uploaded model loaded successfully');
                    
                    loadedObject.traverse((child) => {
                      if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({ 
                          color: 0xaaaaaa,
                          shininess: 80
                        });
                      }
                    });
                    
                    const box = new THREE.Box3().setFromObject(loadedObject);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = maxDim > 0 ? 4 / maxDim : 1;
                    loadedObject.scale.setScalar(scale);
                    
                    // Center and orient the model
                    const center = box.getCenter(new THREE.Vector3());
                    loadedObject.position.sub(center.multiplyScalar(scale));
                    loadedObject.rotation.x = -Math.PI / 2;
                    
                    resolve(loadedObject);
                  },
                  undefined,
                  reject
                );
              });
              
              starship = object;
              scene.add(starship);
            } catch (userModelError) {
              console.log('User model failed to load, using fallback mesh');
              starship = createFallbackStarship();
              scene.add(starship);
            }
          } else {
            console.log('No models available, using fallback mesh');
            starship = createFallbackStarship();
            scene.add(starship);
          }
        }
      } catch (error) {
        console.error('Error loading models:', error);
        starship = createFallbackStarship();
        scene.add(starship);
      }
    };
    
    loadModelsFromStorage();

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
        
        // Keep starship stationary (no rotation)
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
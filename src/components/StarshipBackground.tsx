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
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 6000); // Increased far plane
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

    // Add brighter lights for better texture visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Increased intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); // Increased intensity
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Add additional light from the opposite side
    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // Create a simple starship mesh if OBJ fails to load
    const createFallbackStarship = () => {
      const group = new THREE.Group();
      
      // Main hull - oriented nose up
      const hullGeometry = new THREE.CylinderGeometry(1.8, 4.8, 18, 8); // 6x larger
      const hullMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        shininess: 100 
      });
      const hull = new THREE.Mesh(hullGeometry, hullMaterial);
      // No rotation needed - cylinder already points up by default
      group.add(hull);

      // Nacelles
      const nacelleGeometry = new THREE.CylinderGeometry(1.2, 1.2, 12, 6); // 6x larger
      const nacelleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4444ff,
        emissive: 0x002244 
      });
      
      const nacelle1 = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
      nacelle1.position.set(6, 0, 0); // 6x larger spacing
      // No rotation needed for vertical orientation
      group.add(nacelle1);

      const nacelle2 = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
      nacelle2.position.set(-6, 0, 0); // 6x larger spacing
      // No rotation needed for vertical orientation
      group.add(nacelle2);

      
      // Add warp trails
      const createWarpTrail = (xOffset: number) => {
        const trailGroup = new THREE.Group();
        
        // Create multiple trail segments for a flowing effect
        for (let i = 0; i < 8; i++) {
          const trailGeometry = new THREE.CylinderGeometry(0.1 + i * 0.05, 0.2 + i * 0.08, 3 + i * 0.5, 8);
          const trailMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00aaff,
            transparent: true,
            opacity: 0.8 - (i * 0.1)
          });
          const trail = new THREE.Mesh(trailGeometry, trailMaterial);
          trail.position.set(xOffset, -12 - (i * 3), 0);
          trailGroup.add(trail);
        }
        
        return trailGroup;
      };

      // Add warp trails to nacelles
      group.add(createWarpTrail(6));  // Right nacelle trail
      group.add(createWarpTrail(-6)); // Left nacelle trail

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
    let warpTrails: THREE.Group[] = [];
    
    // Create warp trail effects
    const createWarpTrails = () => {
      const trails: THREE.Group[] = [];
      
      // Create two main warp trails
      for (let side = 0; side < 2; side++) {
        const trailGroup = new THREE.Group();
        const xOffset = side === 0 ? 12 : -12; // Position trails at nacelle locations
        
        // Create flowing trail particles
        for (let i = 0; i < 12; i++) {
          const trailGeometry = new THREE.CylinderGeometry(
            0.2 + i * 0.1, 
            0.4 + i * 0.15, 
            4 + i * 0.8, 
            8
          );
          const trailMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(0.6, 1, 0.5 + Math.random() * 0.3),
            transparent: true,
            opacity: 0.9 - (i * 0.07)
          });
          const trail = new THREE.Mesh(trailGeometry, trailMaterial);
          trail.position.set(xOffset, -20 - (i * 4), 0);
          trailGroup.add(trail);
        }
        
        trails.push(trailGroup);
        scene.add(trailGroup);
      }
      
      return trails;
    };
    
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
                const scale = maxDim > 0 ? 24 / maxDim : 6; // 6x larger
                loadedObject.scale.setScalar(scale);
                
                // Center the model
                const center = box.getCenter(new THREE.Vector3());
                loadedObject.position.sub(center.multiplyScalar(scale));
                
                // Orient starship nose up (rotate 90 degrees around X-axis)
                loadedObject.rotation.x = -Math.PI / 2;
                
                // Add warp trails for loaded models
                warpTrails = createWarpTrails();
                
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
                    async (loadedObject) => {
                      console.log('User uploaded model loaded successfully');
                      
                      // Load textures from public folder
                      try {
                        const textureLoader = new THREE.TextureLoader();
                        
                        console.log('Loading textures from public folder...');
                        
                        // Load hull and nacelle textures from public folder
                        const hullTexture = await new Promise<THREE.Texture>((texResolve, texReject) => {
                          textureLoader.load('/textures/hull-texture-1.png', texResolve, undefined, texReject);
                        });
                        
                        const nacelleTexture = await new Promise<THREE.Texture>((texResolve, texReject) => {
                          textureLoader.load('/textures/nacelle-glow-orange.png', texResolve, undefined, texReject);
                        });
                        
                        console.log('Both textures loaded successfully from public folder');
                        
                        // Configure textures
                        [hullTexture, nacelleTexture].forEach(texture => {
                          texture.wrapS = THREE.RepeatWrapping;
                          texture.wrapT = THREE.RepeatWrapping;
                          texture.flipY = false;
                          texture.needsUpdate = true;
                        });
                        
                        // Apply textures to meshes based on their names/parts
                        let meshCount = 0;
                        loadedObject.traverse((child) => {
                          if (child instanceof THREE.Mesh) {
                            meshCount++;
                            const meshName = (child.name || '').toLowerCase();
                            console.log(`Processing mesh ${meshCount}: "${child.name || 'unnamed'}"`);
                            
                            // Check if this is a nacelle part
                            if (meshName.includes('nacelle') || meshName.includes('engine') || meshName.includes('warp')) {
                              console.log('Applying ORANGE GLOW texture to nacelle mesh');
                              child.material = new THREE.MeshPhongMaterial({ 
                                map: nacelleTexture,
                                side: THREE.DoubleSide,
                                shininess: 10,
                                emissive: 0xff4400, // Bright orange glow
                                emissiveMap: nacelleTexture,
                                emissiveIntensity: 0.5,
                                transparent: true,
                                opacity: 1.0
                              });
                            } else {
                              console.log('Applying HULL texture to main mesh');
                              child.material = new THREE.MeshPhongMaterial({ 
                                map: hullTexture,
                                side: THREE.DoubleSide,
                                shininess: 50,
                                specular: 0x666666,
                                emissive: 0x111111,
                                transparent: true,
                                opacity: 1.0
                              });
                            }
                          }
                        });
                        
                        console.log(`Processed ${meshCount} meshes with proper textures`);
                      } catch (textureError) {
                        console.error('Failed to load texture:', textureError);
                        // Fallback to default material
                        loadedObject.traverse((child) => {
                          if (child instanceof THREE.Mesh) {
                            child.material = new THREE.MeshPhongMaterial({ 
                              color: 0xaaaaaa,
                              shininess: 80
                            });
                          }
                        });
                      }
                      
                      // Add warp trails for user models
                      warpTrails = createWarpTrails();
                      
                      // Scale and position the model
                      const box = new THREE.Box3().setFromObject(loadedObject);
                      const size = box.getSize(new THREE.Vector3());
                      const maxDim = Math.max(size.x, size.y, size.z);
                      const scale = maxDim > 0 ? 24 / maxDim : 6; // 6x larger
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

    // Position camera further back for larger model
    camera.position.set(0, 0, 48); // 6x further back
    camera.lookAt(0, 0, 0);

    // Animation variables
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let currentYaw = 0;
    let currentPitch = 0;
    let isMouseActive = false;
    let mouseTimeout: NodeJS.Timeout;
    
    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Normalize mouse position (-1 to 1)
      mouseX = (event.clientX - centerX) / (rect.width / 2);
      mouseY = (event.clientY - centerY) / (rect.height / 2);
      
      // Calculate target rotations
      targetYaw = mouseX * 0.3; // Max 0.3 radians yaw
      targetPitch = -mouseY * 0.2; // Max 0.2 radians pitch (inverted Y)
      
      isMouseActive = true;
      
      // Reset timeout
      if (mouseTimeout) clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        isMouseActive = false;
      }, 2000); // 2 seconds of inactivity
    };
    
    // Add mouse listener to the container
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseMove);
    container.addEventListener('mouseleave', () => {
      isMouseActive = false;
      if (mouseTimeout) clearTimeout(mouseTimeout);
    });

    // Animation loop
    const animate = () => {
      time += 0.01;
      
      if (starship) {
        if (isMouseActive) {
          // Mouse-controlled movement
          currentYaw += (targetYaw - currentYaw) * 0.1; // Smooth interpolation
          currentPitch += (targetPitch - currentPitch) * 0.1;
          
          // Apply mouse rotations
          starship.rotation.y = currentYaw;
          starship.rotation.x = -Math.PI / 2 + currentPitch; // Keep nose up orientation
          
          // Gentle floating motion (reduced when mouse active)
          starship.position.y = Math.sin(time * 2) * 0.9; // Reduced movement
          starship.position.x = Math.cos(time * 1.5) * 0.6; // Reduced movement
        } else {
          // Floating motion only
          currentYaw += (0 - currentYaw) * 0.05; // Return to center
          currentPitch += (0 - currentPitch) * 0.05;
          
          starship.rotation.y = currentYaw;
          starship.rotation.x = -Math.PI / 2 + currentPitch;
          
          // Full floating motion when inactive
          starship.position.y = Math.sin(time * 2) * 1.8; // Full movement
          starship.position.x = Math.cos(time * 1.5) * 1.2; // Full movement
        }
        
        // Animate warp trails
        warpTrails.forEach((trailGroup, groupIndex) => {
          trailGroup.children.forEach((trail, index) => {
            if (trail instanceof THREE.Mesh) {
              // Flowing animation
              trail.material.opacity = (0.9 - (index * 0.07)) * (0.7 + 0.3 * Math.sin(time * 3 + index * 0.5));
              // Slight movement for flow effect
              trail.position.y = -20 - (index * 4) + Math.sin(time * 2 + index * 0.3) * 0.5;
            }
          });
        });
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
      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <div 
      ref={mountRef} 
      className={`${className} pointer-events-auto opacity-60`}
      style={{ filter: 'drop-shadow(0 0 20px rgba(100, 140, 180, 0.6))' }}
    />
  );
};

export default StarshipBackground;
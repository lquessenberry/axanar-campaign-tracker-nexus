import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Download, Eye } from 'lucide-react';

interface UnifiedPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: 'obj' | 'texture';
}

const UnifiedPreviewModal: React.FC<UnifiedPreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const modelRef = useRef<THREE.Object3D>();
  const animationRef = useRef<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [optimizedImageUrl, setOptimizedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (fileType === 'obj') {
      if (mountRef.current) {
        initThreeJS();
        loadModel();
      }
    } else {
      // For texture files, optimize if needed
      optimizeImageForWeb();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, fileUrl, fileType]);

  const optimizeImageForWeb = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check file size and type
      const response = await fetch(fileUrl, { method: 'HEAD' });
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      const contentType = response.headers.get('content-type') || '';
      
      // If file is large (>5MB) or is TGA, create optimized version
      if (contentLength > 5 * 1024 * 1024 || fileName.toLowerCase().endsWith('.tga')) {
        await createOptimizedImage();
      } else {
        setOptimizedImageUrl(fileUrl);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error optimizing image:', err);
      setOptimizedImageUrl(fileUrl); // Fallback to original
      setLoading(false);
    }
  };

  const createOptimizedImage = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate optimal size (max 2048px on longest side)
          const maxSize = 2048;
          let { width, height } = img;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const optimizedUrl = URL.createObjectURL(blob);
              setOptimizedImageUrl(optimizedUrl);
              setLoading(false);
              resolve();
            } else {
              reject(new Error('Failed to create optimized image'));
            }
          }, 'image/jpeg', 0.85);
          
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        // Fallback to original image
        setOptimizedImageUrl(fileUrl);
        setLoading(false);
        resolve();
      };

      img.src = fileUrl;
    });
  };

  const initThreeJS = () => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);

    // Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !modelRef.current) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      modelRef.current.rotation.y += deltaMove.x * 0.01;
      modelRef.current.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!cameraRef.current) return;
      
      const delta = event.deltaY * 0.01;
      cameraRef.current.position.z += delta;
      cameraRef.current.position.z = Math.max(1, Math.min(20, cameraRef.current.position.z));
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const loadModel = async () => {
    if (!sceneRef.current) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Starting OBJ load for:', fileUrl);
      
      // Dynamically import OBJLoader to avoid build issues
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      const loader = new OBJLoader();
      
      // Add CORS headers and error handling
      loader.load(
        fileUrl,
        (object) => {
          console.log('OBJ loaded successfully:', object);
          
          // Apply basic material
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshPhongMaterial({ 
                color: 0x888888,
                shininess: 100 
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Center and scale the model
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          console.log('Model dimensions:', size);
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? 3 / maxDim : 1;
          object.scale.setScalar(scale);
          object.position.sub(center.multiplyScalar(scale));

          // Remove previous model
          if (modelRef.current && sceneRef.current) {
            sceneRef.current.remove(modelRef.current);
          }
          
          if (sceneRef.current) {
            sceneRef.current.add(object);
            modelRef.current = object;
          }

          setLoading(false);
          console.log('Model successfully added to scene');
        },
        (progress) => {
          console.log('Loading progress:', progress);
        },
        (error: any) => {
          console.error('Error loading OBJ:', error);
          setError(`Failed to load OBJ file: ${error?.message || 'Unknown error'}`);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error in loadModel:', err);
      setError(`Failed to load 3D model: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (rendererRef.current && mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    if (sceneRef.current) {
      sceneRef.current.clear();
    }

    // Clean up optimized image URL
    if (optimizedImageUrl && optimizedImageUrl !== fileUrl) {
      URL.revokeObjectURL(optimizedImageUrl);
    }
  };

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
    }
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(1, cameraRef.current.position.z - 1);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(20, cameraRef.current.position.z + 1);
    }
  };

  const downloadOriginal = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {fileType === 'obj' ? '3D Model' : 'Texture'} Preview: {fileName}
          </DialogTitle>
          <DialogDescription>
            {fileType === 'obj' 
              ? 'Interactive 3D preview of the uploaded model. Drag to rotate, scroll to zoom.'
              : 'Texture image preview with web optimization for large files.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {fileType === 'obj' ? (
                <>
                  <Button variant="outline" size="sm" onClick={resetCamera}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset View
                  </Button>
                  <Button variant="outline" size="sm" onClick={zoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={zoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={downloadOriginal}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Original
                </Button>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {fileType === 'obj' ? 'Drag to rotate • Scroll to zoom' : 'High-quality preview'}
            </div>
          </div>

          {/* Preview Area */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>{fileType === 'obj' ? 'Loading 3D model...' : 'Optimizing image for web...'}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                <div className="text-center text-red-400">
                  <p>Error: {error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fileType === 'obj' ? loadModel : optimizeImageForWeb}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            
            {fileType === 'obj' ? (
              <div 
                ref={mountRef} 
                className="w-full h-[600px] flex items-center justify-center"
              />
            ) : (
              <div className="w-full h-[600px] flex items-center justify-center p-4">
                {optimizedImageUrl && (
                  <img
                    src={optimizedImageUrl}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain rounded"
                    onLoad={() => setImageLoaded(true)}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>File:</strong> {fileName}</p>
            <p><strong>Type:</strong> {fileType === 'obj' ? '3D Model (.obj)' : 'Texture Image'}</p>
            {fileType === 'obj' ? (
              <p><strong>Controls:</strong> Drag to rotate • Scroll to zoom • Use buttons above for reset and zoom</p>
            ) : (
              <p><strong>Note:</strong> Large images are automatically optimized for web viewing. Use "Download Original" for the full-quality file.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedPreviewModal;
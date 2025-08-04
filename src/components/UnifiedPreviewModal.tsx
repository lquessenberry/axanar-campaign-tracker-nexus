import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Download, Zap } from 'lucide-react';
import { useOptimizedModelLoader } from '@/hooks/useOptimizedModelLoader';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [optimizedImageUrl, setOptimizedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const { 
    loadModel, 
    loading: modelLoading, 
    error: modelError, 
    progress, 
    loadStats
  } = useOptimizedModelLoader({
    onLoadStart: () => console.log('🚀 Starting optimized model load'),
    onLoadComplete: (object) => {
      if (sceneRef.current) {
        // Remove previous model
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
        }
        
        // Add new model
        modelRef.current = object;
        sceneRef.current.add(object);
        console.log('✅ Model added to scene');
      }
    },
    onError: (errorMsg) => console.error('❌ Model load error:', errorMsg)
  });

  useEffect(() => {
    if (!isOpen) return;

    if (fileType === 'obj') {
      if (mountRef.current) {
        initThreeJS();
        loadOptimizedModel();
      }
    } else {
      // For texture files, optimize if needed
      optimizeImageForWeb();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, fileUrl, fileType]);

  const loadOptimizedModel = async () => {
    if (!sceneRef.current || !fileUrl) return;

    console.log('🔄 Loading OBJ model with optimization:', fileUrl);
    
    // Extract texture path and files if available
    const urlParts = fileUrl.split('/');
    const textureBasePath = urlParts.slice(0, -1).join('/');
    
    // Try common texture names
    const commonTextureNames = [
      'diffuse.webp', 'diffuse.jpg', 'diffuse.png', 'diffuse.tga',
      'albedo.webp', 'albedo.jpg', 'albedo.png', 'albedo.tga',
      'color.webp', 'color.jpg', 'color.png', 'color.tga'
    ];

    await loadModel(fileUrl, textureBasePath, commonTextureNames);
  };

  const optimizeImageForWeb = async () => {
    setImageLoading(true);
    setImageError(null);

    try {
      // Check file size and type
      const response = await fetch(fileUrl, { method: 'HEAD' });
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      const contentType = response.headers.get('content-type') || '';
      
      console.log('Image file info:', { fileName, contentLength, contentType });
      
      // If file is TGA or large (>5MB), create optimized version
      if (fileName.toLowerCase().endsWith('.tga') || contentLength > 5 * 1024 * 1024) {
        console.log('Creating optimized version for:', fileName);
        await createOptimizedImage();
      } else {
        console.log('Using original image:', fileName);
        setOptimizedImageUrl(fileUrl);
        setImageLoading(false);
      }
    } catch (err) {
      console.error('Error optimizing image:', err);
      // For TGA files that fail optimization, try to load them directly
      if (fileName.toLowerCase().endsWith('.tga')) {
        await loadTGAFile();
      } else {
        setOptimizedImageUrl(fileUrl); // Fallback to original
        setImageLoading(false);
      }
    }
  };

  const createOptimizedImage = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // For TGA files, use the specialized TGA loader
      if (fileName.toLowerCase().endsWith('.tga')) {
        loadTGAFile().then(resolve).catch(reject);
        return;
      }
      
      // For other image formats, convert to PNG for better quality
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

          // Calculate optimal size (max 2048px on longest side for textures)
          const maxSize = 2048;
          let { width, height } = img;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to PNG for texture compatibility
          canvas.toBlob((blob) => {
            if (blob) {
              const optimizedUrl = URL.createObjectURL(blob);
              console.log('Image optimized to PNG:', { width, height });
              setOptimizedImageUrl(optimizedUrl);
              setImageLoading(false);
              resolve();
            } else {
              reject(new Error('Failed to create optimized PNG'));
            }
          }, 'image/png');
          
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        console.warn('Failed to load image, using original:', fileUrl);
        setOptimizedImageUrl(fileUrl);
        setImageLoading(false);
        resolve();
      };

      img.src = fileUrl;
    });
  };

  const loadTGAFile = async (): Promise<void> => {
    // TGA loading implementation would go here - simplified for now
    console.log('Loading TGA file:', fileUrl);
    setOptimizedImageUrl(fileUrl);
    setImageLoading(false);
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

  const isLoading = fileType === 'obj' ? modelLoading : imageLoading;
  const error = fileType === 'obj' ? modelError : imageError;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {fileType === 'obj' && <Zap className="w-5 h-5 text-blue-500" />}
            {fileName}
            {loadStats && (
              <span className="text-sm text-muted-foreground">
                ({Math.round(loadStats.loadTime)}ms, {loadStats.compressionSavings}% optimized)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            File Preview {fileType === 'obj' && 'with Optimized Loading'}
            {loadStats && loadStats.texturesApplied > 0 && (
              <span className="block text-xs text-green-600 mt-1">
                ✅ {loadStats.texturesApplied} optimized textures applied
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Loading Progress for OBJ files */}
          {fileType === 'obj' && modelLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading optimized model... {Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Loading for textures */}
          {fileType === 'texture' && imageLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Optimizing texture...</span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileType === 'obj' ? loadOptimizedModel() : optimizeImageForWeb()}
                className="mt-2"
              >
                Retry Load
              </Button>
            </div>
          )}
          
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
            
            <div className="text-sm text-muted-foreground flex items-center gap-4">
              <span>{fileType === 'obj' ? 'Drag to rotate • Scroll to zoom' : 'High-quality preview'}</span>
              {loadStats && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  🚀 {loadStats.compressionSavings}% faster
                </span>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
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
              <div>
                <p><strong>Controls:</strong> Drag to rotate • Scroll to zoom • Use buttons above for reset and zoom</p>
                {loadStats && (
                  <div className="flex items-center gap-4 text-xs mt-2">
                    <span>Load Time: {Math.round(loadStats.loadTime)}ms</span>
                    <span>Textures: {loadStats.texturesApplied}</span>
                    <span>Compression: {loadStats.compressionSavings}%</span>
                  </div>
                )}
              </div>
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
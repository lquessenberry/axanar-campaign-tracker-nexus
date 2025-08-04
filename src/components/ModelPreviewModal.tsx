import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Zap } from 'lucide-react';
import { useOptimizedModelLoader } from '@/hooks/useOptimizedModelLoader';
import { Progress } from '@/components/ui/progress';

interface ModelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  modelName: string;
}

const ModelPreviewModal: React.FC<ModelPreviewModalProps> = ({
  isOpen,
  onClose,
  modelUrl,
  modelName
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const modelRef = useRef<THREE.Object3D>();
  const animationRef = useRef<number>();
  const [zoom, setZoom] = useState(1);
  
  const { 
    loadModel, 
    loading, 
    error, 
    progress, 
    loadStats,
    getCacheStats 
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
    console.log('Modal effect triggered:', { isOpen, modelUrl, mountRef: !!mountRef.current });
    if (!isOpen || !mountRef.current) return;

    initThreeJS();
    loadOptimizedModel();

    return () => {
      cleanup();
    };
  }, [isOpen, modelUrl]);

  const initThreeJS = () => {
    console.log('Initializing Three.js');
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      800 / 600,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    console.log('Three.js setup complete, adding to DOM');
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);

    // Controls (manual rotation)
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

  const loadOptimizedModel = async () => {
    if (!sceneRef.current || !modelUrl) return;

    console.log('🔄 Loading model with optimization:', modelUrl);
    console.log('📝 Model name:', modelName);
    
    // For Supabase storage URLs, extract the proper texture base path
    let textureBasePath = '';
    let commonTextureNames: string[] = [];
    
    if (modelUrl.includes('supabase.co/storage')) {
      // This is a Supabase storage URL
      console.log('📦 Detected Supabase storage URL');
      
      // Extract the base path for textures (same directory as the model)
      const urlParts = modelUrl.split('/');
      textureBasePath = urlParts.slice(0, -1).join('/');
      
      // For now, just try to load the model without specific textures
      // In production, you'd get the texture list from your storage management
      commonTextureNames = [];
    } else {
      // Standard file path
      const urlParts = modelUrl.split('/');
      textureBasePath = urlParts.slice(0, -1).join('/');
      commonTextureNames = [
        'diffuse.webp', 'diffuse.jpg', 'diffuse.png', 'diffuse.tga',
        'albedo.webp', 'albedo.jpg', 'albedo.png', 'albedo.tga',
        'color.webp', 'color.jpg', 'color.png', 'color.tga'
      ];
    }

    await loadModel(modelUrl, textureBasePath, commonTextureNames);
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (rendererRef.current && mountRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    if (sceneRef.current) {
      sceneRef.current.clear();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev * 0.8, 0.1));
  };

  const handleResetView = () => {
    setZoom(1);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 8);
      cameraRef.current.lookAt(0, 0, 0);
    }
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleRetryLoad = () => {
    loadOptimizedModel();
  };

  // Apply zoom to camera
  useEffect(() => {
    if (cameraRef.current) {
      const baseDistance = 8;
      cameraRef.current.position.setLength(baseDistance / zoom);
    }
  }, [zoom]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            {modelName} 
            {loadStats && (
              <span className="text-sm text-muted-foreground">
                ({Math.round(loadStats.loadTime)}ms, {loadStats.compressionSavings}% optimized)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            3D Model Preview with Optimized Loading
            {loadStats && loadStats.texturesApplied > 0 && (
              <span className="block text-xs text-green-600 mt-1">
                ✅ {loadStats.texturesApplied} optimized textures applied
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Loading Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading optimized model... {Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryLoad}
                className="mt-2"
              >
                Retry Load
              </Button>
            </div>
          )}
          
          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset View
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground flex items-center gap-4">
              <span>Drag to rotate • Scroll to zoom</span>
              {loadStats && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  🚀 {loadStats.compressionSavings}% faster
                </span>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div 
              ref={mountRef} 
              className="w-full h-[600px] flex items-center justify-center"
            />
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Model:</strong> {modelName}</p>
            <p><strong>Controls:</strong> Drag to rotate • Scroll to zoom • Use buttons above for reset and zoom</p>
            {loadStats && (
              <div className="flex items-center gap-4 text-xs">
                <span>Load Time: {Math.round(loadStats.loadTime)}ms</span>
                <span>Textures: {loadStats.texturesApplied}</span>
                <span>Compression: {loadStats.compressionSavings}%</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelPreviewModal;
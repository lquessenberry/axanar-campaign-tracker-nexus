import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    initThreeJS();
    loadModel();

    return () => {
      cleanup();
    };
  }, [isOpen, modelUrl]);

  const initThreeJS = () => {
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

  const loadModel = async () => {
    if (!sceneRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // For now, create a placeholder model since OBJLoader needs to be imported
      // TODO: Implement proper OBJ loader
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        shininess: 100 
      });
      const placeholder = new THREE.Mesh(geometry, material);
      placeholder.castShadow = true;
      placeholder.receiveShadow = true;

      // Add some detail to make it look more like a spaceship
      const detail1 = new THREE.CylinderGeometry(0.3, 0.8, 3, 8);
      const detailMesh1 = new THREE.Mesh(detail1, new THREE.MeshPhongMaterial({ color: 0x4444ff }));
      detailMesh1.rotation.z = Math.PI / 2;
      detailMesh1.position.set(0, 1.5, 0);
      placeholder.add(detailMesh1);

      const detailMesh2 = new THREE.Mesh(detail1, new THREE.MeshPhongMaterial({ color: 0x4444ff }));
      detailMesh2.rotation.z = Math.PI / 2;
      detailMesh2.position.set(0, -1.5, 0);
      placeholder.add(detailMesh2);

      // Center the model
      const box = new THREE.Box3().setFromObject(placeholder);
      const center = box.getCenter(new THREE.Vector3());
      placeholder.position.sub(center);

      // Add to scene
      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current);
      }
      
      sceneRef.current.add(placeholder);
      modelRef.current = placeholder;

      setLoading(false);
    } catch (err) {
      console.error('Error loading model:', err);
      setError('Failed to load 3D model');
      setLoading(false);
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>3D Model Preview: {modelName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
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
            </div>
            
            <div className="text-sm text-muted-foreground">
              Drag to rotate • Scroll to zoom
            </div>
          </div>

          {/* Preview Area */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading 3D model...</p>
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
                    onClick={loadModel}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            
            <div 
              ref={mountRef} 
              className="w-full h-[600px] flex items-center justify-center"
            />
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground">
            <p><strong>Note:</strong> This is a preview using a placeholder model. Full OBJ file loading will be implemented in a future update.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelPreviewModal;
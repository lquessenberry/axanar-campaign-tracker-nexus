import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Text3D, useTexture, Sphere, Box } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Database, 
  Monitor, 
  Radar,
  Settings,
  Shield,
  Users,
  Zap
} from "lucide-react";
import * as THREE from 'three';

// 3D Scene Component for Minority Report style holographic display
const HolographicDisplay = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x += 0.002;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#00BFFF"
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>
      </Float>
      
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <Box args={[1.5, 0.1, 1.5]} position={[0, -2, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            transparent
            opacity={0.5}
          />
        </Box>
      </Float>

      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00BFFF" />
    </group>
  );
};

export function CageEraInterface() {
  const [activePanel, setActivePanel] = useState("systems");
  const [systemStatus, setSystemStatus] = useState({
    power: 87,
    shields: 95,
    weapons: 78,
    lifesupport: 99,
    navigation: 92
  });
  const [alertLevel, setAlertLevel] = useState<"normal" | "yellow" | "red">("normal");
  const [scanning, setScanning] = useState(false);

  const panels = [
    { id: "systems", label: "Systems", icon: Cpu },
    { id: "tactical", label: "Tactical", icon: Shield },
    { id: "sensors", label: "Sensors", icon: Radar },
    { id: "engineering", label: "Engineering", icon: Settings },
    { id: "science", label: "Science", icon: Monitor },
    { id: "medical", label: "Medical", icon: Activity }
  ];

  const getStatusColor = (value: number) => {
    if (value >= 90) return "text-green-400";
    if (value >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const startScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  useEffect(() => {
    // Simulate system fluctuations
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        power: Math.max(50, Math.min(100, prev.power + (Math.random() - 0.5) * 5)),
        shields: Math.max(50, Math.min(100, prev.shields + (Math.random() - 0.5) * 3)),
        weapons: Math.max(50, Math.min(100, prev.weapons + (Math.random() - 0.5) * 4)),
        lifesupport: Math.max(80, Math.min(100, prev.lifesupport + (Math.random() - 0.5) * 2)),
        navigation: Math.max(50, Math.min(100, prev.navigation + (Math.random() - 0.5) * 3))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,191,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,191,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center animate-pulse">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-cyan-300 font-mono tracking-wider">
                ENTERPRISE CONTROL INTERFACE
              </h1>
              <p className="text-blue-300 text-sm font-mono">Stardate: {new Date().toISOString().slice(0, 10).replace(/-/g, '.')}</p>
            </div>
          </div>
          
          <Badge 
            variant={alertLevel === "red" ? "destructive" : alertLevel === "yellow" ? "secondary" : "default"}
            className="text-lg px-4 py-2 animate-bounce"
          >
            {alertLevel.toUpperCase()} ALERT
          </Badge>
        </div>

        {/* Navigation Pills */}
        <div className="flex space-x-2 mb-8 p-2 bg-black/30 rounded-lg backdrop-blur-sm">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <Button
                key={panel.id}
                variant={activePanel === panel.id ? "default" : "ghost"}
                onClick={() => setActivePanel(panel.id)}
                className={`flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 ${
                  activePanel === panel.id 
                    ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/50" 
                    : "text-cyan-300 hover:bg-cyan-500/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-mono">{panel.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* System Status Panel */}
          <Card className="lg:col-span-1 bg-black/40 border-cyan-500/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-300 font-mono flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(systemStatus).map(([system, value]) => (
                <div key={system} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-200 font-mono capitalize">{system.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`font-mono font-bold ${getStatusColor(value)}`}>
                      {value.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-2 bg-slate-800"
                  />
                </div>
              ))}
              
              <Separator className="my-4 bg-cyan-500/30" />
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={startScan}
                  disabled={scanning}
                  className="text-cyan-300 border-cyan-500 hover:bg-cyan-500/20 font-mono"
                >
                  {scanning ? "SCANNING..." : "DEEP SCAN"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setAlertLevel(alertLevel === "normal" ? "yellow" : alertLevel === "yellow" ? "red" : "normal")}
                  className="text-yellow-300 border-yellow-500 hover:bg-yellow-500/20 font-mono"
                >
                  ALERT
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 3D Holographic Display */}
          <Card className="lg:col-span-1 bg-black/40 border-cyan-500/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-300 font-mono flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Holographic Display</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg overflow-hidden bg-black/60">
                <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                  <Suspense fallback={null}>
                    <HolographicDisplay />
                    <OrbitControls enableZoom={false} enablePan={false} />
                  </Suspense>
                </Canvas>
              </div>
              <p className="text-xs text-blue-300 mt-2 font-mono text-center">
                3D TACTICAL DISPLAY - ROTATE TO ANALYZE
              </p>
            </CardContent>
          </Card>

          {/* Command Console */}
          <Card className="lg:col-span-1 bg-black/40 border-cyan-500/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-300 font-mono flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Command Console</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-mono transform transition-all duration-200 hover:scale-105 shadow-lg">
                  <Monitor className="w-4 h-4 mr-2" />
                  MAIN VIEWER
                </Button>
                
                <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-mono transform transition-all duration-200 hover:scale-105 shadow-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  LIFE SUPPORT
                </Button>
                
                <Button className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white font-mono transform transition-all duration-200 hover:scale-105 shadow-lg">
                  <Shield className="w-4 h-4 mr-2" />
                  DEFLECTORS
                </Button>
                
                <Button className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-mono transform transition-all duration-200 hover:scale-105 shadow-lg">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  RED ALERT
                </Button>
              </div>
              
              <Separator className="my-4 bg-cyan-500/30" />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-200 font-mono">CREW STATUS</span>
                  <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                    ALL HANDS ACCOUNTED
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-200 font-mono">WARP CORE</span>
                  <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                    STABLE
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-200 font-mono">TRANSPORTERS</span>
                  <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300">
                    STANDBY
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Bottom Data Stream */}
        <Card className="mt-6 bg-black/60 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8 text-sm font-mono">
                <span className="text-green-400">PWR: {systemStatus.power.toFixed(0)}%</span>
                <span className="text-blue-400">SHD: {systemStatus.shields.toFixed(0)}%</span>
                <span className="text-yellow-400">WPN: {systemStatus.weapons.toFixed(0)}%</span>
                <span className="text-cyan-400">NAV: {systemStatus.navigation.toFixed(0)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-mono">SYSTEMS NOMINAL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanning Overlay */}
      {scanning && (
        <div className="fixed inset-0 bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-2xl text-cyan-300 font-mono animate-pulse">DEEP SCAN IN PROGRESS</p>
            <p className="text-cyan-400 font-mono">Analyzing sector grid...</p>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
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
  Zap,
  Power,
  Wifi,
  Volume2
} from "lucide-react";

export function EnhancedLCARS() {
  const [activePanel, setActivePanel] = useState("systems");
  const [systemStatus, setSystemStatus] = useState({
    power: 87,
    shields: 95,
    weapons: 78,
    lifesupport: 99,
    navigation: 92,
    communications: 85,
    sensors: 94
  });
  const [alertLevel, setAlertLevel] = useState<"normal" | "yellow" | "red">("normal");
  const [scanning, setScanning] = useState(false);
  const [dataStreaming, setDataStreaming] = useState(true);

  const panels = [
    { id: "systems", label: "Systems", icon: Cpu, color: "from-blue-500 to-cyan-400" },
    { id: "tactical", label: "Tactical", icon: Shield, color: "from-red-500 to-orange-400" },
    { id: "sensors", label: "Sensors", icon: Radar, color: "from-green-500 to-emerald-400" },
    { id: "engineering", label: "Engineering", icon: Settings, color: "from-yellow-500 to-amber-400" },
    { id: "science", label: "Science", icon: Monitor, color: "from-purple-500 to-violet-400" },
    { id: "medical", label: "Medical", icon: Activity, color: "from-pink-500 to-rose-400" }
  ];

  const getStatusColor = (value: number) => {
    if (value >= 90) return "text-green-400";
    if (value >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getStatusBg = (value: number) => {
    if (value >= 90) return "bg-green-500/20";
    if (value >= 70) return "bg-yellow-500/20";
    return "bg-red-500/20";
  };

  const startScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  const toggleDataStream = () => {
    setDataStreaming(!dataStreaming);
  };

  useEffect(() => {
    // Simulate system fluctuations
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        power: Math.max(50, Math.min(100, prev.power + (Math.random() - 0.5) * 5)),
        shields: Math.max(50, Math.min(100, prev.shields + (Math.random() - 0.5) * 3)),
        weapons: Math.max(50, Math.min(100, prev.weapons + (Math.random() - 0.5) * 4)),
        lifesupport: Math.max(80, Math.min(100, prev.lifesupport + (Math.random() - 0.5) * 2)),
        navigation: Math.max(50, Math.min(100, prev.navigation + (Math.random() - 0.5) * 3)),
        communications: Math.max(50, Math.min(100, prev.communications + (Math.random() - 0.5) * 4)),
        sensors: Math.max(60, Math.min(100, prev.sensors + (Math.random() - 0.5) * 3))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,191,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(0,191,255,0.3)_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,191,255,0.1),transparent_70%)]" />
      </div>

      {/* Floating Data Points */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-cyan-500/50">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-mono tracking-wider">
                ENTERPRISE NX-01
              </h1>
              <p className="text-blue-300 text-lg font-mono">Control Interface • Stardate: {new Date().toISOString().slice(0, 10).replace(/-/g, '.')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge 
              variant={alertLevel === "red" ? "destructive" : alertLevel === "yellow" ? "secondary" : "default"}
              className={`text-xl px-6 py-3 font-mono ${alertLevel === "red" ? "animate-bounce" : "animate-pulse"} shadow-lg`}
            >
              {alertLevel.toUpperCase()} ALERT
            </Badge>
            <Button
              variant="outline"
              onClick={toggleDataStream}
              className={`${dataStreaming ? "text-green-400 border-green-400" : "text-red-400 border-red-400"} font-mono`}
            >
              <Database className="w-4 h-4 mr-2" />
              {dataStreaming ? "STREAMING" : "OFFLINE"}
            </Button>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-black/40 rounded-2xl backdrop-blur-md border border-cyan-500/30">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <Button
                key={panel.id}
                variant={activePanel === panel.id ? "default" : "ghost"}
                onClick={() => setActivePanel(panel.id)}
                className={`flex items-center space-x-3 transition-all duration-500 transform hover:scale-110 hover:rotate-2 ${
                  activePanel === panel.id 
                    ? `bg-gradient-to-r ${panel.color} text-white shadow-xl shadow-cyan-500/30 border-0` 
                    : "text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/50"
                } px-6 py-3 rounded-xl font-mono text-base`}
              >
                <Icon className="w-5 h-5" />
                <span>{panel.label}</span>
                {activePanel === panel.id && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* System Status Panel */}
          <Card className="lg:col-span-2 bg-black/50 border-cyan-500/50 backdrop-blur-lg shadow-2xl shadow-cyan-500/20">
            <CardHeader className="border-b border-cyan-500/30">
              <CardTitle className="text-cyan-300 font-mono flex items-center space-x-3 text-xl">
                <Activity className="w-6 h-6" />
                <span>System Status Matrix</span>
                <div className="flex space-x-1 ml-auto">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {Object.entries(systemStatus).map(([system, value], index) => (
                <div key={system} className={`space-y-3 p-4 rounded-xl ${getStatusBg(value)} border border-cyan-500/20 transform transition-all duration-300 hover:scale-105`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${value >= 90 ? "bg-green-400" : value >= 70 ? "bg-yellow-400" : "bg-red-400"} animate-pulse`}></div>
                      <span className="text-blue-200 font-mono capitalize text-lg font-bold">
                        {system.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <span className={`font-mono font-bold text-xl ${getStatusColor(value)}`}>
                      {value.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-3 bg-slate-800/50 border border-cyan-500/30"
                  />
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono text-cyan-400">
                    <span>MIN: 50%</span>
                    <span className="text-center">OPT: 90%</span>
                    <span className="text-right">MAX: 100%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Command Console */}
          <Card className="lg:col-span-2 bg-black/50 border-cyan-500/50 backdrop-blur-lg shadow-2xl shadow-cyan-500/20">
            <CardHeader className="border-b border-cyan-500/30">
              <CardTitle className="text-cyan-300 font-mono flex items-center space-x-3 text-xl">
                <Zap className="w-6 h-6" />
                <span>Primary Command Console</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-mono transform transition-all duration-300 hover:scale-110 hover:rotate-1 shadow-xl shadow-blue-500/30 py-6 text-lg">
                  <Monitor className="w-5 h-5 mr-3" />
                  MAIN VIEWER
                </Button>
                
                <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-mono transform transition-all duration-300 hover:scale-110 hover:rotate-1 shadow-xl shadow-green-500/30 py-6 text-lg">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  LIFE SUPPORT
                </Button>
                
                <Button className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white font-mono transform transition-all duration-300 hover:scale-110 hover:rotate-1 shadow-xl shadow-orange-500/30 py-6 text-lg">
                  <Shield className="w-5 h-5 mr-3" />
                  POLARIZED HULL
                </Button>
                
                <Button className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-mono transform transition-all duration-300 hover:scale-110 hover:rotate-1 shadow-xl shadow-red-500/30 py-6 text-lg">
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  RED ALERT
                </Button>
              </div>
              
              <Separator className="my-6 bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                  <span className="text-green-300 font-mono font-bold">CREW STATUS</span>
                  <Badge variant="secondary" className="bg-green-900/50 text-green-300 animate-pulse">
                    ALL HANDS ACCOUNTED
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <span className="text-blue-300 font-mono font-bold">WARP CORE</span>
                  <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 animate-pulse">
                    MATTER/ANTIMATTER STABLE
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                  <span className="text-yellow-300 font-mono font-bold">TRANSPORTERS</span>
                  <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 animate-pulse">
                    PATTERN BUFFERS READY
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <span className="text-purple-300 font-mono font-bold">SUBSPACE COMM</span>
                  <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 animate-pulse">
                    LONG RANGE ACTIVE
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={startScan}
                  disabled={scanning}
                  className="text-cyan-300 border-cyan-500 hover:bg-cyan-500/20 font-mono transform transition-all duration-200 hover:scale-105"
                >
                  {scanning ? "SCANNING..." : "SENSOR SWEEP"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setAlertLevel(alertLevel === "normal" ? "yellow" : alertLevel === "yellow" ? "red" : "normal")}
                  className="text-yellow-300 border-yellow-500 hover:bg-yellow-500/20 font-mono transform transition-all duration-200 hover:scale-105"
                >
                  ALERT STATUS
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-green-300 border-green-500 hover:bg-green-500/20 font-mono transform transition-all duration-200 hover:scale-105"
                >
                  DIAGNOSTICS
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Bottom Data Stream */}
        <Card className="mt-6 bg-black/70 border-cyan-500/40 backdrop-blur-md shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8 text-base font-mono">
                <div className="flex items-center space-x-2">
                  <Power className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">PWR: {systemStatus.power.toFixed(0)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400">SHD: {systemStatus.shields.toFixed(0)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">WPN: {systemStatus.weapons.toFixed(0)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Radar className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400">NAV: {systemStatus.navigation.toFixed(0)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400">COM: {systemStatus.communications.toFixed(0)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-400">SEN: {systemStatus.sensors.toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <span className="text-green-400 text-lg font-mono font-bold">ALL SYSTEMS NOMINAL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanning Overlay */}
      {scanning && (
        <div className="fixed inset-0 bg-cyan-500/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center space-y-6 p-8 bg-black/80 rounded-2xl border border-cyan-500/50 backdrop-blur-lg">
            <div className="relative">
              <div className="w-40 h-40 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-2 border-blue-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
            </div>
            <p className="text-3xl text-cyan-300 font-mono animate-pulse">LONG RANGE SENSORS</p>
            <p className="text-cyan-400 font-mono text-lg">Analyzing sector grid 27-Alpha...</p>
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-8 bg-cyan-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
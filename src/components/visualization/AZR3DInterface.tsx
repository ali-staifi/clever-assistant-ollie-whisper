
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, AlertTriangle } from 'lucide-react';

interface ProcessNode {
  id: string;
  type: 'creation' | 'validation' | 'improvement' | 'orchestration';
  position: [number, number, number];
  status: 'active' | 'idle' | 'processing' | 'secured' | 'error';
  connections: string[];
  securityLevel: 'safe' | 'monitored' | 'isolated';
}

interface AZR3DInterfaceProps {
  azrActive: boolean;
  agentSActive: boolean;
  processes: any[];
  executionResults: any[];
}

const ProcessSphere: React.FC<{
  node: ProcessNode;
  onClick: () => void;
}> = ({ node, onClick }) => {
  const meshRef = useRef<any>();
  
  useEffect(() => {
    if (node.status === 'processing' && meshRef.current) {
      const animate = () => {
        if (meshRef.current) {
          meshRef.current.rotation.x += 0.01;
          meshRef.current.rotation.y += 0.01;
        }
      };
      const interval = setInterval(animate, 16);
      return () => clearInterval(interval);
    }
  }, [node.status]);

  const getColor = () => {
    switch (node.type) {
      case 'creation': return '#ff6b6b';
      case 'validation': return '#4ecdc4';
      case 'improvement': return '#45b7d1';
      case 'orchestration': return '#96ceb4';
      default: return '#ffffff';
    }
  };

  const getOpacity = () => {
    switch (node.status) {
      case 'active': return 1.0;
      case 'processing': return 0.8;
      case 'secured': return 0.9;
      case 'idle': return 0.4;
      case 'error': return 0.6;
      default: return 0.2;
    }
  };

  const getSecurityRing = () => {
    if (node.securityLevel === 'isolated') return '#ff4444';
    if (node.securityLevel === 'monitored') return '#ffaa00';
    return '#44ff44';
  };

  return (
    <group position={node.position}>
      <Sphere
        ref={meshRef}
        args={[0.5, 32, 32]}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={getColor()}
          transparent
          opacity={getOpacity()}
          emissive={node.status === 'processing' ? getColor() : '#000000'}
          emissiveIntensity={node.status === 'processing' ? 0.2 : 0}
        />
      </Sphere>
      {/* Anneau de sécurité */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.05, 8, 32]} />
        <meshBasicMaterial color={getSecurityRing()} transparent opacity={0.7} />
      </mesh>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {node.type.toUpperCase()}
      </Text>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.1}
        color={getSecurityRing()}
        anchorX="center"
        anchorY="middle"
      >
        {node.securityLevel.toUpperCase()}
      </Text>
    </group>
  );
};

const ConnectionLine: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
  secure: boolean;
}> = ({ start, end, active, secure }) => {
  const points = [start, end];
  
  return (
    <Line
      points={points}
      color={secure ? (active ? "#00ff88" : "#00aa44") : (active ? "#ff8800" : "#aa4400")}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
};

const AZR3DInterface: React.FC<AZR3DInterfaceProps> = ({
  azrActive,
  agentSActive,
  processes,
  executionResults
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [securityAlert, setSecurityAlert] = useState<boolean>(false);
  const [processNodes, setProcessNodes] = useState<ProcessNode[]>([
    {
      id: 'creation',
      type: 'creation',
      position: [-2, 1, 0],
      status: 'idle',
      connections: ['validation', 'improvement'],
      securityLevel: 'safe'
    },
    {
      id: 'validation',
      type: 'validation',
      position: [0, 0, 0],
      status: 'idle',
      connections: ['improvement'],
      securityLevel: 'monitored'
    },
    {
      id: 'improvement',
      type: 'improvement',
      position: [2, 1, 0],
      status: 'idle',
      connections: ['creation'],
      securityLevel: 'safe'
    },
    {
      id: 'orchestration',
      type: 'orchestration',
      position: [0, 2, 0],
      status: agentSActive ? 'active' : 'idle',
      connections: ['creation', 'validation', 'improvement'],
      securityLevel: 'isolated'
    }
  ]);

  useEffect(() => {
    // Surveillance de dérive algorithmique
    const driftDetection = () => {
      const errorRate = executionResults.length > 0 ? 
        executionResults.filter(r => !r.success).length / executionResults.length : 0;
      
      if (errorRate > 0.5) {
        setSecurityAlert(true);
        // Isolation automatique en cas de dérive
        setProcessNodes(prev => prev.map(node => ({
          ...node,
          securityLevel: node.type === 'orchestration' ? 'isolated' : 'monitored',
          status: errorRate > 0.7 ? 'error' : node.status
        })));
      } else {
        setSecurityAlert(false);
      }
    };

    if (executionResults.length > 3) {
      driftDetection();
    }

    // Mise à jour du statut des nœuds
    setProcessNodes(prev => prev.map(node => {
      if (node.type === 'orchestration') {
        return { 
          ...node, 
          status: agentSActive ? 'active' : 'idle',
          securityLevel: agentSActive ? 'isolated' : 'safe'
        };
      }
      if (azrActive) {
        const hasActivity = processes.length > 0;
        return { 
          ...node, 
          status: hasActivity ? 'processing' : 'active',
          securityLevel: hasActivity ? 'monitored' : 'safe'
        };
      }
      return { ...node, status: 'idle', securityLevel: 'safe' };
    }));
  }, [azrActive, agentSActive, processes.length, executionResults]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const getActiveConnections = () => {
    if (!azrActive) return [];
    return processNodes.flatMap(node => {
      const connections = node.connections || [];
      return connections.map(connId => {
        const targetNode = processNodes.find(n => n.id === connId);
        if (!targetNode) return null;
        
        return {
          start: node.position,
          end: targetNode.position,
          active: node.status === 'processing' || node.status === 'active',
          secure: node.securityLevel === 'safe' && targetNode.securityLevel === 'safe'
        };
      }).filter(Boolean);
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-600" />
          Visualisation 3D Sécurisée - AZR + Agent S
          {securityAlert && (
            <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {securityAlert && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <Shield className="h-3 w-3 inline mr-1" />
            Dérive algorithmique détectée - Isolation automatique activée
          </div>
        )}
        
        <div className="h-64 w-full border rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4444ff" />
            
            {processNodes.map((node) => (
              <ProcessSphere
                key={node.id}
                node={node}
                onClick={() => handleNodeClick(node.id)}
              />
            ))}
            
            {getActiveConnections().map((connection, index) => 
              connection && (
                <ConnectionLine
                  key={index}
                  start={connection.start}
                  end={connection.end}
                  active={connection.active}
                  secure={connection.secure}
                />
              )
            )}
            
            <OrbitControls enableZoom enablePan enableRotate />
          </Canvas>
        </div>
        
        {selectedNode && (
          <div className="mt-3 p-2 border rounded bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge>
                {processNodes.find(n => n.id === selectedNode)?.type}
              </Badge>
              <Badge variant={
                processNodes.find(n => n.id === selectedNode)?.securityLevel === 'safe' ? 'default' :
                processNodes.find(n => n.id === selectedNode)?.securityLevel === 'monitored' ? 'secondary' : 'destructive'
              }>
                {processNodes.find(n => n.id === selectedNode)?.securityLevel}
              </Badge>
              <span className="text-sm">
                Statut: {processNodes.find(n => n.id === selectedNode)?.status}
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">{processes.length}</div>
            <div className="text-muted-foreground">Processus</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{executionResults.length}</div>
            <div className="text-muted-foreground">Exécutions</div>
          </div>
          <div className="text-center">
            <div className="font-medium">
              {processNodes.filter(n => n.status === 'active').length}
            </div>
            <div className="text-muted-foreground">Nœuds actifs</div>
          </div>
          <div className="text-center">
            <div className="font-medium">
              {processNodes.filter(n => n.securityLevel === 'safe').length}
            </div>
            <div className="text-muted-foreground">Sécurisés</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AZR3DInterface;

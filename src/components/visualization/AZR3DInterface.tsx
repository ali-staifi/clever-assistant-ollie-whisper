
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Cpu, Database } from 'lucide-react';

interface ProcessNode {
  id: string;
  type: 'creation' | 'validation' | 'improvement' | 'orchestration';
  position: [number, number, number];
  status: 'active' | 'idle' | 'processing';
  connections: string[];
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
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
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
      case 'idle': return 0.4;
      default: return 0.2;
    }
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
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {node.type.toUpperCase()}
      </Text>
    </group>
  );
};

const ConnectionLine: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
}> = ({ start, end, active }) => {
  const points = [start, end];
  
  return (
    <Line
      points={points}
      color={active ? "#00ff88" : "#333333"}
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
  const [processNodes, setProcessNodes] = useState<ProcessNode[]>([
    {
      id: 'creation',
      type: 'creation',
      position: [-2, 1, 0],
      status: 'idle',
      connections: ['validation', 'improvement']
    },
    {
      id: 'validation',
      type: 'validation',
      position: [0, 0, 0],
      status: 'idle',
      connections: ['improvement']
    },
    {
      id: 'improvement',
      type: 'improvement',
      position: [2, 1, 0],
      status: 'idle',
      connections: ['creation']
    },
    {
      id: 'orchestration',
      type: 'orchestration',
      position: [0, 2, 0],
      status: agentSActive ? 'active' : 'idle',
      connections: ['creation', 'validation', 'improvement']
    }
  ]);

  useEffect(() => {
    // Mise à jour du statut des nœuds selon l'activité
    setProcessNodes(prev => prev.map(node => {
      if (node.type === 'orchestration') {
        return { ...node, status: agentSActive ? 'active' : 'idle' };
      }
      if (azrActive) {
        // Simuler l'activité selon les processus en cours
        const hasActivity = processes.length > 0;
        return { 
          ...node, 
          status: hasActivity ? 'processing' : 'active' 
        };
      }
      return { ...node, status: 'idle' };
    }));
  }, [azrActive, agentSActive, processes.length]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const getActiveConnections = () => {
    if (!azrActive) return [];
    return processNodes.flatMap(node => 
      node.connections.map(connId => ({
        start: node.position,
        end: processNodes.find(n => n.id === connId)?.position || [0, 0, 0],
        active: node.status === 'processing' || node.status === 'active'
      }))
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-600" />
          Visualisation 3D - Architecture AZR + Agent S
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full border rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4444ff" />
            
            {/* Nœuds de processus */}
            {processNodes.map((node) => (
              <ProcessSphere
                key={node.id}
                node={node}
                onClick={() => handleNodeClick(node.id)}
              />
            ))}
            
            {/* Connexions */}
            {getActiveConnections().map((connection, index) => (
              <ConnectionLine
                key={index}
                start={connection.start}
                end={connection.end}
                active={connection.active}
              />
            ))}
            
            <OrbitControls enableZoom enablePan enableRotate />
          </Canvas>
        </div>
        
        {/* Informations sur le nœud sélectionné */}
        {selectedNode && (
          <div className="mt-3 p-2 border rounded bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge>
                {processNodes.find(n => n.id === selectedNode)?.type}
              </Badge>
              <span className="text-sm">
                Statut: {processNodes.find(n => n.id === selectedNode)?.status}
              </span>
            </div>
          </div>
        )}
        
        {/* Statistiques */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AZR3DInterface;

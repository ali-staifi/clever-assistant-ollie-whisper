
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ProcessSphere, { ProcessNode } from './ProcessSphere';
import ConnectionLine from './ConnectionLine';

interface AZR3DSceneProps {
  processNodes: ProcessNode[];
  onNodeClick: (nodeId: string) => void;
  getActiveConnections: () => Array<{
    start: [number, number, number];
    end: [number, number, number];
    active: boolean;
    secure: boolean;
  }>;
}

const AZR3DScene: React.FC<AZR3DSceneProps> = ({ 
  processNodes, 
  onNodeClick, 
  getActiveConnections 
}) => {
  const connections = React.useMemo(() => {
    try {
      return getActiveConnections();
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      return [];
    }
  }, [getActiveConnections]);

  return (
    <div className="h-64 w-full border rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4444ff" />
        
        {processNodes && processNodes.length > 0 && processNodes.map((node) => (
          <ProcessSphere
            key={node.id}
            node={node}
            onClick={() => onNodeClick(node.id)}
          />
        ))}
        
        {connections && connections.length > 0 && connections.map((connection, index) => (
          <ConnectionLine
            key={`connection-${index}`}
            start={connection.start}
            end={connection.end}
            active={connection.active}
            secure={connection.secure}
          />
        ))}
        
        <OrbitControls 
          enableZoom 
          enablePan 
          enableRotate 
          maxDistance={15}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
};

export default AZR3DScene;

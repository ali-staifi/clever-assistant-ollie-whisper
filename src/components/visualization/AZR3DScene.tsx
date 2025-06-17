
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
      if (!getActiveConnections || typeof getActiveConnections !== 'function') {
        return [];
      }
      const result = getActiveConnections();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      return [];
    }
  }, [getActiveConnections]);

  // Vérifier que processNodes est valide
  const validProcessNodes = React.useMemo(() => {
    return Array.isArray(processNodes) ? processNodes.filter(node => 
      node && 
      node.id && 
      Array.isArray(node.position) && 
      node.position.length === 3
    ) : [];
  }, [processNodes]);

  return (
    <div className="h-64 w-full border rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        onCreated={({ gl }) => {
          try {
            gl.setClearColor('#000000');
          } catch (error) {
            console.warn('Impossible de définir la couleur de fond du canvas:', error);
          }
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4444ff" />
        
        {validProcessNodes.map((node) => (
          <ProcessSphere
            key={node.id}
            node={node}
            onClick={() => onNodeClick(node.id)}
          />
        ))}
        
        {connections.map((connection, index) => {
          if (!connection || !Array.isArray(connection.start) || !Array.isArray(connection.end)) {
            return null;
          }
          return (
            <ConnectionLine
              key={`connection-${index}`}
              start={connection.start}
              end={connection.end}
              active={connection.active || false}
              secure={connection.secure || false}
            />
          );
        })}
        
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

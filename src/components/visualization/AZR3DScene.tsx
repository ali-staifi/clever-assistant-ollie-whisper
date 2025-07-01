
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
      console.log('Getting connections...', { getActiveConnections });
      if (!getActiveConnections || typeof getActiveConnections !== 'function') {
        console.log('getActiveConnections is not a function, returning empty array');
        return [];
      }
      const result = getActiveConnections();
      console.log('Raw connections result:', result);
      if (!Array.isArray(result)) {
        console.log('Connections result is not an array:', typeof result);
        return [];
      }
      const validConnections = result.filter(conn => {
        if (!conn) return false;
        if (!Array.isArray(conn.start) || !Array.isArray(conn.end)) return false;
        if (conn.start.length !== 3 || conn.end.length !== 3) return false;
        if (!conn.start.every(n => typeof n === 'number' && !isNaN(n))) return false;
        if (!conn.end.every(n => typeof n === 'number' && !isNaN(n))) return false;
        return true;
      });
      console.log('Valid connections:', validConnections);
      return validConnections;
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      return [];
    }
  }, [getActiveConnections]);

  const validProcessNodes = React.useMemo(() => {
    try {
      console.log('Processing nodes...', processNodes);
      if (!Array.isArray(processNodes)) {
        console.log('processNodes is not an array:', typeof processNodes);
        return [];
      }
      const validNodes = processNodes.filter(node => {
        if (!node) return false;
        if (!node.id) return false;
        if (!Array.isArray(node.position)) return false;
        if (node.position.length !== 3) return false;
        if (!node.position.every(n => typeof n === 'number' && !isNaN(n))) return false;
        return true;
      });
      console.log('Valid nodes:', validNodes);
      return validNodes;
    } catch (error) {
      console.error('Erreur lors du traitement des nœuds:', error);
      return [];
    }
  }, [processNodes]);

  return (
    <div className="h-64 w-full border rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
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
        
        {validProcessNodes.map((node) => {
          try {
            return (
              <ProcessSphere
                key={node.id}
                node={node}
                onClick={() => onNodeClick(node.id)}
              />
            );
          } catch (error) {
            console.error('Erreur lors du rendu du nœud:', node.id, error);
            return null;
          }
        })}
        
        {connections.map((connection, index) => {
          try {
            return (
              <ConnectionLine
                key={`connection-${index}`}
                start={connection.start}
                end={connection.end}
                active={Boolean(connection.active)}
                secure={Boolean(connection.secure)}
              />
            );
          } catch (error) {
            console.error('Erreur lors du rendu de la connexion:', index, error);
            return null;
          }
        })}
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={15}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
};

export default AZR3DScene;

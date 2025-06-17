
import React, { useRef, useEffect } from 'react';
import { Sphere, Text } from '@react-three/drei';

interface ProcessNode {
  id: string;
  type: 'creation' | 'validation' | 'improvement' | 'orchestration';
  position: [number, number, number];
  status: 'active' | 'idle' | 'processing' | 'secured' | 'error';
  connections: string[];
  securityLevel: 'safe' | 'monitored' | 'isolated';
}

interface ProcessSphereProps {
  node: ProcessNode;
  onClick: () => void;
}

const ProcessSphere: React.FC<ProcessSphereProps> = ({ node, onClick }) => {
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
      
      {/* Anneau de sécurité avec géométrie simple */}
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

export default ProcessSphere;
export type { ProcessNode };

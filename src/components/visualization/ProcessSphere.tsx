
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

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
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
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

  // Create native Three.js objects
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 16, 16), []);
  const sphereMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: getColor(),
    transparent: true,
    opacity: getOpacity(),
    emissive: node.status === 'processing' ? getColor() : '#000000',
    emissiveIntensity: node.status === 'processing' ? 0.2 : 0
  }), [node.status, node.type]);

  const sphereMesh = useMemo(() => {
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mesh.position.set(...node.position);
    mesh.userData = { onClick };
    return mesh;
  }, [sphereGeometry, sphereMaterial, node.position, onClick]);

  const ringGeometry = useMemo(() => new THREE.TorusGeometry(0.7, 0.05, 8, 16), []);
  const ringMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: getSecurityRing(),
    transparent: true,
    opacity: 0.7
  }), [node.securityLevel]);

  const ringMesh = useMemo(() => {
    const mesh = new THREE.Mesh(ringGeometry, ringMaterial);
    mesh.position.set(...node.position);
    mesh.rotation.set(Math.PI / 2, 0, 0);
    return mesh;
  }, [ringGeometry, ringMaterial, node.position]);

  return (
    <group position={node.position}>
      <primitive ref={meshRef} object={sphereMesh} onClick={onClick} />
      <primitive ref={ringRef} object={ringMesh} />
    </group>
  );
};

export default ProcessSphere;
export type { ProcessNode };

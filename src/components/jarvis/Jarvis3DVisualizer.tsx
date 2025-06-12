
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Text, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Jarvis3DVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  micVolume: number;
  voiceParams?: {
    speed: number;
    pitch: number;
    energy: number;
    emotion: string;
  };
}

const JarvisCore: React.FC<{
  isListening: boolean;
  isSpeaking: boolean;
  micVolume: number;
  voiceParams: any;
}> = ({ isListening, isSpeaking, micVolume, voiceParams }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  
  // Couleurs basées sur l'émotion
  const emotionColors = {
    neutral: '#00aaff',
    happy: '#ffaa00',
    sad: '#4444ff',
    angry: '#ff4444',
    surprised: '#ff00ff'
  };
  
  const coreColor = emotionColors[voiceParams?.emotion as keyof typeof emotionColors] || '#00aaff';
  
  useFrame((state) => {
    if (meshRef.current) {
      // Animation de base - rotation
      meshRef.current.rotation.y += 0.01;
      
      // Réaction à la voix
      if (isSpeaking) {
        const intensity = (voiceParams?.energy || 1) * 2;
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.1 * intensity);
      } else if (isListening) {
        const volumeScale = 1 + micVolume * 0.3;
        meshRef.current.scale.setScalar(volumeScale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
      
      // Changement de couleur basé sur la hauteur de voix
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const hue = Math.sin(state.clock.elapsedTime * (voiceParams?.pitch || 1)) * 0.1 + 0.6;
      material.color.setHSL(hue, 0.8, 0.6);
    }
    
    // Animation des anneaux
    if (ringRef.current) {
      ringRef.current.rotation.x += 0.005;
      ringRef.current.rotation.z += 0.003;
      
      if (isSpeaking) {
        const speed = voiceParams?.speed || 1;
        ringRef.current.rotation.y += 0.02 * speed;
      }
    }
  });
  
  return (
    <group>
      {/* Cœur de Jarvis */}
      <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isSpeaking ? 0.3 : isListening ? 0.2 : 0.1}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Anneaux orbitaux */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.05, 8, 100]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
          />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[2.5, 0.03, 8, 100]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={0.15}
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>
      
      {/* Particules d'énergie */}
      {isSpeaking && (
        <group>
          {Array.from({ length: 20 }).map((_, i) => (
            <Sphere key={i} args={[0.05, 8, 8]} position={[
              Math.sin(i * 0.3) * 3,
              Math.cos(i * 0.5) * 3,
              Math.sin(i * 0.7) * 3
            ]}>
              <meshBasicMaterial color={coreColor} transparent opacity={0.7} />
            </Sphere>
          ))}
        </group>
      )}
      
      {/* Texte d'état */}
      <Text
        position={[0, -3, 0]}
        fontSize={0.5}
        color={coreColor}
        anchorX="center"
        anchorY="middle"
      >
        {isSpeaking ? 'JARVIS PARLE' : isListening ? 'ÉCOUTE EN COURS' : 'JARVIS'}
      </Text>
    </group>
  );
};

const Jarvis3DVisualizer: React.FC<Jarvis3DVisualizerProps> = ({
  isListening,
  isSpeaking,
  micVolume,
  voiceParams
}) => {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-gradient-to-br from-jarvis-darkBlue to-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        <JarvisCore
          isListening={isListening}
          isSpeaking={isSpeaking}
          micVolume={micVolume}
          voiceParams={voiceParams}
        />
        
        <Environment preset="city" />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default Jarvis3DVisualizer;

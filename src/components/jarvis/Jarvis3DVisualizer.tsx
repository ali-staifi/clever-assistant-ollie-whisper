
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Text, OrbitControls } from '@react-three/drei';
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
      
      {/* Texte d'état */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
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
    <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-jarvis-darkBlue to-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        <JarvisCore
          isListening={isListening}
          isSpeaking={isSpeaking}
          micVolume={micVolume}
          voiceParams={voiceParams}
        />
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default Jarvis3DVisualizer;

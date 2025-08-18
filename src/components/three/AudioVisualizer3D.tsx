import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Environment } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import * as THREE from 'three';

interface AudioSphereProps {
  audioData: number[];
  isActive: boolean;
}

const AudioSphere: React.FC<AudioSphereProps> = ({ audioData, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);

  useFrame((state) => {
    if (!meshRef.current || !geometryRef.current) return;

    // Animation de rotation
    meshRef.current.rotation.y += 0.01;
    meshRef.current.rotation.x += 0.005;

    // Effet pulsation basé sur l'audio
    const averageFreq = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
    const scale = isActive ? 1 + (averageFreq / 255) * 0.5 : 1;
    meshRef.current.scale.setScalar(scale);

    // Déformation des vertices basée sur les fréquences audio
    if (isActive && audioData.length > 0) {
      const positions = geometryRef.current.attributes.position;
      const vertex = new THREE.Vector3();

      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i);
        vertex.normalize();
        
        // Utiliser les données audio pour déformer la sphère
        const audioIndex = Math.floor((i / positions.count) * audioData.length);
        const audioValue = audioData[audioIndex] || 0;
        const displacement = 1 + (audioValue / 255) * 0.3;
        
        vertex.multiplyScalar(displacement);
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      
      positions.needsUpdate = true;
      geometryRef.current.computeVertexNormals();
    }

    // Couleur dynamique
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      const hue = (state.clock.elapsedTime * 0.1 + averageFreq / 255) % 1;
      meshRef.current.material.color.setHSL(hue, 0.8, 0.6);
      meshRef.current.material.emissive.setHSL(hue, 0.5, isActive ? 0.2 : 0.1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry ref={geometryRef} args={[1, 64, 64]} />
      <meshStandardMaterial
        wireframe={false}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

interface AudioParticlesProps {
  audioData: number[];
  isActive: boolean;
}

const AudioParticles: React.FC<AudioParticlesProps> = ({ audioData, isActive }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 1000;

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Animation des particules
    pointsRef.current.rotation.y += 0.005;
    
    if (isActive && audioData.length > 0) {
      const positions = pointsRef.current.geometry.attributes.position;
      
      for (let i = 0; i < particleCount; i++) {
        const audioIndex = Math.floor((i / particleCount) * audioData.length);
        const audioValue = audioData[audioIndex] || 0;
        
        // Déplacer les particules basé sur l'audio
        const radius = 3 + (audioValue / 255) * 2;
        const theta = (i / particleCount) * Math.PI * 2;
        const phi = Math.acos(1 - 2 * (i % 100) / 100);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions.setXYZ(i, x, y, z);
      }
      
      positions.needsUpdate = true;
    }
  });

  // Générer les positions initiales des particules
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(1 - 2 * Math.random());
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={isActive ? "#ffffff" : "#666666"}
        transparent
        opacity={isActive ? 0.8 : 0.3}
      />
    </points>
  );
};

export const AudioVisualizer3D: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<'ready' | 'permission-denied' | 'not-supported'>('ready');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialiser l'audio
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      
      setDeviceStatus('ready');
      return true;
    } catch (error) {
      console.error('Erreur accès microphone:', error);
      setDeviceStatus('permission-denied');
      return false;
    }
  };

  // Analyser l'audio en temps réel
  const analyzeAudio = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateAudioData = () => {
      if (!analyserRef.current || !isListening) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      setAudioData(Array.from(dataArray));
      
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };
    
    updateAudioData();
  };

  // Démarrer/arrêter l'écoute
  const toggleListening = async () => {
    if (!isListening) {
      const success = await initializeAudio();
      if (success) {
        setIsListening(true);
        analyzeAudio();
      }
    } else {
      setIsListening(false);
      
      // Nettoyer les ressources
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      setAudioData([]);
    }
  };

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioLevel = () => {
    if (audioData.length === 0) return 0;
    return Math.round((audioData.reduce((sum, val) => sum + val, 0) / audioData.length / 255) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🎵 Visualiseur Audio 3D</span>
            <div className="flex items-center space-x-2">
              <Badge variant={isListening ? 'default' : 'secondary'}>
                {isListening ? '🎤 Actif' : '🔇 Inactif'}
              </Badge>
              {isListening && (
                <Badge variant="outline">
                  <Volume2 className="w-3 h-3 mr-1" />
                  {getAudioLevel()}%
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contrôles */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={toggleListening}
              disabled={deviceStatus === 'not-supported'}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className="min-w-[200px]"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Arrêter la visualisation
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Démarrer la visualisation
                </>
              )}
            </Button>
          </div>

          {/* Messages d'état */}
          {deviceStatus === 'permission-denied' && (
            <div className="text-center p-4 bg-destructive/10 text-destructive rounded-lg">
              ❌ Accès au microphone refusé. Veuillez autoriser l'accès et actualiser la page.
            </div>
          )}

          {deviceStatus === 'not-supported' && (
            <div className="text-center p-4 bg-destructive/10 text-destructive rounded-lg">
              ❌ API Web Audio non supportée par votre navigateur.
            </div>
          )}

          {/* Visualiseur 3D */}
          <div className="h-96 w-full rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted">
            <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
              {/* Éclairage */}
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b6b" />
              
              {/* Environnement */}
              <Environment preset="night" />
              
              {/* Sphère audio principale */}
              <AudioSphere audioData={audioData} isActive={isListening} />
              
              {/* Particules */}
              <AudioParticles audioData={audioData} isActive={isListening} />
              
              {/* Texte flottant */}
              <Text
                position={[0, 3, 0]}
                fontSize={0.5}
                color={isListening ? "#ffffff" : "#666666"}
                anchorX="center"
                anchorY="middle"
              >
                {isListening ? "🎵 Écoute en cours..." : "🔇 Visualiseur en pause"}
              </Text>
              
              {/* Contrôles de caméra */}
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={!isListening}
                autoRotateSpeed={0.5}
              />
            </Canvas>
          </div>

          {/* Informations audio en temps réel */}
          {isListening && audioData.length > 0 && (
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{getAudioLevel()}%</div>
                <div className="text-xs text-muted-foreground">Niveau</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{audioData.length}</div>
                <div className="text-xs text-muted-foreground">Fréquences</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{Math.max(...audioData)}</div>
                <div className="text-xs text-muted-foreground">Peak</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{Math.round(audioData.reduce((sum, val) => sum + val, 0) / audioData.length)}</div>
                <div className="text-xs text-muted-foreground">Moyenne</div>
              </div>
            </div>
          )}

          {/* Informations sur les capacités */}
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div>🎮 <strong>3D:</strong> Visualisation interactive</div>
              <div>⚡ <strong>Temps réel:</strong> Analyse audio live</div>
              <div>🎨 <strong>Dynamique:</strong> Couleurs et formes réactives</div>
              <div>🖱️ <strong>Interactive:</strong> Contrôles de caméra</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useRef, useEffect } from 'react';

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

const Jarvis3DVisualizer: React.FC<Jarvis3DVisualizerProps> = ({
  isListening,
  isSpeaking,
  micVolume,
  voiceParams
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Couleurs basées sur l'émotion
  const emotionColors = {
    neutral: '#00aaff',
    happy: '#ffaa00',
    sad: '#4444ff',
    angry: '#ff4444',
    surprised: '#ff00ff'
  };
  
  const coreColor = emotionColors[voiceParams?.emotion as keyof typeof emotionColors] || '#00aaff';
  
  // Déterminer le texte d'état correct
  const getStatusText = () => {
    if (isSpeaking) return 'JARVIS PARLE';
    if (isListening) return 'ÉCOUTE EN COURS';
    return 'JARVIS';
  };
  
  // Calculer l'intensité pour l'animation
  const intensity = isSpeaking 
    ? (voiceParams?.energy || 1) * 0.8
    : isListening 
    ? micVolume * 0.5 
    : 0.3;
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-jarvis-darkBlue to-black relative flex items-center justify-center"
    >
      {/* Cœur de Jarvis - Version CSS animée */}
      <div className="relative">
        {/* Sphère principale */}
        <div 
          className="w-24 h-24 rounded-full border-4 relative transition-all duration-300"
          style={{
            borderColor: coreColor,
            backgroundColor: `${coreColor}20`,
            boxShadow: `0 0 30px ${coreColor}80, inset 0 0 20px ${coreColor}40`,
            transform: `scale(${1 + intensity * 0.2})`,
            animation: isSpeaking 
              ? 'pulse 0.5s ease-in-out infinite alternate' 
              : isListening 
              ? 'pulse 1s ease-in-out infinite alternate'
              : 'none'
          }}
        >
          {/* Effet de pulsation interne */}
          <div 
            className="absolute inset-2 rounded-full opacity-60 transition-all duration-200"
            style={{
              backgroundColor: coreColor,
              filter: 'blur(2px)',
              transform: `scale(${0.8 + intensity * 0.3})`
            }}
          />
          
          {/* Point central */}
          <div 
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundColor: coreColor,
              boxShadow: `0 0 10px ${coreColor}`
            }}
          />
        </div>
        
        {/* Anneaux orbitaux */}
        {(isSpeaking || isListening) && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute rounded-full border opacity-30"
                style={{
                  width: `${120 + ring * 30}px`,
                  height: `${120 + ring * 30}px`,
                  borderColor: coreColor,
                  animation: `spin ${3 + ring}s linear infinite${ring % 2 === 0 ? ' reverse' : ''}`
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Texte d'état */}
      <div 
        className="absolute bottom-8 text-center font-mono text-sm tracking-wider"
        style={{ color: coreColor }}
      >
        {getStatusText()}
      </div>
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-40"
            style={{
              backgroundColor: coreColor,
              left: `${20 + (i % 4) * 20}%`,
              top: `${30 + Math.floor(i / 4) * 40}%`,
              animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
      
      {/* Styles d'animation intégrés */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) opacity(0.4); }
          50% { transform: translateY(-10px) opacity(0.8); }
        }
      `}</style>
    </div>
  );
};

export default Jarvis3DVisualizer;


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

  // Ajouter les styles CSS dans le head
  useEffect(() => {
    const styleId = 'jarvis-3d-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      @keyframes jarvis-pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
      }
      
      @keyframes jarvis-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes jarvis-float {
        0%, 100% { transform: translateY(0px); opacity: 0.4; }
        50% { transform: translateY(-10px); opacity: 0.8; }
      }
      
      .jarvis-pulse {
        animation: jarvis-pulse 0.5s ease-in-out infinite alternate;
      }
      
      .jarvis-pulse-listening {
        animation: jarvis-pulse 1s ease-in-out infinite alternate;
      }
      
      .jarvis-spin {
        animation: jarvis-spin 3s linear infinite;
      }
      
      .jarvis-spin-reverse {
        animation: jarvis-spin 4s linear infinite reverse;
      }
      
      .jarvis-spin-slow {
        animation: jarvis-spin 5s linear infinite;
      }
      
      .jarvis-float {
        animation: jarvis-float 2s ease-in-out infinite;
      }
    `;
    
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-jarvis-darkBlue to-black relative flex items-center justify-center"
    >
      {/* Cœur de Jarvis - Version CSS animée */}
      <div className="relative">
        {/* Sphère principale */}
        <div 
          className={`w-24 h-24 rounded-full border-4 relative transition-all duration-300 ${
            isSpeaking ? 'jarvis-pulse' : isListening ? 'jarvis-pulse-listening' : ''
          }`}
          style={{
            borderColor: coreColor,
            backgroundColor: `${coreColor}20`,
            boxShadow: `0 0 30px ${coreColor}80, inset 0 0 20px ${coreColor}40`,
            transform: `scale(${1 + intensity * 0.2})`
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
            <div
              className="absolute rounded-full border opacity-30 jarvis-spin"
              style={{
                width: '150px',
                height: '150px',
                borderColor: coreColor
              }}
            />
            <div
              className="absolute rounded-full border opacity-30 jarvis-spin-reverse"
              style={{
                width: '180px',
                height: '180px',
                borderColor: coreColor
              }}
            />
            <div
              className="absolute rounded-full border opacity-30 jarvis-spin-slow"
              style={{
                width: '210px',
                height: '210px',
                borderColor: coreColor
              }}
            />
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
            className="absolute w-1 h-1 rounded-full opacity-40 jarvis-float"
            style={{
              backgroundColor: coreColor,
              left: `${20 + (i % 4) * 20}%`,
              top: `${30 + Math.floor(i / 4) * 40}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Jarvis3DVisualizer;

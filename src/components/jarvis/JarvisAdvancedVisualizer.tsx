
import React from 'react';
import { ConversationState } from '@/services/voice/ContinuousConversationService';

interface JarvisAdvancedVisualizerProps {
  conversationState: ConversationState;
  micVolume: number;
  currentTranscript?: string;
  isActive: boolean;
}

const JarvisAdvancedVisualizer: React.FC<JarvisAdvancedVisualizerProps> = ({
  conversationState,
  micVolume,
  currentTranscript,
  isActive
}) => {
  const getStateColor = () => {
    switch (conversationState) {
      case 'listening':
        return 'from-blue-500 to-cyan-400';
      case 'processing':
        return 'from-yellow-500 to-orange-400';
      case 'speaking':
        return 'from-green-500 to-emerald-400';
      case 'error':
        return 'from-red-500 to-pink-400';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };

  const getStateText = () => {
    switch (conversationState) {
      case 'listening':
        return 'Écoute...';
      case 'processing':
        return 'Traitement...';
      case 'speaking':
        return 'Parle...';
      case 'error':
        return 'Erreur';
      default:
        return 'Inactif';
    }
  };

  const getPulseAnimation = () => {
    if (!isActive) return '';
    
    switch (conversationState) {
      case 'listening':
        return 'animate-pulse';
      case 'processing':
        return 'animate-spin';
      case 'speaking':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-80 h-80 mx-auto mb-6">
      {/* Cercle principal Jarvis */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`
            w-64 h-64 rounded-full 
            bg-gradient-to-br ${getStateColor()}
            ${getPulseAnimation()}
            shadow-2xl
            border-4 border-white/20
            flex items-center justify-center
            transition-all duration-500
          `}
          style={{
            transform: isActive ? `scale(${1 + micVolume * 0.001})` : 'scale(1)',
            boxShadow: isActive ? `0 0 ${20 + micVolume}px rgba(59, 130, 246, 0.5)` : '0 0 20px rgba(0,0,0,0.3)'
          }}
        >
          {/* Cercle intérieur */}
          <div className="w-48 h-48 rounded-full bg-black/30 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
              {/* Indicateur de volume */}
              {conversationState === 'listening' && (
                <div 
                  className="w-16 h-16 rounded-full bg-white/40 transition-all duration-100"
                  style={{
                    transform: `scale(${0.5 + (micVolume / 100) * 0.5})`
                  }}
                />
              )}
              
              {/* Icône de traitement */}
              {conversationState === 'processing' && (
                <div className="w-16 h-16 rounded-full bg-white/40 animate-ping" />
              )}
              
              {/* Indicateur de parole */}
              {conversationState === 'speaking' && (
                <div className="flex space-x-1">
                  <div className="w-2 h-8 bg-white/60 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-12 bg-white/60 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-6 bg-white/60 animate-pulse" style={{ animationDelay: '300ms' }} />
                  <div className="w-2 h-10 bg-white/60 animate-pulse" style={{ animationDelay: '450ms' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Anneaux de réactivité */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-white/20 animate-pulse" />
          <div className="absolute inset-8 rounded-full border border-white/30" style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Texte d'état */}
      <div className="absolute -bottom-16 left-0 right-0 text-center">
        <div className="text-2xl font-bold text-white mb-2">
          {getStateText()}
        </div>
        
        {/* Volume bar */}
        {conversationState === 'listening' && (
          <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto mb-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-100"
              style={{ width: `${micVolume}%` }}
            />
          </div>
        )}
        
        {/* Transcript actuel */}
        {currentTranscript && (
          <div className="text-sm text-gray-300 max-w-md mx-auto px-4">
            "{currentTranscript}"
          </div>
        )}
      </div>

      {/* Particules d'ambiance */}
      {isActive && conversationState === 'listening' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping"
              style={{
                top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
                left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JarvisAdvancedVisualizer;

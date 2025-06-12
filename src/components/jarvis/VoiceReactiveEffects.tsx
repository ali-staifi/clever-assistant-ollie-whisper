
import React from 'react';
import { motion } from 'framer-motion';

interface VoiceReactiveEffectsProps {
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

const VoiceReactiveEffects: React.FC<VoiceReactiveEffectsProps> = ({
  isListening,
  isSpeaking,
  micVolume,
  voiceParams
}) => {
  // Couleurs basées sur l'émotion
  const emotionGradients = {
    neutral: 'from-blue-500 to-cyan-500',
    happy: 'from-yellow-500 to-orange-500',
    sad: 'from-blue-700 to-indigo-700',
    angry: 'from-red-500 to-pink-500',
    surprised: 'from-purple-500 to-pink-500'
  };
  
  const currentGradient = emotionGradients[voiceParams?.emotion as keyof typeof emotionGradients] || 'from-blue-500 to-cyan-500';
  
  // Calcul de l'intensité basée sur les paramètres
  const intensity = (voiceParams?.energy || 1) * (isSpeaking ? 2 : isListening ? micVolume + 0.5 : 0.3);
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Fond réactif */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${currentGradient} opacity-20`}
        animate={{
          opacity: intensity * 0.3,
          scale: 1 + intensity * 0.1
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Ondes sonores */}
      {(isSpeaking || isListening) && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full border-2 bg-gradient-to-r ${currentGradient} opacity-30`}
              style={{
                width: 100 + i * 50,
                height: 100 + i * 50,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      )}
      
      {/* Particules flottantes */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${currentGradient}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={isSpeaking ? {
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            } : {
              y: [0, -10, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      {/* Barre d'énergie */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/30 rounded-full p-2">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${currentGradient}`}
            animate={{
              width: `${Math.min(intensity * 100, 100)}%`
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="text-center text-white/70 text-xs mt-1">
          Intensité vocale: {voiceParams?.emotion || 'neutral'} 
          {isSpeaking && ' (PARLE)'}
          {isListening && ' (ÉCOUTE)'}
        </div>
      </div>
    </div>
  );
};

export default VoiceReactiveEffects;

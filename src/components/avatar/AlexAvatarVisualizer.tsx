import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AlexAvatarVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotionalState: 'neutral' | 'encouraging' | 'supportive' | 'energetic';
  micVolume?: number;
}

export const AlexAvatarVisualizer: React.FC<AlexAvatarVisualizerProps> = ({
  isListening,
  isSpeaking,
  emotionalState,
  micVolume = 0
}) => {
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    if (isSpeaking) {
      setIntensity(0.8);
    } else if (isListening) {
      setIntensity(Math.min(micVolume * 2, 1));
    } else {
      setIntensity(0.2);
    }
  }, [isSpeaking, isListening, micVolume]);

  const getEmotionColors = () => {
    switch (emotionalState) {
      case 'encouraging':
        return {
          primary: 'hsl(142, 76%, 36%)', // Vert encourageant
          secondary: 'hsl(160, 100%, 85%)',
          glow: 'hsl(142, 76%, 60%)'
        };
      case 'supportive':
        return {
          primary: 'hsl(217, 91%, 60%)', // Bleu apaisant
          secondary: 'hsl(217, 100%, 90%)',
          glow: 'hsl(217, 91%, 75%)'
        };
      case 'energetic':
        return {
          primary: 'hsl(45, 100%, 60%)', // Orange énergique
          secondary: 'hsl(45, 100%, 85%)',
          glow: 'hsl(45, 100%, 70%)'
        };
      default:
        return {
          primary: 'hsl(200, 100%, 50%)', // Bleu neutre
          secondary: 'hsl(200, 100%, 85%)',
          glow: 'hsl(200, 100%, 70%)'
        };
    }
  };

  const colors = getEmotionColors();
  
  const getStatusText = () => {
    if (isSpeaking) return "Alex vous parle...";
    if (isListening) return "Alex vous écoute...";
    return "Alex est prêt à vous aider";
  };

  const getAvatarExpression = () => {
    if (isSpeaking) return "😊";
    if (isListening) return "👂";
    if (emotionalState === 'encouraging') return "💪";
    if (emotionalState === 'supportive') return "🤗";
    if (emotionalState === 'energetic') return "⚡";
    return "😌";
  };

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Avatar Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Main Avatar Circle */}
        <motion.div
          className="relative w-48 h-48 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            border: `3px solid ${colors.glow}`
          }}
          animate={{
            scale: intensity > 0.5 ? [1, 1.05, 1] : 1,
            rotate: isSpeaking ? [0, 2, -2, 0] : 0
          }}
          transition={{
            scale: {
              duration: 0.6,
              repeat: isSpeaking ? Infinity : 0
            },
            rotate: {
              duration: 0.5,
              repeat: isSpeaking ? Infinity : 0
            }
          }}
        >
          {/* Avatar Face */}
          <motion.div
            className="text-6xl"
            animate={{
              scale: isSpeaking ? [1, 1.1, 1] : 1
            }}
            transition={{
              duration: 0.5,
              repeat: isSpeaking ? Infinity : 0
            }}
          >
            {getAvatarExpression()}
          </motion.div>

          {/* Voice Waves */}
          {isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="absolute w-full h-full rounded-full border-2 opacity-70"
                  style={{ borderColor: colors.glow }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.7, 0, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                />
              ))}
            </div>
          )}

          {/* Listening Indicator */}
          {isListening && (
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity
              }}
            >
              <span className="text-white text-sm">🎤</span>
            </motion.div>
          )}
        </motion.div>

        {/* Floating Particles */}
        {(isSpeaking || isListening) && (
          <div className="absolute inset-0">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                className="absolute w-2 h-2 rounded-full opacity-60"
                style={{
                  backgroundColor: colors.primary,
                  left: `${20 + (index * 15)}%`,
                  top: `${30 + (index % 3) * 20}%`
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0.6, 1, 0.6],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Text */}
      <motion.div
        className="absolute -bottom-8 left-0 right-0 text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-sm font-medium text-muted-foreground">
          {getStatusText()}
        </p>
      </motion.div>

      {/* Emotional State Indicator */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg"
          style={{ backgroundColor: colors.primary }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {emotionalState === 'neutral' ? 'Calme' : 
           emotionalState === 'encouraging' ? 'Encourageant' :
           emotionalState === 'supportive' ? 'Bienveillant' : 'Énergique'}
        </motion.div>
      </div>
    </div>
  );
};
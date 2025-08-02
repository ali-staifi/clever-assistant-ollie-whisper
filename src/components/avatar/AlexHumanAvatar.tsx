import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { DIDService } from '../../services/avatar/DIDService';
import { Button } from '../ui/button';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import alexAvatarImage from '../../assets/alex-avatar.jpg';

interface AlexHumanAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotionalState: 'neutral' | 'encouraging' | 'supportive' | 'energetic';
  currentText?: string;
  onConfigureDID?: () => void;
}

export const AlexHumanAvatar: React.FC<AlexHumanAvatarProps> = ({
  isListening,
  isSpeaking,
  emotionalState,
  currentText,
  onConfigureDID
}) => {
  const [didService, setDidService] = useState<DIDService | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Configuration D-ID depuis localStorage ou variables d'environnement
  useEffect(() => {
    const apiKey = localStorage.getItem('did-api-key') || '';
    if (apiKey) {
      setDidService(new DIDService({ apiKey }));
    }
  }, []);

  // Générer une vidéo quand Alex parle
  useEffect(() => {
    if (isSpeaking && currentText && didService && !isGenerating) {
      generateTalkingVideo();
    }
  }, [isSpeaking, currentText, didService]);

  const generateTalkingVideo = async () => {
    if (!didService || !currentText) return;

    setIsGenerating(true);
    setError(null);

    try {
      const videoUrl = await didService.createTalkingAvatar(
        alexAvatarImage,
        currentText,
        emotionalState
      );
      
      if (videoUrl) {
        setVideoUrl(videoUrl);
      } else {
        setError('Impossible de générer la vidéo avatar');
      }
    } catch (err) {
      setError('Erreur lors de la génération de l\'avatar');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusText = () => {
    if (isGenerating) return "Alex prépare sa réponse...";
    if (isSpeaking && videoUrl) return "Alex vous parle...";
    if (isSpeaking && !videoUrl) return "Alex réfléchit...";
    if (isListening) return "Alex vous écoute...";
    return "Alex est prêt à vous aider";
  };

  const getEmotionColor = () => {
    switch (emotionalState) {
      case 'encouraging': return 'hsl(142, 76%, 60%)';
      case 'supportive': return 'hsl(217, 91%, 75%)';
      case 'energetic': return 'hsl(45, 100%, 70%)';
      default: return 'hsl(200, 100%, 70%)';
    }
  };

  return (
    <div className="relative w-96 h-96 mx-auto">
      {/* Avatar Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Static Image or Video */}
        <motion.div
          className="relative w-80 h-80 rounded-full overflow-hidden shadow-2xl"
          style={{
            border: `4px solid ${getEmotionColor()}`
          }}
          animate={{
            scale: isListening ? [1, 1.02, 1] : 1,
            boxShadow: isSpeaking 
              ? [`0 0 20px ${getEmotionColor()}40`, `0 0 40px ${getEmotionColor()}60`, `0 0 20px ${getEmotionColor()}40`]
              : `0 0 20px ${getEmotionColor()}20`
          }}
          transition={{
            scale: { duration: 2, repeat: isListening ? Infinity : 0 },
            boxShadow: { duration: 1.5, repeat: isSpeaking ? Infinity : 0 }
          }}
        >
          {/* Video Avatar (when speaking and available) */}
          {videoUrl && isSpeaking ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              muted={isMuted}
              className="w-full h-full object-cover"
              onEnded={() => setVideoUrl(null)}
            />
          ) : (
            /* Static Avatar Image */
            <img
              src={alexAvatarImage}
              alt="Alex Avatar"
              className="w-full h-full object-cover"
            />
          )}

          {/* Overlay effects */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>

        {/* Listening Indicator */}
        {isListening && (
          <motion.div
            className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: getEmotionColor() }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-white text-lg">🎤</span>
          </motion.div>
        )}

        {/* Voice Waves (when speaking) */}
        {(isSpeaking || isGenerating) && (
          <div className="absolute inset-0">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="absolute w-full h-full rounded-full border-2 opacity-30"
                style={{ borderColor: getEmotionColor() }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.7
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-2">
        {videoUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onConfigureDID}
        >
          <Settings className="h-4 w-4" />
          D-ID Config
        </Button>
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

      {/* Error Display */}
      {error && (
        <motion.div
          className="absolute -bottom-20 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-destructive bg-destructive/10 px-3 py-1 rounded-full">
            {error}
          </p>
        </motion.div>
      )}

      {/* Emotional State Indicator */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="px-4 py-2 rounded-full text-xs font-medium text-white shadow-lg"
          style={{ backgroundColor: getEmotionColor() }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {emotionalState === 'neutral' ? 'Calme' : 
           emotionalState === 'encouraging' ? 'Encourageant' :
           emotionalState === 'supportive' ? 'Bienveillant' : 'Énergique'}
        </motion.div>
      </div>

      {/* D-ID Setup Reminder */}
      {!didService && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-sm font-medium mb-2">Configuration D-ID requise</p>
            <Button variant="outline" size="sm" onClick={onConfigureDID}>
              Configurer D-ID
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
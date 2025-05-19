
import { useState, useRef } from 'react';
import { FastSpeech2Service, FastSpeech2Params } from '@/services/speech/FastSpeech2Service';
import { MaryTTSService } from '@/services/speech/MaryTTSService';
import { useToast } from '@/hooks/use-toast';

export const useFastSpeech2 = (maryTTSService?: MaryTTSService) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://localhost:5000');
  const [modelName, setModelName] = useState('fastspeech2');
  const { toast } = useToast();
  
  // Utiliser MaryTTS comme fallback si aucun n'est fourni
  const maryTTSRef = useRef(maryTTSService || new MaryTTSService());
  
  // Service FastSpeech2
  const fastSpeech2Ref = useRef(new FastSpeech2Service(
    maryTTSRef.current, 
    serverUrl,
    modelName
  ));
  
  // Paramètres vocaux
  const [voiceParams, setVoiceParams] = useState<FastSpeech2Params>({
    speed: 1.0,
    pitch: 1.0,
    energy: 1.0,
    emotionStrength: 0.5,
    emotion: 'neutral'
  });
  
  // Configurer le service
  const configure = (config: {
    serverUrl?: string;
    modelName?: string;
    params?: Partial<FastSpeech2Params>;
  }) => {
    if (config.serverUrl) {
      setServerUrl(config.serverUrl);
      fastSpeech2Ref.current.setServer(config.serverUrl);
    }
    
    if (config.modelName) {
      setModelName(config.modelName);
      fastSpeech2Ref.current.setModel(config.modelName);
    }
    
    if (config.params) {
      setVoiceParams(prev => ({ ...prev, ...config.params }));
      fastSpeech2Ref.current.setDefaultParams(config.params);
    }
    
    setIsConfigured(true);
    
    toast({
      title: "Configuration FastSpeech2",
      description: "Paramètres de synthèse vocale mis à jour"
    });
  };
  
  // Tester la connexion
  const testConnection = async (): Promise<boolean> => {
    try {
      const success = await fastSpeech2Ref.current.checkConnection();
      
      if (success) {
        toast({
          title: "Connexion FastSpeech2",
          description: "La connexion au service FastSpeech2 est établie"
        });
      } else {
        toast({
          title: "Erreur FastSpeech2",
          description: "Impossible de se connecter au service FastSpeech2",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Erreur FastSpeech2",
        description: "Échec de la tentative de connexion",
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  // Parler avec FastSpeech2
  const speak = async (
    text: string,
    params?: Partial<FastSpeech2Params>
  ): Promise<boolean> => {
    if (!text || text.trim() === '') return false;
    
    setIsSpeaking(true);
    
    // Fusionner les paramètres par défaut avec ceux fournis
    const finalParams = params ? { ...voiceParams, ...params } : voiceParams;
    
    const success = await fastSpeech2Ref.current.speak(text, finalParams, () => {
      setIsSpeaking(false);
    });
    
    if (!success) {
      setIsSpeaking(false);
      toast({
        title: "Erreur FastSpeech2",
        description: "Échec de la synthèse vocale",
        variant: "destructive"
      });
    }
    
    return success;
  };
  
  // Arrêter de parler
  const stopSpeaking = () => {
    setIsSpeaking(false);
    // Dans une implémentation réelle, il faudrait appeler une méthode pour arrêter la synthèse
  };
  
  // Changer les paramètres émotionnels
  const setEmotion = (emotion: FastSpeech2Params['emotion'], strength: number = 0.5) => {
    setVoiceParams(prev => ({
      ...prev,
      emotion,
      emotionStrength: Math.max(0, Math.min(1, strength))
    }));
  };
  
  return {
    speak,
    stopSpeaking,
    isSpeaking,
    configure,
    testConnection,
    setSpeed: (speed: number) => setVoiceParams(prev => ({ ...prev, speed })),
    setPitch: (pitch: number) => setVoiceParams(prev => ({ ...prev, pitch })),
    setEnergy: (energy: number) => setVoiceParams(prev => ({ ...prev, energy })),
    setEmotion,
    voiceParams,
    isConfigured,
    serverUrl,
    modelName,
    fastSpeech2Service: fastSpeech2Ref.current
  };
};

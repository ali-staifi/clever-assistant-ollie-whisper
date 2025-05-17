
import { useState, useEffect, useRef } from 'react';
import { MaryTTSService } from '@/services/speech/MaryTTSService';

// Pour les paramètres de configuration
interface MaryTTSConfig {
  serverUrl?: string;
  voice?: string;
  locale?: string;
}

export const useMaryTTS = (config?: MaryTTSConfig) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [currentVoice, setCurrentVoice] = useState(config?.voice || 'cmu-slt-hsmm');
  const [serverUrl, setServerUrl] = useState(config?.serverUrl || 'http://localhost:59125');
  const [isConfigured, setIsConfigured] = useState(false);
  
  const ttsServiceRef = useRef(new MaryTTSService(
    config?.serverUrl,
    config?.voice,
    config?.locale
  ));

  // Effet pour charger les voix disponibles
  useEffect(() => {
    if (isConfigured) {
      loadAvailableVoices();
    }
  }, [isConfigured]);

  // Charger les voix disponibles
  const loadAvailableVoices = async () => {
    try {
      const voices = await ttsServiceRef.current.getAvailableVoices();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Error loading MaryTTS voices:', error);
    }
  };

  // Configurer le service
  const configureTTS = (newConfig: MaryTTSConfig) => {
    if (newConfig.serverUrl) {
      ttsServiceRef.current.setServerUrl(newConfig.serverUrl);
      setServerUrl(newConfig.serverUrl);
    }
    
    if (newConfig.voice) {
      ttsServiceRef.current.setVoice(newConfig.voice);
      setCurrentVoice(newConfig.voice);
    }
    
    if (newConfig.locale) {
      ttsServiceRef.current.setLocale(newConfig.locale);
    }
    
    setIsConfigured(true);
  };

  // Parler
  const speak = async (text: string) => {
    setIsSpeaking(true);
    const success = await ttsServiceRef.current.speak(text, () => {
      setIsSpeaking(false);
    });
    
    if (!success) {
      setIsSpeaking(false);
    }
    
    return success;
  };

  // Arrêter de parler
  const stopSpeaking = () => {
    ttsServiceRef.current.stopSpeaking();
    setIsSpeaking(false);
  };

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    configureTTS,
    availableVoices,
    currentVoice,
    serverUrl,
    isConfigured
  };
};

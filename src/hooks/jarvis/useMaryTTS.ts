
import { useState, useEffect, useRef } from 'react';
import { MaryTTSService } from '@/services/speech/MaryTTSService';
import { useToast } from '@/hooks/use-toast';

// Pour les paramètres de configuration
interface MaryTTSConfig {
  serverUrl?: string;
  voice?: string;
  locale?: string;
}

export const useMaryTTS = (config?: MaryTTSConfig) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [currentVoice, setCurrentVoice] = useState(config?.voice || 'upmc-pierre-hsmm');
  const [serverUrl, setServerUrl] = useState(config?.serverUrl || 'http://localhost:59125');
  const [isConfigured, setIsConfigured] = useState(false);
  const [locale, setLocale] = useState(config?.locale || 'fr_FR');
  const { toast } = useToast();
  
  const ttsServiceRef = useRef(new MaryTTSService(
    config?.serverUrl,
    config?.voice,
    config?.locale
  ));

  // Effet pour charger les voix disponibles
  useEffect(() => {
    if (isConfigured && serverUrl) {
      loadAvailableVoices();
    }
  }, [isConfigured, serverUrl]);

  // Charger les voix disponibles
  const loadAvailableVoices = async () => {
    try {
      const voices = await ttsServiceRef.current.getAvailableVoices();
      setAvailableVoices(voices);
      console.log("Voix MaryTTS disponibles:", voices);
    } catch (error) {
      console.error('Erreur lors du chargement des voix MaryTTS:', error);
      toast({
        title: "Erreur MaryTTS",
        description: "Impossible de charger les voix disponibles du serveur MaryTTS. Vérifiez la connexion.",
        variant: "destructive",
      });
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
      setLocale(newConfig.locale);
    }
    
    setIsConfigured(true);
    console.log("MaryTTS configuré:", newConfig);
    
    // Notifier l'utilisateur
    toast({
      title: "Configuration MaryTTS",
      description: "Les paramètres MaryTTS ont été appliqués avec succès.",
    });
  };

  // Tester la connexion au serveur MaryTTS
  const testConnection = async (url: string = serverUrl): Promise<boolean> => {
    try {
      const response = await fetch(`${url}/version`);
      const success = response.ok;
      
      if (success) {
        toast({
          title: "Connexion MaryTTS",
          description: "La connexion au serveur MaryTTS a réussi.",
        });
      } else {
        toast({
          title: "Erreur MaryTTS",
          description: "Impossible de se connecter au serveur MaryTTS.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erreur lors du test de connexion MaryTTS:', error);
      toast({
        title: "Erreur MaryTTS",
        description: "Échec de connexion au serveur MaryTTS. Vérifiez l'URL et que le serveur est actif.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Parler
  const speak = async (text: string) => {
    if (!text || text.trim() === '') return false;
    
    setIsSpeaking(true);
    console.log(`MaryTTS - synthèse vocale: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    const success = await ttsServiceRef.current.speak(text, () => {
      setIsSpeaking(false);
    });
    
    if (!success) {
      setIsSpeaking(false);
      toast({
        title: "Erreur MaryTTS",
        description: "Échec de la synthèse vocale. Vérifiez les paramètres MaryTTS.",
        variant: "destructive",
      });
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
    testConnection,
    loadAvailableVoices,
    availableVoices,
    currentVoice,
    serverUrl,
    locale,
    isConfigured
  };
};


import { useState } from 'react';
import { SpeechService } from '@/services/SpeechService';

interface VoiceSettings {
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  roboticEffect?: number;
}

export const useSpeechSynthesis = (speechService?: SpeechService) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = (text: string) => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    setIsSpeaking(true);
    speechService.speak(text, () => {
      setIsSpeaking(false);
    });
  };

  const toggleSpeaking = () => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    if (isSpeaking) {
      // Stop speaking with empty text
      speechService.stopSpeaking();
      setIsSpeaking(false);
    }
  };
  
  const setVoice = (voiceName: string) => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    // Trouver la voix pour obtenir sa langue
    const voices = speechService.getAvailableVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceName);
    
    // Définir la voix
    speechService.setVoice(voiceName);
    
    // Mettre à jour la langue si une voix est trouvée
    if (selectedVoice) {
      // Synchroniser la langue avec celle de la voix
      speechService.setLanguage(selectedVoice.lang);
      console.log(`Langue mise à jour en fonction de la voix: ${selectedVoice.lang}`);
    }
  };
  
  const setVoiceSettings = (settings: VoiceSettings) => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    if (settings.voiceName) {
      // Utiliser setVoice qui synchronisera aussi la langue
      setVoice(settings.voiceName);
    }
    
    if (settings.rate !== undefined) {
      speechService.setRate(settings.rate);
    }
    
    if (settings.pitch !== undefined) {
      speechService.setPitch(settings.pitch);
    }
    
    if (settings.volume !== undefined) {
      speechService.setVolume(settings.volume);
    }
    
    if (settings.roboticEffect !== undefined) {
      speechService.setRoboticEffect(settings.roboticEffect);
    }
  };
  
  const getAvailableVoices = () => {
    return speechService ? speechService.getAvailableVoices() : [];
  };
  
  const stopSpeaking = () => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  return {
    isSpeaking,
    speak,
    toggleSpeaking,
    stopSpeaking,
    setVoice,
    setVoiceSettings,
    getAvailableVoices
  };
};

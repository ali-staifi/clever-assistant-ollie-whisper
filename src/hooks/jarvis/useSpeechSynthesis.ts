
import { useState } from 'react';
import { SpeechService } from '@/services/SpeechService';

interface VoiceSettings {
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeechSynthesis = (speechService: SpeechService) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = (text: string) => {
    setIsSpeaking(true);
    speechService.speak(text, () => {
      setIsSpeaking(false);
    });
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      // Utilisons la méthode correcte pour arrêter la synthèse vocale
      speechService.cancel();
      setIsSpeaking(false);
    }
  };
  
  const setVoice = (voiceName: string) => {
    speechService.setVoice(voiceName);
  };
  
  const setVoiceSettings = (settings: VoiceSettings) => {
    if (settings.voiceName) {
      speechService.setVoice(settings.voiceName);
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
  };
  
  const getAvailableVoices = () => {
    return speechService.getAvailableVoices();
  };

  return {
    isSpeaking,
    speak,
    toggleSpeaking,
    setVoice,
    setVoiceSettings,
    getAvailableVoices
  };
};

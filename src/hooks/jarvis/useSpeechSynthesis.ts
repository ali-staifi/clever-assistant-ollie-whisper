
import { useState } from 'react';
import { SpeechService } from '@/services/SpeechService';

interface VoiceSettings {
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  roboticEffect?: number;
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
      // Stop speaking with empty text
      speechService.stopSpeaking();
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
    
    if (settings.roboticEffect !== undefined) {
      speechService.setRoboticEffect(settings.roboticEffect);
    }
  };
  
  const getAvailableVoices = () => {
    return speechService.getAvailableVoices();
  };
  
  const stopSpeaking = () => {
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

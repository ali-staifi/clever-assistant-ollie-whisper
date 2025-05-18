
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
  
  const stopSpeaking = () => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };
  
  const setVoice = (voiceName: string) => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    // La méthode setVoice dans SpeechService gère maintenant la synchronisation des langues
    speechService.setVoice(voiceName);
  };
  
  const setVoiceSettings = (settings: VoiceSettings) => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    if (settings.voiceName) {
      // This will handle language synchronization
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
  
  // Helper function for testing French voice specifically
  const testFrenchVoice = () => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    // Get available French voices
    const voices = getAvailableVoices();
    const frenchVoices = voices.filter(voice => 
      voice.lang.startsWith('fr') || 
      voice.name.toLowerCase().includes('french') ||
      voice.name.includes('français')
    );
    
    // Select a French voice if available
    if (frenchVoices.length > 0) {
      const frenchVoiceName = frenchVoices[0].name;
      setVoice(frenchVoiceName);
      
      // Test with French text
      speak("Bonjour, je suis votre assistant vocal. Je parle français maintenant. Comment puis-je vous aider aujourd'hui?");
      return true;
    } else {
      console.warn("Aucune voix française n'a été trouvée");
      return false;
    }
  };
  
  // New function for testing Arabic voices with French text
  const testArabicVoiceInFrench = () => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    // Get available Arabic voices
    const voices = getAvailableVoices();
    const arabicVoices = voices.filter(voice => 
      voice.lang.startsWith('ar') || 
      voice.name.toLowerCase().includes('arabic') || 
      voice.name.includes('arabe')
    );
    
    // Select an Arabic voice if available
    if (arabicVoices.length > 0) {
      const arabicVoiceName = arabicVoices[0].name;
      setVoice(arabicVoiceName);
      
      // Test with French text even though it's an Arabic voice
      speak("Bonjour, je suis votre assistant vocal avec une voix arabe mais qui parle en français. Comment puis-je vous aider aujourd'hui?");
      return true;
    } else {
      console.warn("Aucune voix arabe n'a été trouvée");
      return false;
    }
  };

  return {
    isSpeaking,
    speak,
    toggleSpeaking,
    stopSpeaking,
    setVoice,
    setVoiceSettings,
    getAvailableVoices,
    testFrenchVoice,
    testArabicVoiceInFrench // Add new Arabic voice with French text function
  };
};

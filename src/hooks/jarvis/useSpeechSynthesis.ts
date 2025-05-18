
import { useState } from 'react';
import { SpeechService } from '@/services/SpeechService';

interface VoiceSettings {
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  roboticEffect?: number;
  language?: string; // Ajout d'un paramètre de langue
}

export const useSpeechSynthesis = (speechService?: SpeechService) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr-FR'); // Par défaut en français
  
  const speak = async (text: string): Promise<boolean> => {
    if (!speechService) {
      console.error("Speech service is not available");
      return false;
    }
    
    setIsSpeaking(true);
    return new Promise<boolean>((resolve) => {
      speechService.speak(text, () => {
        setIsSpeaking(false);
        resolve(true);
      });
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
    
    // Mettre à jour la langue actuelle en fonction de la voix
    const voices = getAvailableVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceName);
    if (selectedVoice) {
      setCurrentLanguage(selectedVoice.lang);
    }
  };
  
  const setLanguage = (language: string) => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    setCurrentLanguage(language);
    speechService.setLanguage(language);
    
    // Sélectionner automatiquement une voix correspondant à la langue
    const voices = getAvailableVoices();
    const matchingVoices = voices.filter(voice => 
      voice.lang.startsWith(language.split('-')[0])
    );
    
    if (matchingVoices.length > 0) {
      // Sélectionner la première voix correspondant à la langue
      setVoice(matchingVoices[0].name);
    }
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
    
    if (settings.language) {
      // Set language explicitly if provided
      setLanguage(settings.language);
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
  
  // Fonction pour obtenir les voix disponibles pour une langue spécifique
  const getVoicesForLanguage = (langCode: string) => {
    const voices = getAvailableVoices();
    return voices.filter(voice => voice.lang.startsWith(langCode));
  };
  
  // Helper function for testing French voice specifically
  const testFrenchVoice = () => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    // Get available French voices
    const frenchVoices = getVoicesForLanguage('fr');
    
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
  
  // Fonction pour tester les voix arabes
  const testArabicVoice = () => {
    if (!speechService) {
      console.error("Speech service is not available");
      return;
    }
    
    // Get available Arabic voices
    const arabicVoices = getVoicesForLanguage('ar');
    
    // Select an Arabic voice if available
    if (arabicVoices.length > 0) {
      const arabicVoiceName = arabicVoices[0].name;
      setVoice(arabicVoiceName);
      
      // Test with Arabic text
      speak("مرحبا، أنا المساعد الصوتي الخاص بك. أتحدث العربية الآن. كيف يمكنني مساعدتك اليوم؟");
      return true;
    } else {
      console.warn("لم يتم العثور على صوت عربي");
      return false;
    }
  };
  
  // Function for testing Arabic voices with French text
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
    setLanguage,
    setVoiceSettings,
    getAvailableVoices,
    getVoicesForLanguage,
    testFrenchVoice,
    testArabicVoice,
    testArabicVoiceInFrench,
    currentLanguage
  };
};


import { useRef, useEffect, useState } from 'react';
import { SpeechService } from '@/services/SpeechService';
import { useAudioMonitoring } from './useAudioMonitoring';
import { useMicSensitivity } from './useMicSensitivity';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export const useSpeechService = () => {
  const speechService = useRef(new SpeechService()).current;
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Paramètres vocaux avancés globaux avec genre de voix
  const [globalVoiceSettings, setGlobalVoiceSettings] = useState({
    roboticEffect: 0.3,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voiceGender: 'female' as 'male' | 'female' | 'neutral'
  });
  
  // Get microphone sensitivity settings
  const { micSensitivity, setMicSensitivity } = useMicSensitivity();
  
  // Setup audio monitoring
  const { micVolume, setupAudioMonitoring } = useAudioMonitoring(false, micSensitivity);
  
  // Setup speech recognition
  const {
    isListening,
    transcript,
    setTranscript,
    speechRecognitionAvailable,
    errorMessage,
    setErrorMessage,
    startListening: startSpeechRecognition,
    stopListening,
    testMicrophone: testSpeechRecognition,
    checkSpeechRecognition,
    noMicrophoneMode,
    toggleNoMicrophoneMode
  } = useSpeechRecognition(speechService, micSensitivity);
  
  // Setup speech synthesis
  const { 
    isSpeaking, 
    speak: basSpeak, 
    toggleSpeaking,
    setVoice,
    setLanguage,
    setVoiceSettings,
    getAvailableVoices
  } = useSpeechSynthesis(speechService);
  
  // Fonction pour sélectionner automatiquement une voix selon le genre ET la langue française
  const selectVoiceByGender = (gender: 'male' | 'female' | 'neutral', preferredLanguage: string = 'fr-FR') => {
    const voices = getAvailableVoices();
    
    // Filtrer d'abord par langue préférée (français par défaut)
    let languageVoices = voices.filter(voice => 
      voice.lang.startsWith(preferredLanguage.split('-')[0])
    );
    
    // Si pas de voix française, utiliser toutes les voix
    if (languageVoices.length === 0) {
      languageVoices = voices;
    }
    
    let filteredVoices: SpeechSynthesisVoice[] = [];
    
    if (gender === 'female') {
      filteredVoices = languageVoices.filter(voice => {
        const name = voice.name.toLowerCase();
        return name.includes('female') || 
               name.includes('lisa') || 
               name.includes('sarah') || 
               name.includes('alice') || 
               name.includes('victoria') || 
               name.includes('samantha') ||
               name.includes('amélie') ||
               name.includes('marie') ||
               name.includes('hortense') ||
               name.includes('céline') ||
               name.includes('julie') ||
               name.includes('zira') ||
               name.includes('eva') ||
               name.includes('catherine');
      });
    } else if (gender === 'male') {
      filteredVoices = languageVoices.filter(voice => {
        const name = voice.name.toLowerCase();
        return name.includes('male') || 
               name.includes('david') || 
               name.includes('thomas') || 
               name.includes('daniel') || 
               name.includes('george') || 
               name.includes('eric') || 
               name.includes('roger') ||
               name.includes('paul') ||
               name.includes('claude') ||
               name.includes('guillaume') ||
               name.includes('mark') ||
               name.includes('james') ||
               name.includes('antoine');
      });
    }
    
    // Si aucune voix spécifique trouvée pour le genre, utiliser les voix de la langue
    if (filteredVoices.length === 0) {
      filteredVoices = languageVoices;
    }
    
    // Sélectionner la première voix française disponible
    if (filteredVoices.length > 0) {
      setVoice(filteredVoices[0].name);
      console.log(`Voix ${gender} sélectionnée: ${filteredVoices[0].name}`);
    }
  };
  
  // Fonction speak améliorée qui utilise les paramètres globaux
  const speak = async (text: string): Promise<boolean> => {
    // Appliquer les paramètres vocaux avancés avant de parler
    speechService.setRate(globalVoiceSettings.rate);
    speechService.setPitch(globalVoiceSettings.pitch);
    speechService.setVolume(globalVoiceSettings.volume);
    speechService.setRoboticEffect(globalVoiceSettings.roboticEffect);
    
    return await basSpeak(text);
  };
  
  // Fonctions pour mettre à jour les paramètres vocaux globaux
  const updateGlobalVoiceSettings = (settings: Partial<typeof globalVoiceSettings>) => {
    setGlobalVoiceSettings(prev => {
      const newSettings = { ...prev, ...settings };
      
      // Appliquer immédiatement au service vocal
      speechService.setRate(newSettings.rate);
      speechService.setPitch(newSettings.pitch);
      speechService.setVolume(newSettings.volume);
      speechService.setRoboticEffect(newSettings.roboticEffect);
      
      // Si le genre de voix a changé, sélectionner une nouvelle voix française
      if (settings.voiceGender && settings.voiceGender !== prev.voiceGender) {
        selectVoiceByGender(newSettings.voiceGender, 'fr-FR');
      }
      
      return newSettings;
    });
  };
  
  // Load available voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = getAvailableVoices();
        setAvailableVoices(voices);
        
        // Sélectionner automatiquement une voix française selon le genre par défaut
        if (voices.length > 0) {
          selectVoiceByGender(globalVoiceSettings.voiceGender, 'fr-FR');
        }
      };
      
      // Initial load
      loadVoices();
      
      // Listen for voice changes
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [getAvailableVoices]);
  
  // Check if speech recognition is available on mount and apply sensitivity
  useEffect(() => {
    checkSpeechRecognition();
  }, []);
  
  // Apply sensitivity changes to speech service
  useEffect(() => {
    if (typeof speechService.setSensitivity === 'function') {
      speechService.setSensitivity(micSensitivity);
    }
  }, [micSensitivity, speechService]);
  
  // Wrapper for startListening that includes audio monitoring setup
  const startListening = (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): boolean => {
    return startSpeechRecognition(onInterimResult, onFinalResult, setupAudioMonitoring);
  };
  
  // Wrapper for testMicrophone that includes audio monitoring setup
  const testMicrophone = () => {
    testSpeechRecognition(setupAudioMonitoring);
  };

  // Configure MaryTTS
  const configureMaryTTS = (useIt: boolean, serverUrl?: string, voice?: string, locale?: string) => {
    if (typeof speechService.configureMaryTTS === 'function') {
      speechService.configureMaryTTS(useIt, serverUrl, voice, locale);
    }
  };
  
  // Test MaryTTS connection
  const testMaryTTSConnection = async (serverUrl: string): Promise<boolean> => {
    if (typeof speechService.testMaryTTSConnection === 'function') {
      return await speechService.testMaryTTSConnection(serverUrl);
    }
    return false;
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    setTranscript,
    speechRecognitionAvailable,
    errorMessage,
    setErrorMessage,
    micVolume,
    micSensitivity,
    setMicSensitivity,
    startListening,
    stopListening,
    speak,
    toggleSpeaking,
    testMicrophone,
    noMicrophoneMode,
    toggleNoMicrophoneMode,
    configureMaryTTS,
    testMaryTTSConnection,
    setVoice,
    setVoiceSettings,
    availableVoices,
    speechService,
    setLanguage,
    // Nouveaux exports pour les paramètres vocaux avancés
    globalVoiceSettings,
    updateGlobalVoiceSettings,
    selectVoiceByGender
  };
};


import { useRef, useEffect, useState } from 'react';
import { SpeechService } from '@/services/SpeechService';
import { useAudioMonitoring } from './useAudioMonitoring';
import { useMicSensitivity } from './useMicSensitivity';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export const useSpeechService = () => {
  const speechService = useRef(new SpeechService()).current;
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Paramètres vocaux avancés globaux
  const [globalVoiceSettings, setGlobalVoiceSettings] = useState({
    roboticEffect: 0.3,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
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
      
      return newSettings;
    });
  };
  
  // Load available voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = getAvailableVoices();
        setAvailableVoices(voices);
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
    updateGlobalVoiceSettings
  };
};

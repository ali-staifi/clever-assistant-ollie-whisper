
import { useState, useEffect } from 'react';
import { useOllamaService } from './jarvis/useOllamaService';
import { useSpeechService } from './jarvis/useSpeechService';
import { useConversation } from './jarvis/useConversation';
import { useLanguageSettings } from './jarvis/useLanguageSettings';
import { useMessageProcessing } from './jarvis/useMessageProcessing';
import { useInputHandling } from './jarvis/useInputHandling';

export const useJarvisServices = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Set up Ollama service
  const {
    ollamaUrl,
    ollamaModel,
    ollamaStatus,
    availableModels,
    ollamaService,
    handleOllamaUrlChange,
    handleOllamaModelChange,
    checkOllamaConnection
  } = useOllamaService();

  // Set up speech service avec paramètres vocaux avancés
  const {
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
    setLanguage,
    speechService,
    globalVoiceSettings,
    updateGlobalVoiceSettings
  } = useSpeechService();

  // Set up conversation state
  const {
    messages,
    response,
    setResponse,
    isProcessing,
    setIsProcessing,
    addUserMessage,
    addAssistantMessage,
    clearConversation
  } = useConversation();

  // Set up language settings
  const {
    responseLanguage,
    changeResponseLanguage
  } = useLanguageSettings(setLanguage);

  // Set up message processing
  const {
    processOllamaResponse
  } = useMessageProcessing(ollamaService, messages, addAssistantMessage, speak);

  // Set up input handling
  const {
    toggleListening: handleToggleListening
  } = useInputHandling(
    speechService, 
    addUserMessage, 
    processOllamaResponse, 
    setTranscript,
    noMicrophoneMode,
    setErrorMessage,
    responseLanguage,
    ollamaStatus
  );

  // Expose speech service globally for component access
  useEffect(() => {
    window.jarvisSpeechService = speechService;
  }, [speechService]);
  
  // Wrapper for toggleListening that uses our handleToggleListening function
  const toggleListening = () => {
    handleToggleListening(isListening, stopListening, startListening);
  };

  const dismissError = () => {
    setErrorMessage('');
  };

  return {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    showSettings,
    setShowSettings,
    messages,
    ollamaUrl,
    ollamaModel,
    ollamaStatus,
    availableModels,
    errorMessage,
    speechRecognitionAvailable,
    micVolume,
    micSensitivity,
    setMicSensitivity,
    toggleListening,
    toggleSpeaking,
    handleOllamaUrlChange,
    handleOllamaModelChange,
    clearConversation,
    checkOllamaConnection,
    dismissError,
    testMicrophone,
    noMicrophoneMode,
    toggleNoMicrophoneMode,
    configureMaryTTS,
    testMaryTTSConnection,
    speechService,
    responseLanguage,
    changeResponseLanguage,
    // Nouveaux exports pour les paramètres vocaux avancés
    globalVoiceSettings,
    updateGlobalVoiceSettings
  };
};

// Extend Window interface to include global speechService
declare global {
  interface Window {
    jarvisSpeechService: any;
  }
}

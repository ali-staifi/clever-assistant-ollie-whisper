
import { useState, useEffect } from 'react';
import { useOpenRouter } from './useOpenRouter';
import { useSpeechService } from './jarvis/useSpeechService';
import { useConversation } from './jarvis/useConversation';
import { useLanguageSettings } from './jarvis/useLanguageSettings';
import { useInputHandling } from './jarvis/useInputHandling';
import { useMessageProcessingOpenRouter } from './jarvis/useMessageProcessingOpenRouter';

export const useJarvisServices = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  // OpenRouter as LLM provider
  const {
    apiKey,
    model,
    connectionStatus,
    availableModels,
    service,
    updateApiKey,
    updateModel,
    checkConnection
  } = useOpenRouter();

  // Map to legacy naming used across Jarvis components
  const ollamaUrl = 'https://openrouter.ai';
  const ollamaModel = model;
  const ollamaStatus = connectionStatus;
  const handleOllamaUrlChange = (_url: string) => {};
  const handleOllamaModelChange = (m: string) => updateModel(m);
  const checkOllamaConnection = () => checkConnection();

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
    updateGlobalVoiceSettings,
    selectVoiceByGender
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

  const {
    processOllamaResponse
  } = useMessageProcessingOpenRouter(service || null, messages, addAssistantMessage, speak);

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
    // Nouveaux exports pour les paramètres vocaux avancés avec genre
    globalVoiceSettings,
    updateGlobalVoiceSettings,
    selectVoiceByGender
  };
};

// Extend Window interface to include global speechService
declare global {
  interface Window {
    jarvisSpeechService: any;
  }
}

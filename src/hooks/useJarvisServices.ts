
import { useState, useEffect } from 'react';
import { useOllamaService } from './jarvis/useOllamaService';
import { useSpeechService } from './jarvis/useSpeechService';
import { useConversation } from './jarvis/useConversation';

export const useJarvisServices = () => {
  const [showSettings, setShowSettings] = useState(false);
  
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
    speechService
  } = useSpeechService();

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

  // Expose speech service globally for component access
  useEffect(() => {
    window.jarvisSpeechService = speechService;
  }, [speechService]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }
    
    // If we're in no-microphone mode, just add a text input field or trigger a dialog
    if (noMicrophoneMode) {
      const userMessage = prompt("Entrez votre message:");
      if (userMessage && userMessage.trim() !== '') {
        setTranscript(userMessage);
        addUserMessage(userMessage);
        processOllamaResponse(userMessage);
      }
      return;
    }
    
    // Check for connection before starting listening
    if (ollamaStatus === 'error') {
      setErrorMessage("Impossible de se connecter à Ollama. Veuillez vérifier les paramètres et réessayer.");
      return;
    }

    // Start listening and process the final result
    startListening(
      // Interim result handler
      (interimText) => {
        setTranscript(interimText);
      },
      // Final result handler
      async (finalText) => {
        setTranscript(finalText);
        addUserMessage(finalText);
        await processOllamaResponse(finalText);
      }
    );
  };
  
  const processOllamaResponse = async (text: string) => {
    setIsProcessing(true);
    setResponse('');
    
    try {
      // Store the full response text
      let fullResponse = '';
      
      await ollamaService.generateResponse(
        text,
        messages,
        (progressText) => {
          // Update both the temporary response state and our full response
          fullResponse = progressText;
          setResponse(progressText);
        }
      );
      
      // Save assistant response to messages and speak it
      addAssistantMessage(fullResponse);
      speak(fullResponse);
      
    } catch (error) {
      console.error('Error processing with Ollama:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      setResponse(`Désolé, j'ai rencontré une erreur lors du traitement de votre demande: ${errorMsg}`);
      
      setErrorMessage(`Erreur de traitement: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
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
    speechService
  };
};

// Extend Window interface to include global speechService
declare global {
  interface Window {
    jarvisSpeechService: any;
  }
}

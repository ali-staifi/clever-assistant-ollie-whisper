
import { useState } from 'react';
import { useOllamaService } from './jarvis/useOllamaService';
import { useSpeechService } from './jarvis/useSpeechService';
import { useConversation } from './jarvis/useConversation';

export const useJarvisServices = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    ollamaUrl,
    ollamaModel,
    ollamaStatus,
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
    startListening,
    stopListening,
    speak,
    toggleSpeaking,
    testMicrophone
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

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }
    
    // Check for connection before starting listening
    if (ollamaStatus === 'error') {
      setErrorMessage("Cannot connect to Ollama. Please check settings and try again.");
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
      setResponse(`Sorry, I encountered an error while processing your request: ${errorMsg}`);
      
      setErrorMessage(`Processing error: ${errorMsg}`);
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
    errorMessage,
    speechRecognitionAvailable,
    toggleListening,
    toggleSpeaking,
    handleOllamaUrlChange,
    handleOllamaModelChange,
    clearConversation,
    checkOllamaConnection,
    dismissError,
    testMicrophone,
  };
};

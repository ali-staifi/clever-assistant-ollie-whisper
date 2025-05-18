
import { SpeechService } from '@/services/SpeechService';

export const useInputHandling = (
  speechService: SpeechService,
  addUserMessage: (text: string) => void,
  processOllamaResponse: (text: string, language: string) => Promise<void>,
  setTranscript: (text: string) => void,
  noMicrophoneMode: boolean,
  setErrorMessage: (message: string) => void,
  responseLanguage: string,
  ollamaStatus: string
) => {
  const toggleListening = (isListening: boolean, stopListening: () => void, startListening: (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ) => boolean) => {
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
        processOllamaResponse(userMessage, responseLanguage);
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
        await processOllamaResponse(finalText, responseLanguage);
      }
    );
  };

  return {
    toggleListening
  };
};

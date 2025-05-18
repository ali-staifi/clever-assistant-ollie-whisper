
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
    
    // If in no-microphone mode, add an input field or trigger a dialog
    if (noMicrophoneMode) {
      // Use a prompt to get user text synchronously
      const userMessage = prompt("Entrez votre message:");
      
      // Check that the message is not null or empty
      if (userMessage && userMessage.trim() !== '') {
        console.log("User message in no-microphone mode:", userMessage);
        
        setTranscript(userMessage);
        addUserMessage(userMessage);
        
        // Process the response with a small delay to allow message display
        setTimeout(() => {
          processOllamaResponse(userMessage, responseLanguage)
            .catch(err => {
              console.error("Error processing response:", err);
              setErrorMessage(`Erreur de traitement: ${err.message || 'Erreur inconnue'}`);
            });
        }, 100);
      } else {
        console.log("User canceled or provided an empty message");
      }
      return;
    }
    
    // Check connection before starting listening
    if (ollamaStatus === 'error') {
      console.error("Cannot connect to Ollama. Current status:", ollamaStatus);
      setErrorMessage("Impossible de se connecter à Ollama. Veuillez vérifier les paramètres et réessayer.");
      return;
    }

    console.log("Starting listening...");
    
    // Start listening and process final result
    const started = startListening(
      // Interim result handler
      (interimText) => {
        setTranscript(interimText);
      },
      // Final result handler
      async (finalText) => {
        console.log("Final speech recognition result:", finalText);
        
        if (finalText.trim() !== '') {
          setTranscript(finalText);
          addUserMessage(finalText);
          
          try {
            console.log("Processing Ollama response for: ", finalText);
            await processOllamaResponse(finalText, responseLanguage);
          } catch (error) {
            console.error("Error processing response:", error);
            setErrorMessage("Erreur lors du traitement de votre demande. Veuillez réessayer.");
          }
        } else {
          console.log("Empty speech recognition result, ignored");
          setErrorMessage("Je n'ai pas entendu votre question. Veuillez parler plus distinctement ou utiliser le mode texte.");
        }
      }
    );
    
    if (!started) {
      console.error("Failed to start speech recognition");
      setErrorMessage("Impossible de démarrer la reconnaissance vocale. Veuillez vérifier les permissions de votre microphone.");
    }
  };

  return {
    toggleListening
  };
};

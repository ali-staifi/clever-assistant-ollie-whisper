
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
    
    // Si nous sommes en mode sans microphone, ajouter un champ de saisie ou déclencher une boîte de dialogue
    if (noMicrophoneMode) {
      // Utiliser un prompt pour obtenir le texte de l'utilisateur de façon synchrone
      const userMessage = prompt("Entrez votre message:");
      
      // Vérifier que le message n'est pas nul ou vide
      if (userMessage && userMessage.trim() !== '') {
        console.log("Message utilisateur en mode sans microphone:", userMessage);
        
        setTranscript(userMessage);
        addUserMessage(userMessage);
        
        // Traiter la réponse avec un petit délai pour permettre l'affichage du message
        setTimeout(() => {
          processOllamaResponse(userMessage, responseLanguage)
            .catch(err => console.error("Erreur lors du traitement de la réponse:", err));
        }, 100);
      } else {
        console.log("L'utilisateur a annulé ou fourni un message vide");
      }
      return;
    }
    
    // Vérifier la connexion avant de démarrer l'écoute
    if (ollamaStatus === 'error') {
      console.error("Impossible de se connecter à Ollama. Statut actuel:", ollamaStatus);
      setErrorMessage("Impossible de se connecter à Ollama. Veuillez vérifier les paramètres et réessayer.");
      return;
    }

    console.log("Démarrage de l'écoute...");
    
    // Démarrer l'écoute et traiter le résultat final
    const started = startListening(
      // Gestionnaire de résultat intermédiaire
      (interimText) => {
        setTranscript(interimText);
      },
      // Gestionnaire de résultat final
      async (finalText) => {
        console.log("Résultat final de la reconnaissance vocale:", finalText);
        
        if (finalText.trim() !== '') {
          setTranscript(finalText);
          addUserMessage(finalText);
          
          try {
            await processOllamaResponse(finalText, responseLanguage);
          } catch (error) {
            console.error("Erreur lors du traitement de la réponse:", error);
          }
        } else {
          console.log("Résultat de reconnaissance vocale vide, ignoré");
        }
      }
    );
    
    if (!started) {
      console.error("Échec du démarrage de la reconnaissance vocale");
    }
  };

  return {
    toggleListening
  };
};

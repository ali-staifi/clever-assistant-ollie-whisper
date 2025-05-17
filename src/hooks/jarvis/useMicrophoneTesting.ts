
import { SpeechService } from '@/services/SpeechService';
import { useSpeechErrors } from './useSpeechErrors';

export const useMicrophoneTesting = (
  speechService: SpeechService,
  isListening: boolean,
  noMicrophoneMode: boolean
) => {
  const { showToast, handleError } = useSpeechErrors();

  const testMicrophone = (setupAudioMonitoring: () => Promise<boolean>) => {
    // If in no-microphone mode, show appropriate message
    if (noMicrophoneMode) {
      showToast(
        "Mode sans microphone activé",
        "Le test du microphone n'est pas disponible en mode sans microphone. Utilisez le clavier pour saisir vos messages."
      );
      return;
    }

    showToast(
      "Test du microphone",
      "Veuillez parler après avoir cliqué sur OK. Cela vérifiera si votre microphone fonctionne."
    );

    // Start audio monitoring
    setupAudioMonitoring();

    // Short listening test
    const success = speechService.startListening(
      (interimText) => {
        if (interimText && interimText.length > 0) {
          // We got some speech! Microphone is working
          speechService.stopListening();
          showToast(
            "Test du microphone réussi",
            "Votre microphone fonctionne ! Voix détectée."
          );
        }
      },
      (finalText) => {
        // Successfully got final text
        speechService.stopListening();
        showToast(
          "Test du microphone réussi",
          "Votre microphone fonctionne correctement."
        );
      },
      (error) => {
        // Different handling for no-speech error
        if (error.includes('no-speech')) {
          showToast(
            "Aucune voix détectée",
            "Veuillez parler plus fort ou vérifier que votre microphone est activé.",
            "default" 
          );
        } else {
          handleError(error, false);
        }
      }
    );

    // Set a timeout to stop listening after 5 seconds if no speech is detected
    if (success) {
      setTimeout(() => {
        if (speechService) {
          speechService.stopListening();
        }
      }, 5000);
    }
  };

  return {
    testMicrophone
  };
};


import { useState, useEffect } from 'react';
import { SpeechService } from '@/services/SpeechService';
import { useToast } from '@/hooks/use-toast';

export const useSpeechRecognition = (speechService: SpeechService, micSensitivity: number) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const [noMicrophoneMode, setNoMicrophoneMode] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  
  // Check if speech recognition is available
  const checkSpeechRecognition = () => {
    const isSupported = speechService.isRecognitionSupported();
    setSpeechRecognitionAvailable(isSupported);
    
    if (!isSupported) {
      setErrorMessage('La reconnaissance vocale n\'est pas prise en charge dans votre navigateur ou aucun microphone n\'est détecté. Vous pouvez utiliser le mode sans microphone ou essayer avec Chrome, Edge ou Safari.');
      setNoMicrophoneMode(true);
      
      // Auto-enable no-microphone mode
      if (typeof speechService.enableNoMicrophoneMode === 'function') {
        speechService.enableNoMicrophoneMode(true);
      }
    }
    
    // Apply saved sensitivity to speech service
    if (typeof speechService.setSensitivity === 'function') {
      speechService.setSensitivity(micSensitivity);
    }
  };

  // Run check on mount
  useEffect(() => {
    checkSpeechRecognition();
  }, []);

  // Reset consecutive errors when the sensitivity is changed
  useEffect(() => {
    if (typeof speechService.setSensitivity === 'function') {
      speechService.setSensitivity(micSensitivity);
      setConsecutiveErrors(0);
    }
  }, [micSensitivity, speechService]);

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const startListening = (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void,
    setupAudioMonitoring: () => Promise<boolean>
  ): boolean => {
    // Clear any previous error
    setErrorMessage('');
    
    // Start audio monitoring if not in no-microphone mode
    if (!noMicrophoneMode) {
      setupAudioMonitoring();
    }
    
    const success = speechService.startListening(
      onInterimResult,
      (finalText) => {
        setIsListening(false);
        setConsecutiveErrors(0); // Reset errors on success
        onFinalResult(finalText);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        
        // Don't show error toast for no-speech as we handle it in RecognitionService
        if (error.includes("no-speech")) {
          return;
        }
        
        setIsListening(false);
        
        // Increment consecutive errors for clarity problems
        if (error.includes("understand") || error.includes("audio clearly")) {
          setConsecutiveErrors(prev => prev + 1);
        }
        
        // Provide different suggestions based on consecutive error count
        let friendlyError = error;
        let suggestions = "";
        
        if (consecutiveErrors > 2) {
          suggestions = `\n\nSuggestions: 
          1. Augmentez la sensibilité du microphone dans les réglages
          2. Parlez plus fort et plus clairement
          3. Réduisez les bruits ambiants
          4. Vérifiez que le bon microphone est sélectionné dans votre navigateur
          5. Essayez de redémarrer l'application`;
        }
        
        // Set a more user-friendly error message
        if (error.includes("microphone") || error.includes("permission")) {
          friendlyError = `Impossible d'accéder au microphone. Veuillez vérifier les permissions de votre navigateur.${suggestions}`;
        } else if (error.includes("understand") || error.includes("audio clearly")) {
          friendlyError = `Impossible de comprendre clairement l'audio. Essayez de parler plus fort ou d'ajuster la sensibilité du microphone.${suggestions}`;
        } else {
          friendlyError = `Erreur de reconnaissance vocale: ${error}${suggestions}`;
        }
          
        setErrorMessage(friendlyError);
        toast({
          title: "Erreur de reconnaissance vocale",
          description: friendlyError,
          variant: "destructive",
        });
      }
    );
    
    if (success) {
      setIsListening(true);
      
      if (!noMicrophoneMode) {
        // Notification to encourage the user to speak louder
        toast({
          title: "Écoute en cours...",
          description: "Parlez clairement et un peu plus fort qu'une conversation normale.",
          variant: "default",
        });
      } else {
        toast({
          title: "Mode sans microphone activé",
          description: "Utilisez le clavier pour saisir vos messages.",
          variant: "default",
        });
      }
    } else {
      const micError = "Impossible d'accéder au microphone. Veuillez vérifier les permissions de votre navigateur.";
      setErrorMessage(`Erreur de microphone: ${micError}`);
      toast({
        title: "Erreur de microphone",
        description: micError,
        variant: "destructive",
      });
    }
    
    return success;
  };

  const testMicrophone = (setupAudioMonitoring: () => Promise<boolean>) => {
    // Clear any previous error
    setErrorMessage('');

    // If in no-microphone mode, show appropriate message
    if (noMicrophoneMode) {
      toast({
        title: "Mode sans microphone activé",
        description: "Le test du microphone n'est pas disponible en mode sans microphone. Utilisez le clavier pour saisir vos messages.",
        variant: "default",
      });
      return;
    }

    toast({
      title: "Test du microphone",
      description: "Veuillez parler après avoir cliqué sur OK. Cela vérifiera si votre microphone fonctionne.",
    });

    // Start audio monitoring
    setupAudioMonitoring();

    // Short listening test
    const success = speechService.startListening(
      (interimText) => {
        if (interimText && interimText.length > 0) {
          // We got some speech! Microphone is working
          speechService.stopListening();
          toast({
            title: "Test du microphone réussi",
            description: "Votre microphone fonctionne ! Voix détectée.",
          });
        }
      },
      (finalText) => {
        // Successfully got final text
        speechService.stopListening();
        toast({
          title: "Test du microphone réussi",
          description: "Votre microphone fonctionne correctement.",
        });
      },
      (error) => {
        console.error('Test du microphone échoué:', error);
        
        // Different handling for no-speech error
        if (error.includes('no-speech')) {
          toast({
            title: "Aucune voix détectée",
            description: "Veuillez parler plus fort ou vérifier que votre microphone est activé.",
            variant: "default",
          });
        } else {
          setErrorMessage(`Test du microphone échoué: ${error}`);
          toast({
            title: "Test du microphone échoué",
            description: error,
            variant: "destructive",
          });
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
    } else {
      const micError = "Impossible d'accéder au microphone. Veuillez vérifier les permissions de votre navigateur.";
      setErrorMessage(`Erreur de microphone: ${micError}`);
      toast({
        title: "Test du microphone échoué",
        description: micError,
        variant: "destructive",
      });
    }
  };

  // Add method to toggle no-microphone mode
  const toggleNoMicrophoneMode = (enable?: boolean) => {
    const newMode = enable !== undefined ? enable : !noMicrophoneMode;
    setNoMicrophoneMode(newMode);
    
    if (typeof speechService.enableNoMicrophoneMode === 'function') {
      speechService.enableNoMicrophoneMode(newMode);
    }
    
    if (newMode) {
      toast({
        title: "Mode sans microphone activé",
        description: "Vous pouvez utiliser le clavier pour saisir vos messages.",
        variant: "default",
      });
    } else {
      toast({
        title: "Mode sans microphone désactivé",
        description: "La reconnaissance vocale est maintenant active.",
        variant: "default",
      });
    }
  };

  return {
    isListening,
    transcript,
    setTranscript,
    speechRecognitionAvailable,
    errorMessage,
    setErrorMessage,
    startListening,
    stopListening,
    testMicrophone,
    checkSpeechRecognition,
    noMicrophoneMode,
    toggleNoMicrophoneMode,
    consecutiveErrors
  };
};

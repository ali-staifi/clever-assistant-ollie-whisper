
import { useState, useEffect } from 'react';
import { SpeechService } from '@/services/SpeechService';
import { useSpeechCore } from './useSpeechCore';
import { useSpeechErrors } from './useSpeechErrors';
import { useMicrophoneTesting } from './useMicrophoneTesting';

export const useSpeechRecognition = (speechService: SpeechService, micSensitivity: number) => {
  const {
    isListening,
    setIsListening,
    transcript,
    setTranscript,
    speechRecognitionAvailable,
    checkSpeechRecognition,
    stopListening,
    noMicrophoneMode,
    toggleNoMicrophoneMode
  } = useSpeechCore(speechService, micSensitivity);
  
  const {
    errorMessage,
    setErrorMessage,
    consecutiveErrors,
    handleError,
    resetErrors,
    showToast
  } = useSpeechErrors();
  
  const { testMicrophone: testMic } = useMicrophoneTesting(
    speechService, 
    isListening, 
    noMicrophoneMode
  );
  
  // Track abort errors
  const [abortCount, setAbortCount] = useState(0);

  // Run check on mount
  useEffect(() => {
    checkSpeechRecognition();
  }, []);

  // Reset consecutive errors when the sensitivity is changed
  useEffect(() => {
    if (typeof speechService.setSensitivity === 'function') {
      speechService.setSensitivity(micSensitivity);
      resetErrors();
    }
  }, [micSensitivity, speechService]);

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
        resetErrors(); // Reset errors on success
        setAbortCount(0); // Reset abort count on successful result
        onFinalResult(finalText);
      },
      (error) => {
        // Handle aborted error specially
        if (error.includes("aborted") || error.includes("interrompue")) {
          setAbortCount(prev => {
            const newCount = prev + 1;
            
            // Only show error after multiple aborts
            if (newCount > 2) {
              handleError("La reconnaissance vocale est instable. Essayez de rafraîchir la page ou d'utiliser un autre navigateur.", false);
              setIsListening(false);
            } else {
              // For first few aborts, try to restart without showing error
              console.log(`Reconnaissance interrompue (${newCount}/3), tentative de reprise...`);
            }
            
            return newCount;
          });
          return;
        }
        
        // Determine if this is a no-speech error
        const isNoSpeechError = error.includes("no-speech");
        
        if (!isNoSpeechError) {
          setIsListening(false);
        }
        
        handleError(error, isNoSpeechError);
      }
    );
    
    if (success) {
      setIsListening(true);
      
      if (!noMicrophoneMode) {
        // Notification to encourage the user to speak louder
        showToast(
          "Écoute en cours...",
          "Parlez clairement et un peu plus fort qu'une conversation normale."
        );
      } else {
        showToast(
          "Mode sans microphone activé",
          "Utilisez le clavier pour saisir vos messages."
        );
      }
    } else {
      const micError = "Impossible d'accéder au microphone. Veuillez vérifier les permissions de votre navigateur.";
      setErrorMessage(`Erreur de microphone: ${micError}`);
      showToast(
        "Erreur de microphone",
        micError,
        "destructive"
      );
    }
    
    return success;
  };
  
  const testMicrophone = (setupAudioMonitoring: () => Promise<boolean>) => {
    testMic(setupAudioMonitoring);
  };
  
  // Wrap the toggleNoMicrophoneMode with toast notifications
  const toggleNoMicrophoneModeWithToast = (enable?: boolean) => {
    const newMode = toggleNoMicrophoneMode(enable);
    
    if (newMode) {
      showToast(
        "Mode sans microphone activé",
        "Vous pouvez utiliser le clavier pour saisir vos messages."
      );
    } else {
      showToast(
        "Mode sans microphone désactivé",
        "La reconnaissance vocale est maintenant active."
      );
    }
    
    return newMode;
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
    toggleNoMicrophoneMode: toggleNoMicrophoneModeWithToast,
    consecutiveErrors
  };
};

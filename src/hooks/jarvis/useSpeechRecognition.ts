
import { useState } from 'react';
import { SpeechService } from '@/services/SpeechService';
import { useToast } from '@/hooks/use-toast';

export const useSpeechRecognition = (speechService: SpeechService, micSensitivity: number) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  
  // Check if speech recognition is available
  const checkSpeechRecognition = () => {
    setSpeechRecognitionAvailable(speechService.isRecognitionSupported());
    if (!speechService.isRecognitionSupported()) {
      setErrorMessage('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
    }
    
    // Apply saved sensitivity to speech service
    if (speechService.setSensitivity && typeof speechService.setSensitivity === 'function') {
      speechService.setSensitivity(micSensitivity);
    }
  };

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
    
    // Start audio monitoring
    setupAudioMonitoring();
    
    const success = speechService.startListening(
      onInterimResult,
      (finalText) => {
        setIsListening(false);
        onFinalResult(finalText);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        setErrorMessage(`Microphone error: ${error}`);
        toast({
          title: "Speech Recognition Error",
          description: error,
          variant: "destructive",
        });
      }
    );
    
    if (success) {
      setIsListening(true);
      
      // Notification to encourage the user to speak louder
      toast({
        title: "Listening...",
        description: "Speak clearly and a bit louder than normal conversation.",
        variant: "default",
      });
    } else {
      const micError = "Could not access the microphone. Please check your browser permissions.";
      setErrorMessage(`Microphone error: ${micError}`);
      toast({
        title: "Microphone Error",
        description: micError,
        variant: "destructive",
      });
    }
    
    return success;
  };

  const testMicrophone = (setupAudioMonitoring: () => Promise<boolean>) => {
    // Clear any previous error
    setErrorMessage('');

    toast({
      title: "Testing Microphone",
      description: "Please speak after clicking OK. This will check if your microphone is working.",
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
            title: "Microphone Test Successful",
            description: "Your microphone is working! Voice detected.",
          });
        }
      },
      (finalText) => {
        // Successfully got final text
        speechService.stopListening();
        toast({
          title: "Microphone Test Successful",
          description: "Your microphone is working properly.",
        });
      },
      (error) => {
        console.error('Microphone test error:', error);
        setErrorMessage(`Microphone test failed: ${error}`);
        toast({
          title: "Microphone Test Failed",
          description: error,
          variant: "destructive",
        });
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
      const micError = "Could not access the microphone. Please check your browser permissions.";
      setErrorMessage(`Microphone error: ${micError}`);
      toast({
        title: "Microphone Test Failed",
        description: micError,
        variant: "destructive",
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
    checkSpeechRecognition
  };
};


import { useState } from 'react';
import { SpeechService } from '@/services/SpeechService';

export const useSpeechCore = (speechService: SpeechService, micSensitivity: number) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(true);
  const [noMicrophoneMode, setNoMicrophoneMode] = useState(false);
  
  // Check if speech recognition is available
  const checkSpeechRecognition = () => {
    const isSupported = speechService.isRecognitionSupported();
    setSpeechRecognitionAvailable(isSupported);
    
    if (!isSupported) {
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

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  // Add method to toggle no-microphone mode
  const toggleNoMicrophoneMode = (enable?: boolean) => {
    const newMode = enable !== undefined ? enable : !noMicrophoneMode;
    setNoMicrophoneMode(newMode);
    
    if (typeof speechService.enableNoMicrophoneMode === 'function') {
      speechService.enableNoMicrophoneMode(newMode);
    }
    
    return newMode;
  };

  return {
    isListening,
    setIsListening,
    transcript,
    setTranscript,
    speechRecognitionAvailable,
    checkSpeechRecognition,
    stopListening,
    noMicrophoneMode,
    toggleNoMicrophoneMode,
  };
};

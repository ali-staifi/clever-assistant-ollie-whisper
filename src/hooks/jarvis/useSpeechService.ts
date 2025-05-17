
import { useRef, useEffect } from 'react';
import { SpeechService } from '@/services/SpeechService';
import { useAudioMonitoring } from './useAudioMonitoring';
import { useMicSensitivity } from './useMicSensitivity';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export const useSpeechService = () => {
  const speechService = useRef(new SpeechService()).current;
  
  // Get microphone sensitivity settings
  const { micSensitivity, setMicSensitivity } = useMicSensitivity();
  
  // Setup audio monitoring
  const { micVolume, setupAudioMonitoring } = useAudioMonitoring(false, micSensitivity);
  
  // Setup speech recognition
  const {
    isListening,
    transcript,
    setTranscript,
    speechRecognitionAvailable,
    errorMessage,
    setErrorMessage,
    startListening: startSpeechRecognition,
    stopListening,
    testMicrophone: testSpeechRecognition,
    checkSpeechRecognition,
    noMicrophoneMode,
    toggleNoMicrophoneMode
  } = useSpeechRecognition(speechService, micSensitivity);
  
  // Setup speech synthesis
  const { isSpeaking, speak, toggleSpeaking } = useSpeechSynthesis(speechService);
  
  // Check if speech recognition is available on mount and apply sensitivity
  useEffect(() => {
    checkSpeechRecognition();
  }, []);
  
  // Apply sensitivity changes to speech service
  useEffect(() => {
    if (typeof speechService.setSensitivity === 'function') {
      speechService.setSensitivity(micSensitivity);
    }
  }, [micSensitivity, speechService]);
  
  // Wrapper for startListening that includes audio monitoring setup
  const startListening = (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): boolean => {
    return startSpeechRecognition(onInterimResult, onFinalResult, setupAudioMonitoring);
  };
  
  // Wrapper for testMicrophone that includes audio monitoring setup
  const testMicrophone = () => {
    testSpeechRecognition(setupAudioMonitoring);
  };

  // Configure MaryTTS
  const configureMaryTTS = (useIt: boolean, serverUrl?: string, voice?: string) => {
    if (typeof speechService.configureMaryTTS === 'function') {
      speechService.configureMaryTTS(useIt, serverUrl, voice);
    }
  };

  return {
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
    configureMaryTTS
  };
};

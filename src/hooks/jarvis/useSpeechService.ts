
import { useRef, useState, useEffect } from 'react';
import { SpeechService } from '@/services/SpeechService';
import { useToast } from '@/hooks/use-toast';

export const useSpeechService = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [micSensitivity, setMicSensitivity] = useState(() => {
    // Try to get saved sensitivity from localStorage or use default
    const savedSensitivity = localStorage.getItem('jarvis-mic-sensitivity');
    return savedSensitivity ? parseFloat(savedSensitivity) : 1.5; // Increased default sensitivity
  });
  
  const speechService = useRef(new SpeechService()).current;
  const { toast } = useToast();
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Check if speech recognition is available on mount
  useEffect(() => {
    setSpeechRecognitionAvailable(speechService.isRecognitionSupported());
    if (!speechService.isRecognitionSupported()) {
      setErrorMessage('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
    }
    
    // Apply saved sensitivity to speech service
    if (speechService.setSensitivity && typeof speechService.setSensitivity === 'function') {
      speechService.setSensitivity(micSensitivity);
    }
  }, []);

  // Save sensitivity changes to localStorage
  useEffect(() => {
    localStorage.setItem('jarvis-mic-sensitivity', micSensitivity.toString());
    
    // Apply sensitivity changes to speech service
    if (speechService.setSensitivity && typeof speechService.setSensitivity === 'function') {
      speechService.setSensitivity(micSensitivity);
    }
  }, [micSensitivity]);

  // Clean up audio resources on unmount
  useEffect(() => {
    return () => {
      if (microphone.current) {
        microphone.current.disconnect();
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Setup audio visualization and volume monitoring
  const setupAudioMonitoring = async () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true // Enable auto gain to help with quiet microphones
        } 
      });
      
      // Create analyzer
      if (!analyser.current) {
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 256;
        analyser.current.smoothingTimeConstant = 0.8; // Add smoothing for more stable visualization
      }
      
      // Connect microphone to analyzer
      if (!microphone.current) {
        microphone.current = audioContext.current.createMediaStreamSource(stream);
        microphone.current.connect(analyser.current);
      }
      
      // Start monitoring volume
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkVolume = () => {
        if (!analyser.current) return;
        
        analyser.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        
        // Calculate average volume (0-100) with sensitivity applied
        const avgVolume = (sum / bufferLength) * micSensitivity;
        setMicVolume(Math.min(100, avgVolume));
        
        if (isListening) {
          requestAnimationFrame(checkVolume);
        } else {
          setMicVolume(0);
        }
      };
      
      checkVolume();
      return true;
    } catch (error) {
      console.error('Failed to access microphone for volume monitoring:', error);
      return false;
    }
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
    setMicVolume(0);
  };

  const startListening = (
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void
  ): boolean => {
    // Clear any previous error
    setErrorMessage('');
    
    // Start audio monitoring
    setupAudioMonitoring();
    
    const success = speechService.startListening(
      onInterimResult,
      (finalText) => {
        setIsListening(false);
        setMicVolume(0);
        onFinalResult(finalText);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        setMicVolume(0);
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
  
  const speak = (text: string) => {
    setIsSpeaking(true);
    speechService.speak(text, () => {
      setIsSpeaking(false);
    });
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const testMicrophone = () => {
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
  };
};


import { useRef, useState, useEffect } from 'react';

export const useAudioMonitoring = (isListening: boolean, sensitivity: number) => {
  const [micVolume, setMicVolume] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);

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
  const setupAudioMonitoring = async (): Promise<boolean> => {
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
        const avgVolume = (sum / bufferLength) * sensitivity;
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

  return {
    micVolume,
    setupAudioMonitoring
  };
};

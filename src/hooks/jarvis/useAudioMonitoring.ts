
import { useRef, useState, useEffect } from 'react';

export const useAudioMonitoring = (isListening: boolean, sensitivity: number) => {
  const [micVolume, setMicVolume] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);

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
        audioContext.current = new AudioContext({
          latencyHint: 'interactive',
          sampleRate: 48000  // Higher sample rate for better audio quality
        });
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true, // Enable auto gain to help with quiet microphones
          channelCount: 1  // Mono channel for voice
        } 
      });
      
      // Create analyzer
      if (!analyser.current) {
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 1024;  // More detailed frequency analysis
        analyser.current.smoothingTimeConstant = 0.5; // Add smoothing for more stable visualization
      }
      
      // Create gain node for boosting signal
      if (!gainNode.current) {
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = 2.5; // Boost the signal significantly
      }
      
      // Connect microphone through gain to analyzer
      if (!microphone.current) {
        microphone.current = audioContext.current.createMediaStreamSource(stream);
        microphone.current.connect(gainNode.current);
        gainNode.current.connect(analyser.current);
      }
      
      // Start monitoring volume
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkVolume = () => {
        if (!analyser.current) return;
        
        analyser.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume with emphasis on speech frequencies
        // Human speech is typically between 300-3000 Hz
        let sum = 0;
        let count = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const frequency = i * (audioContext.current?.sampleRate || 44100) / analyser.current.fftSize;
          // Emphasize the speech frequency range
          if (frequency >= 200 && frequency <= 4000) {
            sum += dataArray[i] * 2.5;  // Give more weight to speech frequencies
            count++;
          } else {
            sum += dataArray[i];
            count++;
          }
        }
        
        const avgVolume = count > 0 ? (sum / count) * sensitivity : 0;
        
        // Apply a non-linear curve to make small sounds more visible
        // Reduce the exponent to amplify weak sounds even more
        const normalizedVolume = Math.min(100, Math.pow(avgVolume / 128, 0.4) * 100);
        
        setMicVolume(normalizedVolume);
        
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

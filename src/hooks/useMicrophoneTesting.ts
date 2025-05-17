
import { useState, useEffect } from 'react';

export const useMicrophoneTesting = () => {
  const [testingMic, setTestingMic] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  
  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioContext, micStream]);

  const startMicTest = async () => {
    try {
      setTestingMic(true);
      
      // Request microphone access with optimal settings for voice
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,  // Enable auto gain to boost quiet voices
          channelCount: 1  // Mono channel for voice
        } 
      });
      
      setMicStream(stream);
      
      // Create audio context
      const context = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 48000  // Higher sample rate for better audio quality
      });
      setAudioContext(context);
      
      // Create analyzer with more detailed FFT
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;  // More detailed frequency analysis
      analyser.smoothingTimeConstant = 0.5;  // Smoother visualization
      
      // Connect microphone to analyzer
      const source = context.createMediaStreamSource(stream);
      
      // Add a gain node to boost the signal even more
      const gainNode = context.createGain();
      gainNode.gain.value = 3.0;  // Boost the signal significantly more
      
      source.connect(gainNode);
      gainNode.connect(analyser);
      
      // Function to update volume level
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!testingMic) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume with emphasis on speech frequencies
        // Human speech is typically between 300-3000 Hz
        let sum = 0;
        let count = 0;
        
        // More weight to frequencies in the speech range
        for (let i = 0; i < dataArray.length; i++) {
          const frequency = i * (context.sampleRate / analyser.fftSize);
          // Emphasize the speech frequency range
          if (frequency >= 200 && frequency <= 4000) {
            sum += dataArray[i] * 2.5;  // Give more weight to speech frequencies
            count++;
          } else {
            sum += dataArray[i];
            count++;
          }
        }
        
        const avg = sum / count;
        // Apply a non-linear curve to make small sounds more visible
        // Reduce the exponent to amplify weak sounds even more
        const normalizedVolume = Math.min(1, Math.pow(avg / 128, 0.4)); 
        
        setVolumeLevel(normalizedVolume * 100);
        
        if (testingMic) {
          requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
      return true;
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setTestingMic(false);
      return false;
    }
  };
  
  const stopMicTest = () => {
    setTestingMic(false);
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
    }
  };

  return {
    testingMic,
    volumeLevel,
    startMicTest,
    stopMicTest
  };
};

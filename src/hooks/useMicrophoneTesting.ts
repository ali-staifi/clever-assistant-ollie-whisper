
import { useState, useEffect } from 'react';

export const useMicrophoneTesting = () => {
  const [testingMic, setTestingMic] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  const startMicTest = async () => {
    try {
      setTestingMic(true);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      
      // Create audio context
      const context = new AudioContext();
      setAudioContext(context);
      
      // Create analyzer
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      
      // Connect microphone to analyzer
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Function to update volume level
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!testingMic) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalizedVolume = Math.min(1, avg / 128);
        
        setVolumeLevel(normalizedVolume);
        
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
  };

  return {
    testingMic,
    volumeLevel,
    startMicTest,
    stopMicTest
  };
};


import { useState, useEffect } from 'react';

export const useMicSensitivity = () => {
  const [micSensitivity, setMicSensitivity] = useState(() => {
    // Try to get saved sensitivity from localStorage or use default
    const savedSensitivity = localStorage.getItem('jarvis-mic-sensitivity');
    return savedSensitivity ? parseFloat(savedSensitivity) : 1.5; // Increased default sensitivity
  });
  
  // Save sensitivity changes to localStorage
  useEffect(() => {
    localStorage.setItem('jarvis-mic-sensitivity', micSensitivity.toString());
  }, [micSensitivity]);

  return {
    micSensitivity,
    setMicSensitivity
  };
};

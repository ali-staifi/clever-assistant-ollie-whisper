import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import OllamaSettings from "@/components/settings/OllamaSettings";
import MicrophoneSettings from "@/components/settings/MicrophoneSettings";

interface SettingsPanelProps {
  ollamaUrl: string;
  ollamaModel: string;
  onOllamaUrlChange: (url: string) => void;
  onOllamaModelChange: (model: string) => void;
  onClearConversation: () => void;
  onClose: () => void;
  checkConnection: () => void;
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
  availableModels?: string[];
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  ollamaUrl,
  ollamaModel,
  onOllamaUrlChange,
  onOllamaModelChange,
  onClearConversation,
  onClose,
  checkConnection,
  ollamaStatus,
  availableModels = []
}) => {
  const [micSensitivity, setMicSensitivity] = useState(() => {
    // Try to get saved sensitivity from localStorage or use default
    const savedSensitivity = localStorage.getItem('jarvis-mic-sensitivity');
    return savedSensitivity ? parseFloat(savedSensitivity) : 1.5; // Increased default sensitivity
  });
  
  const [testingMic, setTestingMic] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialize microphone testing
  const testMicrophone = async () => {
    if (testingMic) {
      // Stop testing
      setTestingMic(false);
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
      return;
    }
    
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
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setTestingMic(false);
    }
  };
  
  // Set speech recognition sensitivity
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      // Store sensitivity in localStorage for the speech service to use
      localStorage.setItem('jarvis-mic-sensitivity', micSensitivity.toString());
    }
  }, [micSensitivity]);
  
  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  return (
    <div className="bg-card rounded-lg p-4 mb-4 shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 text-jarvis-blue">Settings</h2>
      
      <div className="grid gap-4">
        {/* Ollama Settings Section */}
        <OllamaSettings
          ollamaUrl={ollamaUrl}
          ollamaModel={ollamaModel}
          onOllamaUrlChange={onOllamaUrlChange}
          onOllamaModelChange={onOllamaModelChange}
          checkConnection={checkConnection}
          ollamaStatus={ollamaStatus}
          availableModels={availableModels}
        />
        
        {/* Microphone Settings Section */}
        <MicrophoneSettings
          micSensitivity={micSensitivity}
          onMicSensitivityChange={setMicSensitivity}
          testMicrophone={testMicrophone}
          testingMic={testingMic}
          volumeLevel={volumeLevel}
        />
        
        {/* Footer Actions */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onClearConversation}>
            Clear Conversation
          </Button>
          <Button onClick={onClose}>Close Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

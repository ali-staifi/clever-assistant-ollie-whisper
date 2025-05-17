
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface MicrophoneSettingsProps {
  micSensitivity: number;
  onMicSensitivityChange: (value: number) => void;
  testMicrophone: () => void;
}

const MicrophoneSettings: React.FC<MicrophoneSettingsProps> = ({
  micSensitivity,
  onMicSensitivityChange,
  testMicrophone
}) => {
  const [testingMic, setTestingMic] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialize microphone testing
  const handleTestMicrophone = async () => {
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
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mic-sensitivity">Microphone Sensitivity</Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(micSensitivity * 100)}%
          </span>
        </div>
        <Slider
          id="mic-sensitivity"
          min={0.1}
          max={3.0}
          step={0.1}
          value={[micSensitivity]}
          onValueChange={(value) => onMicSensitivityChange(value[0])}
        />
        <p className="text-xs text-muted-foreground">
          Increase if J.A.R.V.I.S has trouble hearing you
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Test Microphone</Label>
          <Button 
            variant={testingMic ? "destructive" : "outline"} 
            onClick={handleTestMicrophone}
            size="sm"
          >
            {testingMic ? "Stop Testing" : "Start Test"}
          </Button>
        </div>
        
        {testingMic && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <div className="bg-muted h-2 flex-1 rounded-full overflow-hidden">
                <div 
                  className="bg-jarvis-blue h-full transition-all duration-100"
                  style={{ width: `${volumeLevel * 100}%` }}
                ></div>
              </div>
              <Volume2 className="h-4 w-4 text-jarvis-blue" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {volumeLevel < 0.2 ? "Speech too quiet - try speaking louder" : 
               volumeLevel > 0.7 ? "Good volume detected" : "Try speaking a bit louder"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default MicrophoneSettings;

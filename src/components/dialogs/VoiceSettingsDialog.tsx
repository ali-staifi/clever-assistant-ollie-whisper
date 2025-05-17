
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMicrophoneTesting } from "@/hooks/useMicrophoneTesting";
import { useMicSensitivity } from "@/hooks/jarvis/useMicSensitivity";

interface VoiceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VoiceSettingsDialog: React.FC<VoiceSettingsDialogProps> = ({
  open,
  onOpenChange
}) => {
  // Get microphone sensitivity settings
  const { micSensitivity, setMicSensitivity } = useMicSensitivity();
  
  // Get microphone testing functionality
  const { testingMic, volumeLevel, startMicTest, stopMicTest } = useMicrophoneTesting();

  // Handle microphone test button click
  const handleTestMicrophone = async () => {
    if (testingMic) {
      stopMicTest();
    } else {
      await startMicTest();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Use the refactored MicrophoneSettings component */}
          <MicrophoneSettingsContent 
            micSensitivity={micSensitivity}
            onMicSensitivityChange={setMicSensitivity}
            testMicrophone={handleTestMicrophone}
            testingMic={testingMic}
            volumeLevel={volumeLevel}
          />
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Extract MicrophoneSettings content without the test button logic
// This separates the UI from the container component
const MicrophoneSettingsContent = ({
  micSensitivity,
  onMicSensitivityChange,
  testMicrophone,
  testingMic,
  volumeLevel
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="mic-sensitivity" className="text-sm font-medium">
            Microphone Sensitivity
          </label>
          <span className="text-xs text-muted-foreground">
            {Math.round(micSensitivity * 100)}%
          </span>
        </div>
        <div className="pt-1">
          <input
            id="mic-sensitivity"
            type="range"
            min={0.1}
            max={3.0}
            step={0.1}
            value={micSensitivity}
            onChange={(e) => onMicSensitivityChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Increase if voice recognition has trouble hearing you
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Test Microphone</label>
          <Button 
            variant={testingMic ? "destructive" : "outline"} 
            onClick={testMicrophone}
            size="sm"
          >
            {testingMic ? "Stop Testing" : "Start Test"}
          </Button>
        </div>
        
        {testingMic && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-muted h-2 flex-1 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-100"
                  style={{ width: `${volumeLevel * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {volumeLevel < 0.2 ? "Speech too quiet - try speaking louder" : 
               volumeLevel > 0.7 ? "Good volume detected" : "Try speaking a bit louder"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSettingsDialog;

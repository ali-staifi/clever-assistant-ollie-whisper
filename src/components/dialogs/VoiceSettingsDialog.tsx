
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MicrophoneSettings from "@/components/settings/MicrophoneSettings";
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
        
        <div className="py-4 space-y-6">
          <MicrophoneSettings 
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

export default VoiceSettingsDialog;

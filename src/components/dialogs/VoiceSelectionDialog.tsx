
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from '@/hooks/jarvis/useSpeechSynthesis';
import { SpeechService } from '@/services/SpeechService';
import VoiceFilters from '@/components/voice/VoiceFilters';
import VoiceSettings from '@/components/voice/VoiceSettings';
import TestVoiceButton from '@/components/voice/TestVoiceButton';

interface VoiceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speechService?: SpeechService;
}

const VoiceSelectionDialog: React.FC<VoiceSelectionDialogProps> = ({
  open,
  onOpenChange,
  speechService
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [roboticEffect, setRoboticEffect] = useState<number>(0);
  
  // Create a default speechService if one isn't provided
  const localSpeechService = React.useMemo(() => speechService || new SpeechService(), [speechService]);
  
  // Use the local speechService instance for the hook
  const { speak, isSpeaking, toggleSpeaking } = useSpeechSynthesis(localSpeechService);

  useEffect(() => {
    if (open) {
      // Get available voices when dialog opens, with a safety check
      const voices = localSpeechService ? localSpeechService.getAvailableVoices() : [];
      setAvailableVoices(voices);
      
      // Get current settings
      try {
        const currentSettings = localStorage.getItem('jarvis-voice-settings');
        if (currentSettings) {
          const settings = JSON.parse(currentSettings);
          if (settings.voiceName) setSelectedVoice(settings.voiceName);
          if (settings.rate) setRate(settings.rate);
          if (settings.pitch) setPitch(settings.pitch);
          if (settings.volume) setVolume(settings.volume);
          if (settings.roboticEffect !== undefined) setRoboticEffect(settings.roboticEffect);
        }
      } catch (e) {
        console.error('Error loading voice settings:', e);
      }
    }
  }, [open, localSpeechService]);

  const handleApply = () => {
    if (!localSpeechService) {
      console.error("Speech service is not available");
      return;
    }
    
    if (selectedVoice) {
      localSpeechService.setVoice(selectedVoice);
    }
    
    // Apply other settings
    localSpeechService.setRate(rate);
    localSpeechService.setPitch(pitch);
    localSpeechService.setVolume(volume);
    localSpeechService.setRoboticEffect(roboticEffect);
    
    // Save settings to localStorage
    const settings = {
      voiceName: selectedVoice,
      rate,
      pitch,
      volume,
      roboticEffect
    };
    localStorage.setItem('jarvis-voice-settings', JSON.stringify(settings));
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélection de la voix</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <VoiceFilters
            availableVoices={availableVoices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
          />
          
          <VoiceSettings
            roboticEffect={roboticEffect}
            setRoboticEffect={setRoboticEffect}
            rate={rate}
            setRate={setRate}
            pitch={pitch}
            setPitch={setPitch}
            volume={volume}
            setVolume={setVolume}
          />
          
          <TestVoiceButton
            localSpeechService={localSpeechService}
            isSpeaking={isSpeaking}
            toggleSpeaking={toggleSpeaking}
            selectedVoice={selectedVoice}
            rate={rate}
            pitch={pitch}
            volume={volume}
            roboticEffect={roboticEffect}
            speak={speak}
          />
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="sm:flex-1"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleApply}
            className="sm:flex-1"
          >
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSelectionDialog;

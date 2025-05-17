
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Volume2, Music } from "lucide-react";
import { useSpeechSynthesis } from '@/hooks/jarvis/useSpeechSynthesis';

interface VoiceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speechService: any;
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
  const { speak, isSpeaking, toggleSpeaking } = useSpeechSynthesis(speechService);

  useEffect(() => {
    if (open) {
      // Get available voices when dialog opens
      const voices = speechService.getAvailableVoices();
      setAvailableVoices(voices);
    }
  }, [open, speechService]);

  // Filter voices by language
  const frenchVoices = availableVoices.filter(voice => voice.lang.startsWith('fr'));
  const otherVoices = availableVoices.filter(voice => !voice.lang.startsWith('fr'));

  const handleApply = () => {
    if (selectedVoice) {
      speechService.setVoice(selectedVoice);
    }
    
    speechService.setRate(rate);
    speechService.setPitch(pitch);
    speechService.setVolume(volume);
    
    onOpenChange(false);
  };

  const handleTestVoice = () => {
    if (isSpeaking) {
      toggleSpeaking();
    } else {
      const testText = "Bonjour, ceci est un test de la voix sélectionnée. Comment trouvez-vous cette voix ?";
      
      // Apply settings temporarily for test
      if (selectedVoice) {
        speechService.setVoice(selectedVoice);
      }
      speechService.setRate(rate);
      speechService.setPitch(pitch);
      speechService.setVolume(volume);
      
      // Speak test text
      speak(testText);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélection de la voix</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <Label>Voix disponibles</Label>
            <RadioGroup 
              value={selectedVoice} 
              onValueChange={setSelectedVoice}
              className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2"
            >
              {frenchVoices.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-bold">Voix françaises</Label>
                  {frenchVoices.map((voice) => (
                    <div key={voice.name} className="flex items-center space-x-2 pl-2">
                      <RadioGroupItem value={voice.name} id={voice.name} />
                      <Label htmlFor={voice.name} className="cursor-pointer w-full">
                        {voice.name} {voice.default && "(Par défaut)"}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              
              {otherVoices.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label className="font-bold">Autres voix</Label>
                  {otherVoices.map((voice) => (
                    <div key={voice.name} className="flex items-center space-x-2 pl-2">
                      <RadioGroupItem value={voice.name} id={voice.name} />
                      <Label htmlFor={voice.name} className="cursor-pointer w-full">
                        {voice.name} ({voice.lang})
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </RadioGroup>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="rate">Vitesse: {rate.toFixed(1)}</Label>
              </div>
              <Slider
                id="rate"
                min={0.5}
                max={2}
                step={0.1}
                value={[rate]}
                onValueChange={(values) => setRate(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="pitch">Hauteur: {pitch.toFixed(1)}</Label>
              </div>
              <Slider
                id="pitch"
                min={0.5}
                max={2}
                step={0.1}
                value={[pitch]}
                onValueChange={(values) => setPitch(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="volume">Volume: {(volume * 100).toFixed(0)}%</Label>
                <Volume2 className="h-4 w-4" />
              </div>
              <Slider
                id="volume"
                min={0}
                max={1}
                step={0.1}
                value={[volume]}
                onValueChange={(values) => setVolume(values[0])}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleTestVoice} 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            <Music className="h-4 w-4" />
            {isSpeaking ? "Arrêter le test" : "Tester la voix"}
          </Button>
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

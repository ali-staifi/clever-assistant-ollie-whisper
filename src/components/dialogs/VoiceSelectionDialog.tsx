
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
import { Volume2, Music, CircleUser, CircleUserRound } from "lucide-react";
import { useSpeechSynthesis } from '@/hooks/jarvis/useSpeechSynthesis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [roboticEffect, setRoboticEffect] = useState<number>(0);
  const { speak, isSpeaking, toggleSpeaking } = useSpeechSynthesis(speechService);

  useEffect(() => {
    if (open) {
      // Get available voices when dialog opens
      const voices = speechService.getAvailableVoices();
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
  }, [open, speechService]);

  // Filter voices by gender and language
  const maleVoices = availableVoices.filter(voice => {
    // Heuristic to identify male voices (This is not perfect but a common pattern)
    const maleName = voice.name.toLowerCase().includes('male') || 
                     voice.name.includes('David') || 
                     voice.name.includes('Thomas') || 
                     voice.name.includes('Daniel') || 
                     voice.name.includes('George') || 
                     voice.name.includes('Eric') || 
                     voice.name.includes('Roger') ||
                     voice.name.includes('Paul');
                     
    return maleName;
  });
  
  const femaleVoices = availableVoices.filter(voice => {
    // Heuristic to identify female voices
    const femaleName = voice.name.toLowerCase().includes('female') || 
                       voice.name.includes('Lisa') || 
                       voice.name.includes('Sarah') || 
                       voice.name.includes('Alice') || 
                       voice.name.includes('Victoria') || 
                       voice.name.includes('Samantha') ||
                       voice.name.includes('Amélie') ||
                       voice.name.includes('Marie');
                       
    return femaleName;
  });
  
  const otherVoices = availableVoices.filter(voice => 
    !maleVoices.includes(voice) && !femaleVoices.includes(voice)
  );

  const handleApply = () => {
    if (selectedVoice) {
      speechService.setVoice(selectedVoice);
    }
    
    // Apply roboticEffect if supported
    speechService.setRate(rate);
    speechService.setPitch(pitch);
    speechService.setVolume(volume);
    
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

  const handleTestVoice = () => {
    if (isSpeaking) {
      toggleSpeaking();
    } else {
      let testText = "Bonjour, je suis votre assistant vocal. Comment puis-je vous aider aujourd'hui?";
      
      // Apply settings temporarily for test
      if (selectedVoice) {
        speechService.setVoice(selectedVoice);
      }
      speechService.setRate(rate);
      speechService.setPitch(pitch);
      speechService.setVolume(volume);
      
      // Add robotic effect if slider is not at zero
      if (roboticEffect > 0) {
        // Adjust pitch and rate to simulate robotic voice
        const roboticPitch = Math.max(0.5, pitch - (roboticEffect * 0.3));
        const roboticRate = rate + (roboticEffect * 0.5);
        speechService.setPitch(roboticPitch);
        speechService.setRate(roboticRate);
        
        // Change text for more robotic feel at high settings
        if (roboticEffect > 0.7) {
          testText = "Sys-tème ac-ti-vé. As-sis-tant Jar-vis prêt à fonc-ti-on-ner.";
        }
      }
      
      // Speak test text
      speak(testText);
      
      // Reset to original settings after test
      if (roboticEffect > 0) {
        setTimeout(() => {
          speechService.setPitch(pitch);
          speechService.setRate(rate);
        }, 100);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélection de la voix</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <Tabs defaultValue="male" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="male" className="flex items-center gap-1">
                <CircleUser className="h-4 w-4" />
                <span>Hommes</span>
              </TabsTrigger>
              <TabsTrigger value="female" className="flex items-center gap-1">
                <CircleUserRound className="h-4 w-4" />
                <span>Femmes</span>
              </TabsTrigger>
              <TabsTrigger value="other">Autres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="male" className="mt-4">
              <div className="space-y-2">
                <RadioGroup 
                  value={selectedVoice} 
                  onValueChange={setSelectedVoice}
                  className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2"
                >
                  {maleVoices.length > 0 ? maleVoices.map((voice) => (
                    <div key={voice.name} className="flex items-center space-x-2 pl-2">
                      <RadioGroupItem value={voice.name} id={voice.name} />
                      <Label htmlFor={voice.name} className="cursor-pointer w-full">
                        {voice.name} {voice.default && "(Par défaut)"} <span className="text-xs text-muted-foreground">({voice.lang})</span>
                      </Label>
                    </div>
                  )) : (
                    <div className="text-center p-2 text-muted-foreground">
                      Aucune voix masculine détectée
                    </div>
                  )}
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="female" className="mt-4">
              <div className="space-y-2">
                <RadioGroup 
                  value={selectedVoice} 
                  onValueChange={setSelectedVoice}
                  className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2"
                >
                  {femaleVoices.length > 0 ? femaleVoices.map((voice) => (
                    <div key={voice.name} className="flex items-center space-x-2 pl-2">
                      <RadioGroupItem value={voice.name} id={voice.name} />
                      <Label htmlFor={voice.name} className="cursor-pointer w-full">
                        {voice.name} {voice.default && "(Par défaut)"} <span className="text-xs text-muted-foreground">({voice.lang})</span>
                      </Label>
                    </div>
                  )) : (
                    <div className="text-center p-2 text-muted-foreground">
                      Aucune voix féminine détectée
                    </div>
                  )}
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="other" className="mt-4">
              <div className="space-y-2">
                <RadioGroup 
                  value={selectedVoice} 
                  onValueChange={setSelectedVoice}
                  className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2"
                >
                  {otherVoices.length > 0 ? otherVoices.map((voice) => (
                    <div key={voice.name} className="flex items-center space-x-2 pl-2">
                      <RadioGroupItem value={voice.name} id={voice.name} />
                      <Label htmlFor={voice.name} className="cursor-pointer w-full">
                        {voice.name} {voice.default && "(Par défaut)"} <span className="text-xs text-muted-foreground">({voice.lang})</span>
                      </Label>
                    </div>
                  )) : (
                    <div className="text-center p-2 text-muted-foreground">
                      Aucune autre voix détectée
                    </div>
                  )}
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="robotic-effect">Effet Jarvis: {Math.round(roboticEffect * 100)}%</Label>
              </div>
              <Slider
                id="robotic-effect"
                min={0}
                max={1}
                step={0.1}
                value={[roboticEffect]}
                onValueChange={(values) => setRoboticEffect(values[0])}
                className="accent-jarvis-blue"
              />
              <p className="text-xs text-muted-foreground">Ajustez pour obtenir un effet de voix robotique comme Jarvis</p>
            </div>
            
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

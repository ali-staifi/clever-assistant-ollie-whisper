
import React from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, User, Users } from "lucide-react";

interface VoiceSettingsProps {
  roboticEffect: number;
  setRoboticEffect: (value: number) => void;
  rate: number;
  setRate: (value: number) => void;
  pitch: number;
  setPitch: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
  voiceGender?: 'male' | 'female' | 'neutral';
  setVoiceGender?: (gender: 'male' | 'female' | 'neutral') => void;
  onTestVoice?: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  roboticEffect,
  setRoboticEffect,
  rate,
  setRate,
  pitch,
  setPitch,
  volume,
  setVolume,
  voiceGender = 'female',
  setVoiceGender,
  onTestVoice
}) => {
  return (
    <div className="space-y-6">
      {setVoiceGender && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="voice-gender">Type de voix</Label>
            <User className="h-4 w-4" />
          </div>
          <Select value={voiceGender} onValueChange={setVoiceGender}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Voix féminine</SelectItem>
              <SelectItem value="male">Voix masculine</SelectItem>
              <SelectItem value="neutral">Voix neutre</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Sélectionne automatiquement une voix correspondante</p>
        </div>
      )}
      
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
      
      {onTestVoice && (
        <div className="mt-4">
          <button
            onClick={onTestVoice}
            className="w-full px-4 py-2 bg-jarvis-blue text-white rounded hover:bg-jarvis-blue/80 transition-colors"
          >
            Tester la voix avec ces paramètres
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceSettings;

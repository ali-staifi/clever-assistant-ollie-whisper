
import React from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Volume2, Wand2 } from "lucide-react";
import { FastSpeech2Params } from "@/services/speech/FastSpeech2Service";

interface AdvancedVoiceSettingsProps {
  voiceParams: FastSpeech2Params;
  onSpeedChange: (value: number) => void;
  onPitchChange: (value: number) => void;
  onEnergyChange: (value: number) => void;
  onEmotionChange: (emotion: FastSpeech2Params['emotion']) => void;
  onEmotionStrengthChange: (value: number) => void;
  onTest: () => void;
  isSpeaking: boolean;
}

const AdvancedVoiceSettings: React.FC<AdvancedVoiceSettingsProps> = ({
  voiceParams,
  onSpeedChange,
  onPitchChange,
  onEnergyChange,
  onEmotionChange,
  onEmotionStrengthChange,
  onTest,
  isSpeaking
}) => {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-jarvis-blue" />
          Paramètres Vocaux Avancés
        </h2>
        <Button 
          onClick={onTest} 
          variant={isSpeaking ? "destructive" : "outline"}
          size="sm"
        >
          {isSpeaking ? "Arrêter" : "Tester la voix"}
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Vitesse de parole */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="speed">Vitesse: {voiceParams.speed.toFixed(1)}</Label>
          </div>
          <Slider
            id="speed"
            min={0.5}
            max={2}
            step={0.1}
            value={[voiceParams.speed]}
            onValueChange={(values) => onSpeedChange(values[0])}
          />
          <p className="text-xs text-muted-foreground">Ajustez pour accélérer ou ralentir la parole</p>
        </div>
        
        {/* Hauteur de la voix */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="pitch">Hauteur: {voiceParams.pitch.toFixed(1)}</Label>
          </div>
          <Slider
            id="pitch"
            min={0.5}
            max={2}
            step={0.1}
            value={[voiceParams.pitch]}
            onValueChange={(values) => onPitchChange(values[0])}
          />
          <p className="text-xs text-muted-foreground">Ajustez pour une voix plus aiguë ou plus grave</p>
        </div>
        
        {/* Énergie/Volume */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="energy">Énergie: {voiceParams.energy.toFixed(1)}</Label>
            <Volume2 className="h-4 w-4" />
          </div>
          <Slider
            id="energy"
            min={0.5}
            max={2}
            step={0.1}
            value={[voiceParams.energy]}
            onValueChange={(values) => onEnergyChange(values[0])}
          />
          <p className="text-xs text-muted-foreground">Ajustez l'intensité et le volume de la voix</p>
        </div>
        
        {/* Émotion */}
        <div className="space-y-2">
          <Label htmlFor="emotion">Émotion</Label>
          <Select 
            value={voiceParams.emotion} 
            onValueChange={(value: FastSpeech2Params['emotion']) => onEmotionChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une émotion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neutral">Neutre</SelectItem>
              <SelectItem value="happy">Heureux</SelectItem>
              <SelectItem value="sad">Triste</SelectItem>
              <SelectItem value="angry">En colère</SelectItem>
              <SelectItem value="surprised">Surpris</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Intensité de l'émotion */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="emotion-strength">
              Intensité de l'émotion: {(voiceParams.emotionStrength * 100).toFixed(0)}%
            </Label>
          </div>
          <Slider
            id="emotion-strength"
            min={0}
            max={1}
            step={0.1}
            value={[voiceParams.emotionStrength]}
            onValueChange={(values) => onEmotionStrengthChange(values[0])}
          />
          <p className="text-xs text-muted-foreground">Ajustez l'intensité de l'expression émotionnelle</p>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Ces paramètres avancés sont simulés car ils nécessitent des modèles IA externes comme FastSpeech2. 
          Dans une implémentation complète, ils seraient connectés à un service de synthèse vocale neuronal.
        </p>
      </div>
    </Card>
  );
};

export default AdvancedVoiceSettings;

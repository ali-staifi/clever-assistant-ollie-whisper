
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface VoiceListProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
}

const VoiceList: React.FC<VoiceListProps> = ({ 
  voices, 
  selectedVoice, 
  setSelectedVoice 
}) => {
  // Helper to show language badge
  const renderLanguageBadge = (lang: string) => {
    const langCode = lang.split('-')[0].toUpperCase();
    return (
      <Badge variant="outline" className="ml-1 text-xs">
        {langCode}
      </Badge>
    );
  };

  return (
    <div className="space-y-2">
      <RadioGroup 
        value={selectedVoice} 
        onValueChange={setSelectedVoice}
        className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2"
      >
        {voices.length > 0 ? voices.map((voice) => (
          <div key={voice.name} className="flex items-center space-x-2 pl-2">
            <RadioGroupItem value={voice.name} id={voice.name} />
            <Label htmlFor={voice.name} className="cursor-pointer w-full">
              {voice.name} {voice.default && "(Par défaut)"} {renderLanguageBadge(voice.lang)}
            </Label>
          </div>
        )) : (
          <div className="text-center p-2 text-muted-foreground">
            Aucune voix trouvée
          </div>
        )}
      </RadioGroup>
    </div>
  );
};

export default VoiceList;

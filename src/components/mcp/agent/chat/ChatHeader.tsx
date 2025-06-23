
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Volume2, VolumeX } from 'lucide-react';

interface ChatHeaderProps {
  isSpeaking: boolean;
  globalVoiceSettings: any;
  toggleSpeaking: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSpeaking,
  globalVoiceSettings,
  toggleSpeaking
}) => {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Chat Agent IA MCP
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSpeaking}
            className="flex items-center gap-1"
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isSpeaking ? 'Muet' : 'Audio'}
          </Button>
          <Badge variant="secondary" className="text-xs">
            {globalVoiceSettings ? 'Vocal Actif' : 'Vocal Off'}
          </Badge>
        </div>
      </CardTitle>
    </CardHeader>
  );
};

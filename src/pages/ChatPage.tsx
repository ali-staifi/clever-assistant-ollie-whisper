
import React from 'react';
import ChatInterface from "@/components/chatbot/ChatInterface";
import { Button } from "@/components/ui/button";
import { ServerIcon, Settings, Mic } from "lucide-react";
import VoiceSettingsDialog from "@/components/dialogs/VoiceSettingsDialog";
import { useSpeechService } from "@/hooks/jarvis/useSpeechService";

const ChatPage = () => {
  const [voiceSettingsOpen, setVoiceSettingsOpen] = React.useState(false);
  
  // Utiliser le service vocal global pour connecter les paramètres
  const { globalVoiceSettings, updateGlobalVoiceSettings } = useSpeechService();
  
  return (
    <div className="flex flex-col h-screen p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chat Assistant</h1>
          <p className="text-muted-foreground">
            Discutez avec l'assistant et partagez des fichiers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setVoiceSettingsOpen(true)}
          >
            <Mic className="h-4 w-4" />
            <span>Paramètres Vocaux</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              const event = new CustomEvent('toggle-jarvis-settings');
              document.dispatchEvent(event);
            }}
          >
            <ServerIcon className="h-4 w-4" />
            <span>Modèles Ollama</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1">
        <ChatInterface />
      </div>
      
      <VoiceSettingsDialog
        open={voiceSettingsOpen}
        onOpenChange={setVoiceSettingsOpen}
        globalVoiceSettings={globalVoiceSettings}
        onUpdateGlobalVoiceSettings={updateGlobalVoiceSettings}
      />
    </div>
  );
};

export default ChatPage;

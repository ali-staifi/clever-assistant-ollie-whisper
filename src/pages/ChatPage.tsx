
import React from 'react';
import ChatInterface from "@/components/chatbot/ChatInterface";
import { Button } from "@/components/ui/button";
import { ServerIcon, Settings, Mic, Volume2 } from "lucide-react";
import VoiceSettingsDialog from "@/components/dialogs/VoiceSettingsDialog";
import { useJarvisServices } from "@/hooks/useJarvisServices";

const ChatPage = () => {
  const [voiceSettingsOpen, setVoiceSettingsOpen] = React.useState(false);
  
  // Utiliser le service vocal global pour connecter les paramètres
  const { 
    globalVoiceSettings, 
    updateGlobalVoiceSettings,
    isSpeaking,
    toggleSpeaking 
  } = useJarvisServices();
  
  return (
    <div className="flex flex-col h-screen p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chat Assistant</h1>
          <p className="text-muted-foreground">
            Discutez avec l'assistant et partagez des fichiers
          </p>
          {/* Indicateur des paramètres vocaux actifs */}
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            <span>
              Voix {globalVoiceSettings.voiceGender} • 
              Vitesse: {globalVoiceSettings.rate.toFixed(1)} • 
              Effet Jarvis: {Math.round(globalVoiceSettings.roboticEffect * 100)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Voice control button */}
          <Button
            variant={isSpeaking ? "destructive" : "outline"}
            className="flex items-center gap-2"
            onClick={toggleSpeaking}
          >
            <Volume2 className="h-4 w-4" />
            <span>{isSpeaking ? "Arrêter" : "Synthèse"}</span>
          </Button>
          
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


import React from 'react';
import { Button } from "@/components/ui/button";
import { OllamaConnectionStatus } from '@/hooks/useChatOllama';

interface ChatHeaderProps {
  connectionStatus: OllamaConnectionStatus;
  ollamaModel: string;
  showConnectionSetup: boolean;
  onToggleConnectionSetup: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  connectionStatus, 
  ollamaModel,
  showConnectionSetup,
  onToggleConnectionSetup
}) => {
  return (
    <div 
      className="flex items-center justify-between p-2 border-b cursor-pointer"
      onClick={onToggleConnectionSetup}
    >
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' : 
          connectionStatus === 'connecting' ? 'bg-amber-500' : 'bg-red-500'
        }`}></div>
        <span className="text-sm font-medium">
          {connectionStatus === 'connected' 
            ? `Connecté à Ollama (${ollamaModel})` 
            : connectionStatus === 'connecting' 
              ? 'Connexion à Ollama...' 
              : 'Non connecté à Ollama'}
        </span>
      </div>
      <Button variant="ghost" size="sm">
        {showConnectionSetup ? 'Cacher les paramètres' : 'Afficher les paramètres'}
      </Button>
    </div>
  );
};

export default ChatHeader;

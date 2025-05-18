
import React from 'react';
import { ServerIcon } from "lucide-react";
import { OllamaConnectionStatus } from '@/hooks/useChatOllama';

interface ConnectionHeaderProps {
  connectionStatus: OllamaConnectionStatus;
}

const ConnectionHeader: React.FC<ConnectionHeaderProps> = ({ connectionStatus }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <ServerIcon className="h-5 w-5" />
      <h2 className="text-lg font-medium">Configuration d'Ollama</h2>
      <div className={`ml-auto flex items-center gap-2 ${
        connectionStatus === 'connected' 
          ? 'text-green-500' 
          : connectionStatus === 'connecting' 
            ? 'text-amber-500' 
            : 'text-red-500'
      }`}>
        <div className={`h-2 w-2 rounded-full ${
          connectionStatus === 'connected' 
            ? 'bg-green-500' 
            : connectionStatus === 'connecting' 
              ? 'bg-amber-500' 
              : 'bg-red-500'
        }`}></div>
        <span className="text-sm">
          {connectionStatus === 'connected' 
            ? 'Connecté' 
            : connectionStatus === 'connecting' 
              ? 'Connexion...' 
              : 'Non connecté'}
        </span>
      </div>
    </div>
  );
};

export default ConnectionHeader;

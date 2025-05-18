
import React from 'react';
import { OllamaConnectionStatus } from '@/hooks/useChatOllama';
import { Check } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ConnectionStatusProps {
  connectionStatus: OllamaConnectionStatus;
  ollamaUrl: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionStatus,
  ollamaUrl
}) => {
  return (
    <>
      {connectionStatus === 'connected' && (
        <div className="text-xs text-green-500 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Connecté au serveur Ollama
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2 text-xs">
            Impossible de se connecter à Ollama. Assurez-vous qu'Ollama est en cours d'exécution avec CORS activé:
            <code className="block mt-1 p-1 bg-black/20 rounded text-[11px]">
              $env:OLLAMA_ORIGINS="*"; ollama serve
            </code>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ConnectionStatus;

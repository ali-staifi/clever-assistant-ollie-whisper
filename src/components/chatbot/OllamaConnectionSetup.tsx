
import { useState, useEffect } from 'react';
import { OllamaConnectionStatus } from '@/hooks/useChatOllama';
import { useToast } from '@/hooks/use-toast';
import ConnectionHeader from './connection/ConnectionHeader';
import UrlInput from './connection/UrlInput';
import ConnectionStatus from './connection/ConnectionStatus';
import ModelSelector from './connection/ModelSelector';

interface OllamaConnectionSetupProps {
  ollamaUrl: string;
  ollamaModel: string;
  connectionStatus: OllamaConnectionStatus;
  availableModels: string[];
  onOllamaUrlChange: (url: string) => void;
  onOllamaModelChange: (model: string) => void;
  onCheckConnection: () => Promise<boolean>;
  onClearChat: () => void;
}

const OllamaConnectionSetup: React.FC<OllamaConnectionSetupProps> = ({
  ollamaUrl,
  ollamaModel,
  connectionStatus,
  availableModels,
  onOllamaUrlChange,
  onOllamaModelChange,
  onCheckConnection,
  onClearChat
}) => {
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const { toast } = useToast();

  // Check connection on mount
  useEffect(() => {
    if (!initialSetupDone) {
      onCheckConnection();
      setInitialSetupDone(true);
    }
  }, []);
  
  // Re-check connection when model changes
  useEffect(() => {
    if (initialSetupDone) {
      onCheckConnection();
    }
  }, [ollamaModel]);

  // Function for testing connection with feedback
  const handleTestConnection = async () => {
    try {
      const success = await onCheckConnection();
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "La connexion à Ollama est établie avec succès.",
          variant: "default",
        });
      } else {
        toast({
          title: "Connexion échouée",
          description: "Impossible de se connecter à Ollama. Vérifiez votre configuration.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du test de connexion.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="p-4 bg-card border rounded-lg mb-4">
      <ConnectionHeader connectionStatus={connectionStatus} />

      <div className="grid gap-4">
        <div>
          <UrlInput 
            ollamaUrl={ollamaUrl}
            onOllamaUrlChange={onOllamaUrlChange}
            onCheckConnection={handleTestConnection}
            connectionStatus={connectionStatus}
          />
          
          <ConnectionStatus 
            connectionStatus={connectionStatus}
            ollamaUrl={ollamaUrl}
          />
        </div>
        
        {connectionStatus === 'connected' && (
          <ModelSelector
            ollamaModel={ollamaModel}
            availableModels={availableModels}
            onOllamaModelChange={onOllamaModelChange}
            onClearChat={onClearChat}
          />
        )}
      </div>
    </div>
  );
};

export default OllamaConnectionSetup;

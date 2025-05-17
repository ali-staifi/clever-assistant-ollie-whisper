import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ServerIcon, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { OllamaConnectionStatus } from '@/hooks/useChatOllama';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

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

const COMMON_MODELS = [
  { value: "llama3", label: "Llama 3 (8B)" },
  { value: "llama3:8b-instruct-q4_0", label: "Llama 3 (8B) Instruct Q4" },
  { value: "llama3:70b-instruct-q4_0", label: "Llama 3 (70B) Instruct Q4" },
  { value: "mistral", label: "Mistral" },
  { value: "mixtral", label: "Mixtral 8x7B" },
  { value: "phi3:mini", label: "Phi-3 Mini" },
  { value: "qwen2", label: "Qwen 2" },
  { value: "qwen2:7b", label: "Qwen 2 (7B)" },
  { value: "qwen2:4b", label: "Qwen 2 (4B)" },
];

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
  const [tempUrl, setTempUrl] = useState(ollamaUrl);
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Check connection on mount
  useEffect(() => {
    if (!initialSetupDone) {
      onCheckConnection();
      setInitialSetupDone(true);
    }
  }, []);

  // Fonction pour tester la connexion avec feedback
  const handleTestConnection = async () => {
    setIsChecking(true);
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
    } finally {
      setIsChecking(false);
    }
  };

  // Get displayed models - either available models or common models
  const getDisplayModels = () => {
    if (availableModels && availableModels.length > 0) {
      // Map available models to the format needed for display
      return availableModels.map(modelName => {
        // Try to find a matching common model for better labeling
        const commonModel = COMMON_MODELS.find(m => m.value === modelName);
        return {
          value: modelName,
          label: commonModel ? commonModel.label : modelName
        };
      });
    }
    
    // Fallback to common models if available models not provided
    return COMMON_MODELS;
  };

  const displayModels = getDisplayModels();
  
  // Vérifie si Qwen est présent dans les modèles disponibles
  const hasQwenModel = availableModels.some(model => model.toLowerCase().includes('qwen'));
  const isUsingQwen = ollamaModel.toLowerCase().includes('qwen');

  return (
    <div className="p-4 bg-card border rounded-lg mb-4">
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

      <div className="grid gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Input 
              placeholder="URL Ollama (ex: http://localhost:11434)"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => {
                onOllamaUrlChange(tempUrl);
              }}
              variant="secondary"
              size="sm"
              disabled={connectionStatus === 'connecting' || tempUrl === ollamaUrl || isChecking}
            >
              Appliquer
            </Button>
            <Button
              onClick={handleTestConnection}
              variant={connectionStatus === 'connected' ? "outline" : "default"}
              size="sm"
              disabled={connectionStatus === 'connecting' || isChecking}
              className="flex items-center gap-1"
            >
              {isChecking && <RefreshCw className="h-3 w-3 animate-spin mr-1" />}
              {isChecking ? 'Test...' : 'Tester'}
            </Button>
          </div>
          
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
        </div>
        
        <Alert variant="default" className="bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-sm">Installation requise</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            <p>Pour utiliser cette interface, vous devez installer Ollama sur votre ordinateur:</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>Téléchargez et installez Ollama depuis <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">ollama.com/download</a></li>
              <li>Lancez Ollama avec CORS activé: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="*"; ollama serve</code></li>
              <li>Installez un modèle: <code className="bg-muted-foreground/20 px-1 rounded">ollama pull llama3</code></li>
              {isUsingQwen && !hasQwenModel && (
                <li className="text-red-500">
                  Pour utiliser Qwen 2, exécutez: <code className="bg-muted-foreground/20 px-1 rounded">ollama pull qwen2</code> ou <code className="bg-muted-foreground/20 px-1 rounded">ollama pull qwen2:7b</code>
                </li>
              )}
            </ol>
          </AlertDescription>
        </Alert>
        
        {connectionStatus === 'connected' && (
          <div>
            <label className="text-sm mb-1 block">Sélectionner un modèle</label>
            <div className="flex items-center gap-2">
              <Select
                value={ollamaModel}
                onValueChange={onOllamaModelChange}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {displayModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClearChat}
              >
                Effacer le chat
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Modèle utilisé: {ollamaModel}
            </div>
            
            {availableModels.length === 0 && (
              <Alert variant="default" className="mt-2 p-2 bg-orange-500/10 border border-orange-500/30">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <AlertDescription className="ml-1 text-xs">
                  Aucun modèle n'a été trouvé. Installez-en un avec: <code className="bg-muted-foreground/20 px-1 rounded">ollama pull llama3</code>
                </AlertDescription>
              </Alert>
            )}
            
            {isUsingQwen && !hasQwenModel && (
              <Alert variant="destructive" className="mt-2 p-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="ml-1 text-xs">
                  Le modèle Qwen n'est pas installé sur votre Ollama. Installez-le avec:
                  <code className="block mt-1 p-1 bg-black/20 rounded text-[11px]">
                    ollama pull qwen2
                  </code>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OllamaConnectionSetup;

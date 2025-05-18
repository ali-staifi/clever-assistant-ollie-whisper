
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Save } from "lucide-react";

interface OllamaSettingsProps {
  ollamaUrl: string;
  ollamaModel: string;
  onOllamaUrlChange: (url: string) => void;
  onOllamaModelChange: (model: string) => void;
  checkConnection: () => void;
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
  availableModels?: string[];
}

// Common models list with Gemma as the default choice now
const COMMON_MODELS = [
  { value: "gemma:7b", label: "Gemma 7B" },
  { value: "gemma:2b", label: "Gemma 2B" },
  { value: "mixtral", label: "Mixtral 8x7B" },
  { value: "llama3", label: "Llama 3 (8B)" },
  { value: "llama3:8b-instruct-q4_0", label: "Llama 3 (8B) Instruct Q4" },
  { value: "llama3:70b-instruct-q4_0", label: "Llama 3 (70B) Instruct Q4" },
  { value: "mistral", label: "Mistral" },
  { value: "phi3:mini", label: "Phi-3 Mini" },
  { value: "phi3:medium", label: "Phi-3 Medium" },
  { value: "qwen2", label: "Qwen 2" },
];

const OllamaSettings: React.FC<OllamaSettingsProps> = ({
  ollamaUrl,
  ollamaModel,
  onOllamaUrlChange,
  onOllamaModelChange,
  checkConnection,
  ollamaStatus,
  availableModels = []
}) => {
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

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="ollama-url">URL de l'API Ollama</Label>
        <div className="flex gap-2">
          <Input
            id="ollama-url"
            value={ollamaUrl}
            onChange={(e) => onOllamaUrlChange(e.target.value)}
            placeholder="http://localhost:11434"
          />
          <Button 
            variant="secondary" 
            onClick={checkConnection}
            className={`${ollamaStatus === 'connecting' ? 'opacity-70' : ''}`}
            disabled={ollamaStatus === 'connecting'}
          >
            {ollamaStatus === 'connecting' ? 'Connexion...' : 'Tester'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          L'URL où votre serveur Ollama est en cours d'exécution
        </p>
      </div>
      
      {ollamaStatus === 'error' && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Impossible de se connecter à Ollama. Assurez-vous qu'Ollama est en cours d'exécution avec CORS activé.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-muted/50 border border-muted">
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription className="text-xs">
          Pour exécuter Ollama avec CORS activé: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="*"; ollama serve</code>
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <Label htmlFor="ollama-model">Modèle Ollama</Label>
        <Select
          value={ollamaModel}
          onValueChange={onOllamaModelChange}
        >
          <SelectTrigger>
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
        <p className="text-xs text-muted-foreground">
          Le modèle doit être installé sur votre serveur Ollama
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Installez plus de modèles avec: <code className="bg-muted-foreground/20 px-1 rounded">ollama pull nom_du_modèle</code>
        </p>
      </div>

      <Alert className="mt-2 bg-green-500/10 border border-green-500/30">
        <Save className="h-4 w-4 mr-2 text-green-500" />
        <AlertDescription className="text-xs text-green-600">
          Vos paramètres sont automatiquement sauvegardés et seront restaurés lors de votre prochaine visite.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default OllamaSettings;

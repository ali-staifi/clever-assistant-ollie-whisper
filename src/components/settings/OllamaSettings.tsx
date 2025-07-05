
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Info, Save, Database } from "lucide-react";
import OllamaAutoConfig from "./OllamaAutoConfig";

interface OllamaSettingsProps {
  ollamaUrl: string;
  ollamaModel: string;
  onOllamaUrlChange: (url: string) => void;
  onOllamaModelChange: (model: string) => void;
  checkConnection: () => void;
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
  availableModels?: string[];
}

const COMMON_MODELS = [
  { value: "gemma:latest", label: "Gemma Latest" },
  { value: "gemma3:latest", label: "Gemma 3" },
  { value: "llama3:latest", label: "Llama 3" },
  { value: "llama3.2:latest", label: "Llama 3.2" },
  { value: "mistral:latest", label: "Mistral" },
  { value: "qwen:latest", label: "Qwen" },
  { value: "qwen3:latest", label: "Qwen 3" },
  { value: "qwen3:8b", label: "Qwen 3 8B" },
  { value: "mixtral", label: "Mixtral 8x7B" },
  { value: "phi3:mini", label: "Phi-3 Mini" },
  { value: "phi3:medium", label: "Phi-3 Medium" },
  { value: "stablelm:zephyr", label: "StableLM Zephyr" }
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
    // Combine both available and common models
    const allModels = new Set<string>();
    
    // Add available models from the server
    if (availableModels && availableModels.length > 0) {
      availableModels.forEach(model => allModels.add(model));
    }
    
    // Also add common models that might not be on the server yet
    COMMON_MODELS.forEach(model => allModels.add(model.value));
    
    // Convert to the format needed for display
    return Array.from(allModels).map(modelName => {
      // Try to find a matching common model for better labeling
      const commonModel = COMMON_MODELS.find(m => m.value === modelName);
      return {
        value: modelName,
        label: commonModel ? commonModel.label : modelName,
        isAvailable: availableModels.includes(modelName)
      };
    }).sort((a, b) => {
      // Sort by availability first, then alphabetically
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  
  const displayModels = getDisplayModels();

  return (
    <>
      {/* Auto Configuration Section */}
      <OllamaAutoConfig onConfigurationChange={(configured) => {
        if (configured) {
          checkConnection();
        }
      }} />
      
      <Separator className="my-6" />
      
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

      <Alert className="bg-muted/50 border border-muted mt-2">
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription className="text-xs">
          Pour exécuter Ollama avec CORS activé: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="*"; ollama serve</code>
          <br/>
          Ou pour Windows PowerShell: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="*"; .\ollama.exe serve</code>
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2 mt-4">
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
              <SelectItem 
                key={model.value} 
                value={model.value}
                className={model.isAvailable ? "" : "text-muted-foreground"}
              >
                {model.label} {!model.isAvailable && "(non installé)"}
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

      <Alert className="mt-4 bg-blue-500/10 border border-blue-500/30">
        <Database className="h-4 w-4 mr-2 text-blue-500" />
        <AlertDescription className="text-xs">
          Pour les paramètres avancés d'Ollama (comme mentionné sur arsturn.com), consultez la 
          <a href="https://github.com/ollama/ollama/blob/main/docs/modelfile.md" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
            documentation Modelfile
          </a>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default OllamaSettings;


import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelItem {
  value: string;
  label: string;
}

interface ModelSelectorProps {
  ollamaModel: string;
  availableModels: string[];
  onOllamaModelChange: (model: string) => void;
  onClearChat: () => void;
}

// Liste étendue des modèles courants
const COMMON_MODELS = [
  { value: "gemma:7b", label: "Gemma (7B)" },
  { value: "gemma:2b", label: "Gemma (2B)" },
  { value: "llama3", label: "Llama 3 (8B)" },
  { value: "llama3:8b", label: "Llama 3 (8B)" },
  { value: "llama3:8b-instruct-q4_0", label: "Llama 3 (8B) Instruct Q4" },
  { value: "llama3:70b-instruct-q4_0", label: "Llama 3 (70B) Instruct Q4" },
  { value: "mistral", label: "Mistral" },
  { value: "mixtral", label: "Mixtral 8x7B" },
  { value: "phi3:mini", label: "Phi-3 Mini" },
  { value: "phi3:medium", label: "Phi-3 Medium" },
  { value: "qwen2", label: "Qwen 2" },
  { value: "qwen2:7b", label: "Qwen 2 (7B)" },
  { value: "qwen2:4b", label: "Qwen 2 (4B)" },
  { value: "qwen2:1.5b", label: "Qwen 2 (1.5B)" }, 
  { value: "qwen:14b", label: "Qwen 1 (14B)" },
  { value: "stablelm:zephyr", label: "StableLM Zephyr" },
  { value: "neural-chat", label: "Neural Chat" }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({
  ollamaModel,
  availableModels,
  onOllamaModelChange,
  onClearChat
}) => {
  // Get displayed models - combining available models and common models
  const getDisplayModels = () => {
    // Create a Set to deduplicate models
    const allModels = new Set<string>();
    
    // Add all available models from the server
    if (availableModels && availableModels.length > 0) {
      availableModels.forEach(model => allModels.add(model));
    }
    
    // Add common models that might not be detected
    COMMON_MODELS.forEach(model => allModels.add(model.value));
    
    // Convert to display format
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
  
  // Check if selected model is available
  const isSelectedModelAvailable = availableModels.includes(ollamaModel);

  return (
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
          <AlertCircle className="h-3 w-3 text-orange-500" />
          <AlertDescription className="ml-1 text-xs">
            Aucun modèle trouvé sur votre serveur Ollama. Veuillez en installer avec la commande:
            <code className="block mt-1 p-1 bg-black/20 rounded text-[11px]">
              ollama pull {ollamaModel}
            </code>
          </AlertDescription>
        </Alert>
      )}
      
      {!isSelectedModelAvailable && availableModels.length > 0 && (
        <Alert variant="destructive" className="mt-2 p-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="ml-1 text-xs">
            Le modèle {ollamaModel} n'est pas installé sur votre Ollama. Installez-le avec:
            <code className="block mt-1 p-1 bg-black/20 rounded text-[11px] whitespace-normal break-words">
              ollama pull {ollamaModel}
            </code>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Instructions pour Ollama */}
      <Alert variant="default" className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30">
        <AlertCircle className="h-3 w-3 text-blue-500" />
        <AlertDescription className="ml-1 text-xs">
          Pour utiliser des paramètres avancés, créez un Modelfile personnalisé:
          <code className="block mt-1 p-1 bg-black/20 rounded text-[11px] whitespace-normal break-words">
            FROM {ollamaModel}
            <br/>
            PARAMETER temperature 0.7
            <br/>
            PARAMETER top_k 40
            <br/>
            PARAMETER top_p 0.9
          </code>
          Puis construisez votre modèle: <code className="bg-black/20 rounded text-[11px] px-1">ollama create mon-modele -f Modelfile</code>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ModelSelector;

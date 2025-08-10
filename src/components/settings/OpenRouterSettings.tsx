
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Info, Key, Zap } from "lucide-react";

interface OpenRouterSettingsProps {
  apiKey: string;
  model: string;
  onApiKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
  checkConnection: () => void;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  availableModels?: string[];
}

const FREE_MODELS = [
  { value: "microsoft/phi-3-mini-4k-instruct:free", label: "Phi-3 Mini (Microsoft)" },
  { value: "microsoft/phi-3-medium-4k-instruct:free", label: "Phi-3 Medium (Microsoft)" },
  { value: "google/gemma-2-9b-it:free", label: "Gemma 2 9B (Google)" },
  { value: "meta-llama/llama-3-8b-instruct:free", label: "Llama 3 8B (Meta)" },
  { value: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B" },
  { value: "huggingfaceh4/zephyr-7b-beta:free", label: "Zephyr 7B (HuggingFace)" }
];

const OpenRouterSettings: React.FC<OpenRouterSettingsProps> = ({
  apiKey,
  model,
  onApiKeyChange,
  onModelChange,
  checkConnection,
  connectionStatus,
  availableModels = []
}) => {
  
  const getDisplayModels = () => {
    const allModels = new Set<string>();
    
    // Add free models
    FREE_MODELS.forEach(model => allModels.add(model.value));
    
    // Add available models from API
    if (availableModels && availableModels.length > 0) {
      availableModels.forEach(model => allModels.add(model));
    }
    
    return Array.from(allModels).map(modelName => {
      const freeModel = FREE_MODELS.find(m => m.value === modelName);
      return {
        value: modelName,
        label: freeModel ? freeModel.label : modelName,
        isFree: freeModel !== undefined || modelName.includes(':free')
      };
    }).sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  
  const displayModels = getDisplayModels();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="openrouter-api-key">Clé API OpenRouter</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="openrouter-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-or-v1-..."
              className="pl-8"
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={checkConnection}
            className={`${connectionStatus === 'connecting' ? 'opacity-70' : ''}`}
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? 'Test...' : 'Tester'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Obtenez votre clé API gratuite sur <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">openrouter.ai</a>
        </p>
      </div>
      
      {connectionStatus === 'error' && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Impossible de se connecter à OpenRouter. Vérifiez votre clé API.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-muted/50 border border-muted mt-2">
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription className="text-xs">
          OpenRouter donne accès à de nombreux modèles LLM via une seule API. Les modèles marqués ":free" sont gratuits avec des limites de taux.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2 mt-4">
        <Label htmlFor="openrouter-model">Modèle LLM</Label>
        <Select
          value={model}
          onValueChange={onModelChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un modèle" />
          </SelectTrigger>
          <SelectContent>
            {displayModels.map((model) => (
              <SelectItem 
                key={model.value} 
                value={model.value}
                className={model.isFree ? "" : "text-muted-foreground"}
              >
                <div className="flex items-center gap-2">
                  {model.isFree && <Zap className="h-3 w-3 text-green-500" />}
                  {model.label} {model.isFree ? "(Gratuit)" : "(Payant)"}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Les modèles gratuits ont des limites de taux mais sont parfaits pour commencer
        </p>
      </div>

      <Alert className="mt-4 bg-green-500/10 border border-green-500/30">
        <Zap className="h-4 w-4 mr-2 text-green-500" />
        <AlertDescription className="text-xs">
          Tous les modèles listés ici sont accessibles gratuitement via OpenRouter avec des limites de taux raisonnables.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default OpenRouterSettings;

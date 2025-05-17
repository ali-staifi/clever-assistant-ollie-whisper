
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface OllamaSettingsProps {
  ollamaUrl: string;
  ollamaModel: string;
  onOllamaUrlChange: (url: string) => void;
  onOllamaModelChange: (model: string) => void;
  checkConnection: () => void;
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
  availableModels?: string[];
}

// Common models list moved from SettingsPanel
const COMMON_MODELS = [
  { value: "llama3", label: "Llama 3 (8B)" },
  { value: "llama3:8b-instruct-q4_0", label: "Llama 3 (8B) Instruct Q4" },
  { value: "llama3:70b-instruct-q4_0", label: "Llama 3 (70B) Instruct Q4" },
  { value: "mistral", label: "Mistral" },
  { value: "mixtral", label: "Mixtral 8x7B" },
  { value: "phi3:mini", label: "Phi-3 Mini" },
  { value: "phi3:medium", label: "Phi-3 Medium" },
  { value: "gemma:7b", label: "Gemma 7B" },
  { value: "gemma:2b", label: "Gemma 2B" },
  { value: "codellama", label: "CodeLlama" },
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
        <Label htmlFor="ollama-url">Ollama API URL</Label>
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
            {ollamaStatus === 'connecting' ? 'Connecting...' : 'Test'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          The URL where your Ollama server is running
        </p>
      </div>
      
      {ollamaStatus === 'error' && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Cannot connect to Ollama. Make sure Ollama is running and CORS is properly configured.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-muted/50 border border-muted">
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription className="text-xs">
          <strong>Configure Ollama CORS in PowerShell:</strong>
          <ol className="list-decimal pl-5 mt-1 space-y-1">
            <li>Open PowerShell as administrator</li>
            <li>If Ollama is already running, stop it with: <code className="bg-muted-foreground/20 px-1 rounded">Stop-Process -Name ollama</code></li>
            <li>Start Ollama with CORS enabled: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="*"; ollama serve</code></li>
            <li>Or for a specific origin: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="https://yourdomain.com"; ollama serve</code></li>
          </ol>
          <p className="mt-1">If you get "Only one usage of each socket address" error, Ollama is already running. Stop it first with <code className="bg-muted-foreground/20 px-1 rounded">Stop-Process -Name ollama</code> and try again.</p>
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <Label htmlFor="ollama-model">Ollama Model</Label>
        <Select
          value={ollamaModel}
          onValueChange={onOllamaModelChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
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
          The model should be installed on your Ollama server
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Install more models using: <code className="bg-muted-foreground/20 px-1 rounded">ollama pull modelname</code>
        </p>
      </div>
    </>
  );
};

export default OllamaSettings;

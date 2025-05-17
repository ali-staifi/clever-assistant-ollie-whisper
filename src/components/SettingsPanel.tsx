
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface SettingsPanelProps {
  ollamaUrl: string;
  ollamaModel: string;
  onOllamaUrlChange: (url: string) => void;
  onOllamaModelChange: (model: string) => void;
  onClearConversation: () => void;
  onClose: () => void;
  checkConnection: () => void;
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
}

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

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  ollamaUrl,
  ollamaModel,
  onOllamaUrlChange,
  onOllamaModelChange,
  onClearConversation,
  onClose,
  checkConnection,
  ollamaStatus
}) => {
  return (
    <div className="bg-card rounded-lg p-4 mb-4 shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 text-jarvis-blue">Settings</h2>
      
      <div className="grid gap-4">
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
              <li>Run: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="*"; ollama serve</code></li>
              <li>Or for a specific origin: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="https://yourdomain.com"; ollama serve</code></li>
            </ol>
            <p className="mt-1">For persistent configuration, set the environment variable system-wide.</p>
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
              {COMMON_MODELS.map((model) => (
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
            Install more models using: <code className="bg-muted-foreground/20 px-1 rounded">ollama run modelname</code>
          </p>
        </div>
        
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onClearConversation}>
            Clear Conversation
          </Button>
          <Button onClick={onClose}>Close Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

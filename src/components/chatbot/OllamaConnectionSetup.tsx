
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ServerIcon, Check } from "lucide-react";
import { OllamaConnectionStatus } from '@/hooks/useChatOllama';
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  // Check connection on mount
  useEffect(() => {
    if (!initialSetupDone) {
      onCheckConnection();
      setInitialSetupDone(true);
    }
  }, []);

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
    <div className="p-4 bg-card border rounded-lg mb-4">
      <div className="flex items-center gap-2 mb-4">
        <ServerIcon className="h-5 w-5" />
        <h2 className="text-lg font-medium">Ollama Connection</h2>
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
              ? 'Connected' 
              : connectionStatus === 'connecting' 
                ? 'Connecting...' 
                : 'Not connected'}
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Input 
              placeholder="Ollama URL (e.g. http://localhost:11434)"
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
              disabled={connectionStatus === 'connecting' || tempUrl === ollamaUrl}
            >
              Apply
            </Button>
            <Button
              onClick={() => onCheckConnection()}
              variant={connectionStatus === 'connected' ? "outline" : "default"}
              size="sm"
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Test'}
            </Button>
          </div>
          
          {connectionStatus === 'connected' && (
            <div className="text-xs text-green-500 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Connected to Ollama server
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2 text-xs">
                Cannot connect to Ollama. Make sure Ollama is running with CORS enabled:
                <code className="block mt-1 p-1 bg-black/20 rounded text-[11px]">
                  $env:OLLAMA_ORIGINS="*"; ollama serve
                </code>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {connectionStatus === 'connected' && (
          <div>
            <label className="text-sm mb-1 block">Select Model</label>
            <div className="flex items-center gap-2">
              <Select
                value={ollamaModel}
                onValueChange={onOllamaModelChange}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select model" />
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
                Clear Chat
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Using model: {ollamaModel}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OllamaConnectionSetup;


import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Settings, Key, Zap, CheckCircle, XCircle, AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface OpenRouterConnectionSetupProps {
  apiKey: string;
  model: string;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  availableModels: string[];
  onApiKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
  onCheckConnection: () => Promise<boolean>;
  onClearChat: () => void;
}

const FREE_MODELS = [
  { value: "microsoft/phi-3-mini-4k-instruct:free", label: "Phi-3 Mini (Microsoft)" },
  { value: "microsoft/phi-3-medium-4k-instruct:free", label: "Phi-3 Medium (Microsoft)" },
  { value: "google/gemma-2-9b-it:free", label: "Gemma 2 9B (Google)" },
  { value: "meta-llama/llama-3-8b-instruct:free", label: "Llama 3 8B (Meta)" },
  { value: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B" },
  { value: "huggingfaceh4/zephyr-7b-beta:free", label: "Zephyr 7B (HuggingFace)" }
];

const OpenRouterConnectionSetup: React.FC<OpenRouterConnectionSetupProps> = ({
  apiKey,
  model,
  connectionStatus,
  availableModels,
  onApiKeyChange,
  onModelChange,
  onCheckConnection,
  onClearChat
}) => {
  const [showSettings, setShowSettings] = useState(!apiKey);
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey && connectionStatus === 'idle') {
      onCheckConnection();
    }
  }, [apiKey]);

  const handleTestConnection = async () => {
    try {
      const success = await onCheckConnection();
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Connecté à OpenRouter avec succès",
        });
        setShowSettings(false);
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à OpenRouter",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'connecting':
        return <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connecté';
      case 'error':
        return 'Erreur';
      case 'connecting':
        return 'Connexion...';
      default:
        return 'Non connecté';
    }
  };

  const getDisplayModels = () => {
    const allModels = new Set<string>();
    
    FREE_MODELS.forEach(model => allModels.add(model.value));
    availableModels.forEach(model => allModels.add(model));
    
    return Array.from(allModels).map(modelName => {
      const freeModel = FREE_MODELS.find(m => m.value === modelName);
      return {
        value: modelName,
        label: freeModel ? freeModel.label : modelName,
        isFree: freeModel !== undefined || modelName.includes(':free')
      };
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-jarvis-blue" />
          <h2 className="text-lg font-semibold">Configuration OpenRouter</h2>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm text-muted-foreground">{getStatusText()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {connectionStatus === 'connected' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearChat}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Clé API OpenRouter</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="pl-8"
                />
              </div>
              <Button 
                onClick={handleTestConnection}
                disabled={connectionStatus === 'connecting' || !apiKey}
                size="sm"
              >
                Tester
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenez votre clé API gratuite sur{' '}
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                openrouter.ai
              </a>
            </p>
          </div>

          {connectionStatus === 'connected' && (
            <div className="space-y-2">
              <Label htmlFor="model">Modèle LLM</Label>
              <Select value={model} onValueChange={onModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {getDisplayModels().map((modelOption) => (
                    <SelectItem key={modelOption.value} value={modelOption.value}>
                      <div className="flex items-center gap-2">
                        {modelOption.isFree && <Zap className="h-3 w-3 text-green-500" />}
                        {modelOption.label}
                        {modelOption.isFree && (
                          <Badge variant="outline" className="text-xs">Gratuit</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Alert className="bg-blue-50 border-blue-200">
            <Zap className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              OpenRouter donne accès à de nombreux modèles LLM gratuits et payants via une seule API. 
              Les modèles gratuits sont parfaits pour commencer !
            </AlertDescription>
          </Alert>
        </div>
      )}

      {connectionStatus === 'connected' && !showSettings && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            <Zap className="h-3 w-3 mr-1" />
            {FREE_MODELS.find(m => m.value === model)?.label || model}
          </Badge>
          <span className="text-xs text-muted-foreground">Prêt pour le chat</span>
        </div>
      )}
    </Card>
  );
};

export default OpenRouterConnectionSetup;

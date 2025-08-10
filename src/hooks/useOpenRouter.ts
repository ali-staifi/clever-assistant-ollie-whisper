
import { useState, useEffect, useRef } from 'react';
import { OpenRouterService } from '@/services/openrouter/OpenRouterService';
import { useToast } from '@/hooks/use-toast';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

const FREE_MODELS = [
  'microsoft/phi-3-mini-4k-instruct:free',
  'microsoft/phi-3-medium-4k-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'huggingfaceh4/zephyr-7b-beta:free'
];

export const useOpenRouter = () => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('openrouter-api-key') || '';
  });
  const [model, setModel] = useState(() => {
    return localStorage.getItem('openrouter-model') || 'microsoft/phi-3-mini-4k-instruct:free';
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>(FREE_MODELS);
  
  const serviceRef = useRef<OpenRouterService | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey) {
      serviceRef.current = new OpenRouterService(apiKey, model);
      localStorage.setItem('openrouter-api-key', apiKey);
    }
  }, [apiKey, model]);

  useEffect(() => {
    localStorage.setItem('openrouter-model', model);
    if (serviceRef.current) {
      serviceRef.current.setModel(model);
    }
  }, [model]);

  const checkConnection = async () => {
    if (!apiKey) {
      setConnectionStatus('error');
      toast({
        title: "Clé API manquante",
        description: "Veuillez saisir votre clé API OpenRouter",
        variant: "destructive",
      });
      return false;
    }

    if (!serviceRef.current) {
      serviceRef.current = new OpenRouterService(apiKey, model);
    }

    setConnectionStatus('connecting');
    
    try {
      const result = await serviceRef.current.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        
        // Fetch available models
        const models = await serviceRef.current.listAvailableModels();
        if (models.length > 0) {
          setAvailableModels([...FREE_MODELS, ...models]);
        }
        
        return true;
      } else {
        setConnectionStatus('error');
        toast({
          title: "Erreur de connexion",
          description: result.error || "Impossible de se connecter à OpenRouter",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à OpenRouter",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  const updateModel = (newModel: string) => {
    setModel(newModel);
  };

  return {
    apiKey,
    model,
    connectionStatus,
    availableModels,
    service: serviceRef.current,
    updateApiKey,
    updateModel,
    checkConnection
  };
};

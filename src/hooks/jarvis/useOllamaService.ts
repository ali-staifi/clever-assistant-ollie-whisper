
import { useRef, useState, useEffect } from 'react';
import { OllamaService } from '@/services/OllamaService';
import { OllamaStatus } from './types';
import { useToast } from '@/hooks/use-toast';

export const useOllamaService = (
  initialUrl = 'http://localhost:11434',
  initialModel = 'llama3'
) => {
  const [ollamaUrl, setOllamaUrl] = useState(initialUrl);
  const [ollamaModel, setOllamaModel] = useState(initialModel);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const ollamaService = useRef(new OllamaService(ollamaUrl, ollamaModel)).current;
  const { toast } = useToast();
  
  // Check Ollama connection when URL/model changes
  useEffect(() => {
    checkOllamaConnection();
  }, [ollamaUrl, ollamaModel]);

  const checkOllamaConnection = async () => {
    setOllamaStatus('connecting');
    try {
      // Simple test request
      const response = await fetch(`${ollamaUrl}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract available model names
      if (data && data.models) {
        const modelNames = data.models.map((model: any) => model.name);
        setAvailableModels(modelNames);
        
        // Check if currently selected model exists
        if (!modelNames.includes(ollamaModel)) {
          toast({
            title: "Model Not Available",
            description: `Model "${ollamaModel}" is not available on your Ollama instance. Using default model instead.`,
            variant: "warning",
          });
        }
      }
      
      setOllamaStatus('connected');
      return true;
    } catch (error) {
      console.error('Error connecting to Ollama:', error);
      setOllamaStatus('error');
      toast({
        title: "Connection Error",
        description: `Cannot connect to Ollama at ${ollamaUrl}. Please check if Ollama is running.`,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleOllamaUrlChange = (url: string) => {
    setOllamaUrl(url);
    ollamaService.setBaseUrl(url);
  };

  const handleOllamaModelChange = (model: string) => {
    setOllamaModel(model);
    ollamaService.setModel(model);
  };

  return {
    ollamaUrl,
    ollamaModel,
    ollamaStatus,
    availableModels,
    ollamaService,
    handleOllamaUrlChange,
    handleOllamaModelChange,
    checkOllamaConnection,
  };
};

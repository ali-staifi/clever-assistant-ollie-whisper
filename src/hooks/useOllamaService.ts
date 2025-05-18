
import { useState, useEffect, useRef } from 'react';
import { OllamaService } from '@/services/ollama/OllamaService';
import { OllamaStatus } from './jarvis/types';
import { useToast } from '@/hooks/use-toast';

// Get stored settings from localStorage or use defaults
const getStoredSettings = () => {
  try {
    const savedSettings = localStorage.getItem('ollama-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        url: parsed.url || 'http://localhost:11434',
        model: parsed.model || 'gemma:7b'
      };
    }
  } catch (e) {
    console.error('Failed to parse saved settings:', e);
  }
  
  return {
    url: 'http://localhost:11434',
    model: 'gemma:7b'
  };
};

export const useOllamaService = () => {
  // Get initial values from localStorage
  const storedSettings = getStoredSettings();
  
  const [ollamaUrl, setOllamaUrl] = useState(storedSettings.url);
  const [ollamaModel, setOllamaModel] = useState(storedSettings.model);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const ollamaService = useRef(new OllamaService(ollamaUrl, ollamaModel)).current;
  const { toast } = useToast();
  
  // Check Ollama connection when URL/model changes
  useEffect(() => {
    checkOllamaConnection();
    
    // Also save to localStorage when settings change
    localStorage.setItem('ollama-settings', JSON.stringify({
      url: ollamaUrl,
      model: ollamaModel
    }));
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
            title: "Modèle non disponible",
            description: `Le modèle "${ollamaModel}" n'est pas disponible sur votre instance Ollama. Utilisation du modèle par défaut à la place.`,
            variant: "default",
          });
        }
      }
      
      setOllamaStatus('connected');
      return true;
    } catch (error) {
      console.error('Error connecting to Ollama:', error);
      setOllamaStatus('error');
      toast({
        title: "Erreur de connexion",
        description: `Impossible de se connecter à Ollama à l'adresse ${ollamaUrl}. Veuillez vérifier que Ollama est en cours d'exécution.`,
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

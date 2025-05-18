
import { useState, useRef, useEffect } from 'react';
import { ChatOllamaService } from '@/services/ollama/ChatOllamaService';
import { useToast } from '@/hooks/use-toast';

export type OllamaConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export const useOllamaConnection = (
  initialUrl = 'http://localhost:11434',
  initialModel = 'gemma:7b'
) => {
  const [ollamaUrl, setOllamaUrl] = useState<string>(initialUrl);
  const [ollamaModel, setOllamaModel] = useState<string>(initialModel);
  const [connectionStatus, setConnectionStatus] = useState<OllamaConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  const ollamaServiceRef = useRef<ChatOllamaService | null>(null);
  const { toast } = useToast();
  
  // Initialize the service
  useEffect(() => {
    ollamaServiceRef.current = new ChatOllamaService(ollamaUrl, ollamaModel);
    return () => {
      // Abort any pending requests when unmounting
      ollamaServiceRef.current?.abortRequest();
    };
  }, []);

  // Check connection when URL changes
  useEffect(() => {
    if (ollamaServiceRef.current) {
      ollamaServiceRef.current.setBaseUrl(ollamaUrl);
      checkConnection();
    }
  }, [ollamaUrl]);

  // Update model when changed
  useEffect(() => {
    if (ollamaServiceRef.current) {
      ollamaServiceRef.current.setModel(ollamaModel);
    }
  }, [ollamaModel]);

  const checkConnection = async () => {
    if (!ollamaServiceRef.current) return false;
    
    setConnectionStatus('connecting');
    try {
      const result = await ollamaServiceRef.current.testConnection();
      if (result.success) {
        setConnectionStatus('connected');
        // Also fetch available models
        const models = await ollamaServiceRef.current.listAvailableModels();
        setAvailableModels(models);
        return true;
      } else {
        setConnectionStatus('error');
        toast({
          title: "Erreur de connexion",
          description: result.error || "Impossible de se connecter au serveur Ollama",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur Ollama",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    ollamaService: ollamaServiceRef.current,
    setOllamaUrl,
    setOllamaModel,
    checkConnection
  };
};

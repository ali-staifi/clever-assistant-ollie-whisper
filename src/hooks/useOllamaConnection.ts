
import { useState, useRef, useEffect } from 'react';
import { ChatOllamaService } from '@/services/ollama/ChatOllamaService';
import { useToast } from '@/hooks/use-toast';
import { usePersistentSettings } from './usePersistentSettings';

export type OllamaConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export const useOllamaConnection = (
  initialUrl = 'http://localhost:11434',
  initialModel = 'gemma:latest'
) => {
  const {
    ollamaUrl,
    ollamaModel,
    updateOllamaUrl,
    updateOllamaModel
  } = usePersistentSettings(initialUrl, initialModel);
  
  const [connectionStatus, setConnectionStatus] = useState<OllamaConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  const ollamaServiceRef = useRef<ChatOllamaService | null>(null);
  const { toast } = useToast();
  
  // Initialize the service
  useEffect(() => {
    ollamaServiceRef.current = new ChatOllamaService(ollamaUrl, ollamaModel);
    
    // Set default advanced parameters
    if (ollamaServiceRef.current) {
      ollamaServiceRef.current.setOptions({
        temperature: 0.7,
        numPredict: 256,
        topK: 40,
        topP: 0.9
      });
    }
    
    return () => {
      // Abort any pending requests when unmounting
      ollamaServiceRef.current?.abortRequest();
    };
  }, [ollamaUrl, ollamaModel]); // Ajout des dépendances pour réinitialiser le service lorsque les paramètres changent

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
    
    console.log("Checking connection to Ollama server...");
    setConnectionStatus('connecting');
    
    try {
      const result = await ollamaServiceRef.current.testConnection();
      console.log("Connection test result:", result);
      
      if (result.success) {
        setConnectionStatus('connected');
        
        // Also fetch available models
        console.log("Fetching available models...");
        const models = await ollamaServiceRef.current.listAvailableModels();
        console.log("Available models:", models);
        
        if (models.length === 0) {
          toast({
            title: "Aucun modèle trouvé",
            description: "Aucun modèle n'a été trouvé sur votre serveur Ollama. Assurez-vous d'en installer avec 'ollama pull nom_du_modèle'",
            variant: "default",
          });
        } else {
          setAvailableModels(models);
        }
        
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
      console.error("Error connecting to Ollama:", error);
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
    setOllamaUrl: updateOllamaUrl,
    setOllamaModel: updateOllamaModel,
    checkConnection
  };
};

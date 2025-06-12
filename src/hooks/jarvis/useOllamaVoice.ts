
import { useState, useRef } from 'react';
import { OllamaVoiceService, OllamaVoiceRequest, OllamaVoiceResponse } from '@/services/voice/OllamaVoiceService';
import { FastSpeech2Params } from '@/services/speech/FastSpeech2Service';
import { useToast } from '@/hooks/use-toast';

export const useOllamaVoice = (initialUrl?: string, initialModel?: string) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [currentModel, setCurrentModel] = useState(initialModel || 'llama3.2');
  const [ollamaUrl, setOllamaUrl] = useState(initialUrl || 'http://localhost:11434');
  const { toast } = useToast();

  const serviceRef = useRef(new OllamaVoiceService(ollamaUrl, currentModel));

  // Tester la connexion
  const testConnection = async (): Promise<boolean> => {
    try {
      const connected = await serviceRef.current.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        // Charger les modèles disponibles
        const models = await serviceRef.current.getAvailableModels();
        setAvailableModels(models);
        
        toast({
          title: "Connexion Ollama réussie",
          description: `${models.length} modèle(s) disponible(s)`,
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter à Ollama",
          variant: "destructive",
        });
      }
      
      return connected;
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Erreur Ollama",
        description: "Échec de la connexion au serveur",
        variant: "destructive",
      });
      return false;
    }
  };

  // Changer l'URL d'Ollama
  const updateOllamaUrl = (newUrl: string) => {
    setOllamaUrl(newUrl);
    serviceRef.current.setBaseUrl(newUrl);
    setIsConnected(null); // Reset connection status
  };

  // Changer le modèle
  const updateModel = (newModel: string) => {
    setCurrentModel(newModel);
    serviceRef.current.setModel(newModel);
  };

  // Générer une réponse avec paramètres vocaux
  const generateVoiceResponse = async (
    prompt: string,
    voiceParams: FastSpeech2Params,
    context?: string
  ): Promise<OllamaVoiceResponse | null> => {
    if (!isConnected) {
      toast({
        title: "Pas de connexion",
        description: "Veuillez d'abord vous connecter à Ollama",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      const request: OllamaVoiceRequest = {
        prompt,
        voiceParams,
        context
      };

      const response = await serviceRef.current.generateVoiceResponse(request);
      
      toast({
        title: "Réponse générée",
        description: response.emotionalContext,
      });

      return response;
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la réponse",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Générer un test de voix personnalisé
  const generateVoiceTest = async (voiceParams: FastSpeech2Params): Promise<string | null> => {
    const testPrompts = {
      happy: "Dis-moi quelque chose de joyeux et motivant pour tester ma voix heureuse",
      sad: "Exprime de la compassion et de la compréhension pour tester ma voix triste",
      angry: "Exprime de la détermination et de la fermeté pour tester ma voix en colère",
      surprised: "Exprime de l'étonnement et de la curiosité pour tester ma voix surprise",
      neutral: "Présente-toi de manière professionnelle pour tester ma voix neutre"
    };

    const response = await generateVoiceResponse(
      testPrompts[voiceParams.emotion],
      voiceParams,
      "Test des paramètres vocaux avancés"
    );

    return response?.text || null;
  };

  return {
    isConnected,
    isGenerating,
    availableModels,
    currentModel,
    ollamaUrl,
    testConnection,
    updateOllamaUrl,
    updateModel,
    generateVoiceResponse,
    generateVoiceTest,
    ollamaVoiceService: serviceRef.current
  };
};

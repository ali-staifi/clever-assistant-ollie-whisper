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

  // Générer une réponse avec paramètres vocaux et genre
  const generateVoiceResponse = async (
    prompt: string,
    voiceParams: FastSpeech2Params,
    context?: string,
    voiceGender?: 'male' | 'female'
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
        context,
        voiceGender
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

  // Générer un test de voix personnalisé avec genre
  const generateVoiceTest = async (
    voiceParams: FastSpeech2Params, 
    voiceGender: 'male' | 'female' = 'female'
  ): Promise<string | null> => {
    const testPrompts = {
      happy: voiceGender === 'female' 
        ? "Dis-moi quelque chose de joyeux et motivant avec une voix féminine chaleureuse"
        : "Dis-moi quelque chose de motivant et confiant avec une voix masculine énergique",
      sad: voiceGender === 'female'
        ? "Exprime de la compassion avec une voix féminine douce et empathique"
        : "Exprime de la compréhension avec une voix masculine rassurante",
      angry: voiceGender === 'female'
        ? "Exprime de la détermination avec une voix féminine ferme mais contrôlée"
        : "Exprime de la fermeté avec une voix masculine autoritaire",
      surprised: voiceGender === 'female'
        ? "Exprime de l'étonnement avec une voix féminine curieuse et expressive"
        : "Exprime de la surprise avec une voix masculine intriguée",
      neutral: voiceGender === 'female'
        ? "Présente-toi de manière professionnelle avec une voix féminine posée"
        : "Présente-toi de manière professionnelle avec une voix masculine assurée"
    };

    const response = await generateVoiceResponse(
      testPrompts[voiceParams.emotion],
      voiceParams,
      "Test des paramètres vocaux avec genre spécifique",
      voiceGender
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

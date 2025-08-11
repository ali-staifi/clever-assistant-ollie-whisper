
import { useState, useCallback } from 'react';
import { useOllamaConnection } from './useOllamaConnection';
import { useSpeechSynthesis } from './jarvis/useSpeechSynthesis';
import { useToast } from './use-toast';

export const useAlexAvatar = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);
  
  const { 
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    ollamaService,
    setOllamaUrl,
    setOllamaModel,
    checkConnection 
  } = useOllamaConnection();
  
  const { speak, stopSpeaking } = useSpeechSynthesis();
  const { toast } = useToast();

  const handleUserInput = useCallback(async (userMessage: string) => {
    if (!ollamaService) {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer Ollama (URL et modèle) puis tester la connexion.",
        variant: "destructive",
      });
      return;
    }

    if (connectionStatus !== 'connected') {
      const connected = await checkConnection();
      if (!connected) return;
    }

    try {
      // Ajouter le message utilisateur à la conversation
      setConversation(prev => [...prev, { role: 'user', content: userMessage }]);

      // Génération en streaming
      let accumulated = '';
      setCurrentSpeakingText('');
      setIsSpeaking(true);

      await ollamaService.generateResponse(
        userMessage,
        conversation.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
        (token: string) => {
          accumulated += token;
          setCurrentSpeakingText(prev => prev + token);
        }
      );

      // Ajouter la réponse complète de l'assistant
      setConversation(prev => [...prev, { role: 'assistant', content: accumulated }]);

      try {
        await speak(accumulated);
      } finally {
        setIsSpeaking(false);
        setCurrentSpeakingText('');
      }

    } catch (error) {
      setIsSpeaking(false);
      setCurrentSpeakingText('');
      toast({
        title: "Erreur",
        description: "Impossible de générer une réponse",
        variant: "destructive",
      });
      console.error('Error generating response:', error);
    }
  }, [ollamaService, connectionStatus, conversation, checkConnection, speak, toast]);

  const clearConversation = useCallback(() => {
    setConversation([]);
    stopSpeaking();
    setIsSpeaking(false);
    setCurrentSpeakingText('');
  }, [stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    currentSpeakingText,
    conversation,
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    updateOllamaUrl: setOllamaUrl,
    updateOllamaModel: setOllamaModel,
    checkConnection,
    handleUserInput,
    clearConversation,
    setIsListening
  };
};

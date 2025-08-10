
import { useState, useCallback } from 'react';
import { useOpenRouter } from './useOpenRouter';
import { useSpeechSynthesis } from './jarvis/useSpeechSynthesis';
import { useToast } from './use-toast';

export const useAlexAvatar = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);
  
  const { 
    apiKey, 
    model, 
    connectionStatus, 
    availableModels, 
    service,
    updateApiKey,
    updateModel,
    checkConnection 
  } = useOpenRouter();
  
  const { speak, stopSpeaking } = useSpeechSynthesis();
  const { toast } = useToast();

  const handleUserInput = useCallback(async (userMessage: string) => {
    if (!service || !apiKey) {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer votre clé API OpenRouter",
        variant: "destructive",
      });
      return;
    }

    if (connectionStatus !== 'connected') {
      const connected = await checkConnection();
      if (!connected) return;
    }

    try {
      // Add user message to conversation
      setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
      
      // Generate response
      const response = await service.generateResponse(
        userMessage,
        conversation.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))
      );

      // Add assistant response to conversation
      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
      
      // Speak the response
      setCurrentSpeakingText(response);
      setIsSpeaking(true);
      
      await speak(response);
      setIsSpeaking(false);
      setCurrentSpeakingText('');
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer une réponse",
        variant: "destructive",
      });
      console.error('Error generating response:', error);
    }
  }, [service, apiKey, connectionStatus, conversation, checkConnection, speak, toast]);

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
    apiKey,
    model,
    connectionStatus,
    availableModels,
    updateApiKey,
    updateModel,
    checkConnection,
    handleUserInput,
    clearConversation,
    setIsListening
  };
};

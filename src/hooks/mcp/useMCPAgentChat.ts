
import { useState } from 'react';
import { MCPAgentChatService, ChatMessage, OllamaConnectionStatus } from '../../services/mcp/agent/MCPAgentChatService';
import { useJarvisServices } from '../useJarvisServices';

export const useMCPAgentChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Agent IA MCP initialisé. Prêt à analyser et optimiser votre système.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatService] = useState(() => new MCPAgentChatService());
  
  const { 
    speechService, 
    globalVoiceSettings,
    isSpeaking,
    toggleSpeaking 
  } = useJarvisServices();

  const sendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      await chatService.processMessage(
        userMessage.content,
        messages,
        (token) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        }
      );

      // Synthèse vocale automatique avec le contenu final
      setTimeout(() => {
        setMessages(prev => {
          const finalAssistantMessage = prev.find(msg => msg.id === assistantMessage.id);
          if (speechService && finalAssistantMessage?.content && finalAssistantMessage.content.trim()) {
            console.log('Déclenchement synthèse vocale MCP:', finalAssistantMessage.content.substring(0, 50) + '...');
            speechService.speak(finalAssistantMessage.content);
          }
          return prev;
        });
      }, 500);

    } catch (error) {
      console.error('Erreur envoi message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Système MCP en cours de récupération...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Ollama management functions
  const handleOllamaUrlChange = (url: string) => {
    chatService.setOllamaUrl(url);
  };

  const handleOllamaModelChange = (model: string) => {
    chatService.setOllamaModel(model);
  };

  const checkOllamaConnection = async () => {
    return await chatService.checkConnection();
  };

  return {
    messages,
    currentMessage,
    setCurrentMessage,
    isProcessing,
    sendMessage,
    speechService,
    globalVoiceSettings,
    isSpeaking,
    toggleSpeaking,
    // Ollama settings
    ollamaUrl: chatService.getOllamaUrl(),
    ollamaModel: chatService.getOllamaModel(),
    connectionStatus: chatService.getConnectionStatus(),
    availableModels: chatService.getAvailableModels(),
    handleOllamaUrlChange,
    handleOllamaModelChange,
    checkOllamaConnection,
  };
};


import { useState, useRef } from 'react';
import { useOpenRouter } from './useOpenRouter';
import { OpenRouterMessage } from '@/services/openrouter/OpenRouterService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useChatOpenRouter = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');
  
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

  const sendMessage = async (content: string) => {
    if (!service || !apiKey) {
      await checkConnection();
      return;
    }

    if (connectionStatus !== 'connected') {
      const connected = await checkConnection();
      if (!connected) return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setPartialResponse('');

    try {
      const openRouterMessages: OpenRouterMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await service.generateResponse(
        content,
        openRouterMessages,
        (partial) => {
          setPartialResponse(partial);
        }
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsGenerating(false);
      setPartialResponse('');
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setPartialResponse('');
  };

  return {
    apiKey,
    model,
    connectionStatus,
    availableModels,
    messages,
    isGenerating,
    partialResponse,
    updateApiKey,
    updateModel,
    checkConnection,
    sendMessage,
    clearMessages
  };
};

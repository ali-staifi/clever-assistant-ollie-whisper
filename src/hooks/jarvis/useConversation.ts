
import { useState } from 'react';
import { Message } from '@/services/OllamaService';

export const useConversation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addUserMessage = (content: string) => {
    const userMessage = { role: 'user' as const, content };
    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  };

  const addAssistantMessage = (content: string) => {
    const assistantMessage = { role: 'assistant' as const, content };
    setMessages(prev => [...prev, assistantMessage]);
    return assistantMessage;
  };

  const clearConversation = () => {
    setMessages([]);
    setResponse('');
  };

  return {
    messages,
    response,
    setResponse,
    isProcessing,
    setIsProcessing,
    addUserMessage,
    addAssistantMessage,
    clearConversation
  };
};

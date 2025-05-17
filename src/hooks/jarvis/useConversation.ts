import { useState } from 'react';
import { Message } from '@/services/ollama/types';

export const useConversation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [response, setResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addUserMessage = (content: string) => {
    const userMessage = { role: 'user' as const, content };
    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  };

  const addAssistantMessage = (content: string) => {
    // Sanitize the content to remove undefined values
    const sanitizedContent = typeof content === 'string' 
      ? content.replace(/undefined/g, '').trim() 
      : 'Sorry, I encountered an error processing your request.';
      
    const assistantMessage = { role: 'assistant' as const, content: sanitizedContent };
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
    setResponse: (text: string) => {
      // Sanitize the response before setting it
      const sanitized = typeof text === 'string' 
        ? text.replace(/undefined/g, '').trim() 
        : 'Processing...';
      setResponse(sanitized);
    },
    isProcessing,
    setIsProcessing,
    addUserMessage,
    addAssistantMessage,
    clearConversation
  };
};

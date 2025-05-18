
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/services/ollama/types';
import { useToast } from '@/hooks/use-toast';
import { ChatOllamaService } from '@/services/ollama/ChatOllamaService';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  pending?: boolean;
}

export const useChatMessages = (ollamaService: ChatOllamaService | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');
  const { toast } = useToast();

  const sendMessage = async (content: string, connectionStatus: 'idle' | 'connecting' | 'connected' | 'error', checkConnection: () => Promise<boolean>) => {
    if (!content.trim() || !ollamaService) return;
    
    // Check connection first
    if (connectionStatus !== 'connected') {
      console.log("Connection not established, checking...");
      const connected = await checkConnection();
      if (!connected) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter au serveur Ollama d'abord",
          variant: "destructive",
        });
        return;
      }
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Create assistant message placeholder
    const assistantMessageId = uuidv4();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      pending: true
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsGenerating(true);
    setPartialResponse('');
    
    try {
      // Convert to Ollama message format
      const ollamaMessages: Message[] = messages
        .filter(msg => !msg.pending)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));
      
      // Add the new user message
      ollamaMessages.push({
        role: 'user',
        content
      });
      
      console.log("Sending messages to Ollama:", JSON.stringify(ollamaMessages, null, 2));
      
      // Generate response with streaming updates
      let finalResponse = '';
      await ollamaService.generateChatResponse(
        content,
        ollamaMessages,
        (progressText) => {
          setPartialResponse(progressText);
          finalResponse = progressText;
          
          // Update the assistant message with current progress
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: progressText, pending: true } 
              : msg
          ));
        }
      );
      
      console.log("Completed response generation, final response length:", finalResponse.length);
      
      // Final update to remove pending state
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: finalResponse || "Je suis désolé, je n'ai pas pu générer de réponse.", pending: false } 
          : msg
      ));
      
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = error instanceof Error ? error.message : "Échec de la génération de la réponse";
      
      // Update assistant message with error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: `Erreur: ${errorMessage}`, pending: false } 
          : msg
      ));
      
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setPartialResponse('');
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isGenerating,
    partialResponse,
    sendMessage,
    clearMessages
  };
};

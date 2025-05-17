
import { useState, useRef, useEffect } from 'react';
import { ChatOllamaService } from '@/services/ollama/ChatOllamaService';
import { Message } from '@/services/OllamaService';
import { useToast } from '@/hooks/use-toast';

export type OllamaConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  pending?: boolean;
}

export const useChatOllama = (
  initialUrl = 'http://localhost:11434',
  initialModel = 'llama3'
) => {
  const [ollamaUrl, setOllamaUrl] = useState<string>(initialUrl);
  const [ollamaModel, setOllamaModel] = useState<string>(initialModel);
  const [connectionStatus, setConnectionStatus] = useState<OllamaConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');
  
  const ollamaService = useRef(new ChatOllamaService(ollamaUrl, ollamaModel)).current;
  const { toast } = useToast();

  // Check connection when URL or model changes
  useEffect(() => {
    ollamaService.setBaseUrl(ollamaUrl);
    checkConnection();
  }, [ollamaUrl]);

  // Update model when changed
  useEffect(() => {
    ollamaService.setModel(ollamaModel);
  }, [ollamaModel]);

  const checkConnection = async () => {
    setConnectionStatus('connecting');
    try {
      const result = await ollamaService.testConnection();
      if (result.success) {
        setConnectionStatus('connected');
        // Also fetch available models
        const models = await ollamaService.listAvailableModels();
        setAvailableModels(models);
        return true;
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Error",
          description: result.error || "Failed to connect to Ollama server",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Error",
        description: "Failed to connect to Ollama server",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Check connection first
    if (connectionStatus !== 'connected') {
      const connected = await checkConnection();
      if (!connected) {
        toast({
          title: "Connection Required",
          description: "Please connect to Ollama server first",
          variant: "destructive",
        });
        return;
      }
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
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
      
      // Generate response with streaming updates
      await ollamaService.generateChatResponse(
        content,
        ollamaMessages,
        (progressText) => {
          setPartialResponse(progressText);
          
          // Update the assistant message with current progress
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: progressText, pending: true } 
              : msg
          ));
        }
      );
      
      // Final update to remove pending state
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: partialResponse || "I'm sorry, I couldn't generate a response.", pending: false } 
          : msg
      ));
      
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
      
      // Update assistant message with error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: `Error: ${errorMessage}`, pending: false } 
          : msg
      ));
      
      toast({
        title: "Generation Error",
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
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    messages,
    isGenerating,
    partialResponse,
    setOllamaUrl,
    setOllamaModel,
    checkConnection,
    sendMessage,
    clearMessages
  };
};

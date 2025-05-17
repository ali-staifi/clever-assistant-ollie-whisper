
import { useState, useRef, useEffect } from 'react';
import { OllamaService, Message } from '@/services/OllamaService';
import { SpeechService } from '@/services/SpeechService';
import { useToast } from '@/hooks/use-toast';

export const useJarvisServices = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const ollamaService = useRef(new OllamaService(ollamaUrl, ollamaModel)).current;
  const speechService = useRef(new SpeechService()).current;
  const { toast } = useToast();
  
  // Check Ollama connection on startup and when URL/model changes
  useEffect(() => {
    checkOllamaConnection();
  }, [ollamaUrl, ollamaModel]);

  const checkOllamaConnection = async () => {
    setOllamaStatus('connecting');
    try {
      // Simple test request
      await fetch(`${ollamaUrl}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => {
        if (!res.ok) {
          throw new Error(`Status: ${res.status}`);
        }
        return res.json();
      });
      
      setOllamaStatus('connected');
      setErrorMessage('');
    } catch (error) {
      console.error('Error connecting to Ollama:', error);
      setOllamaStatus('error');
      setErrorMessage(`Cannot connect to Ollama at ${ollamaUrl}. Please check the URL and make sure Ollama is running.`);
      toast({
        title: "Connection Error",
        description: `Cannot connect to Ollama at ${ollamaUrl}. Please check if Ollama is running.`,
        variant: "destructive",
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }
    
    // Check for connection before starting listening
    if (ollamaStatus === 'error') {
      toast({
        title: "Connection Error",
        description: "Cannot connect to Ollama. Please check settings and try again.",
        variant: "destructive",
      });
      return;
    }
    
    const success = speechService.startListening(
      (interimText) => {
        setTranscript(interimText);
      },
      async (finalText) => {
        setIsListening(false);
        setTranscript(finalText);
        
        // Add user message to chat
        const userMessage = { role: 'user' as const, content: finalText };
        setMessages(prev => [...prev, userMessage]);
        
        // Process with Ollama
        await processOllamaResponse(finalText);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: error,
          variant: "destructive",
        });
      }
    );
    
    if (success) {
      setIsListening(true);
    } else {
      toast({
        title: "Microphone Error",
        description: "Could not access the microphone. Please check your browser permissions.",
        variant: "destructive",
      });
    }
  };
  
  const processOllamaResponse = async (text: string) => {
    setIsProcessing(true);
    setResponse('');
    
    try {
      await ollamaService.generateResponse(
        text,
        messages,
        (progressText) => {
          setResponse(progressText);
        }
      );
      
      // Save assistant response to messages
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      setIsSpeaking(true);
      speechService.speak(response, () => {
        setIsSpeaking(false);
      });
    } catch (error) {
      console.error('Error processing with Ollama:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setResponse(`Sorry, I encountered an error while processing your request: ${errorMsg}`);
      
      toast({
        title: "Processing Error",
        description: "An error occurred while processing with Ollama.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOllamaUrlChange = (url: string) => {
    setOllamaUrl(url);
    ollamaService.setBaseUrl(url);
  };

  const handleOllamaModelChange = (model: string) => {
    setOllamaModel(model);
    ollamaService.setModel(model);
  };

  const clearConversation = () => {
    setMessages([]);
    setTranscript('');
    setResponse('');
  };
  
  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    showSettings,
    setShowSettings,
    messages,
    ollamaUrl,
    ollamaModel,
    ollamaStatus,
    errorMessage,
    toggleListening,
    toggleSpeaking,
    handleOllamaUrlChange,
    handleOllamaModelChange,
    clearConversation,
    checkOllamaConnection,
  };
};

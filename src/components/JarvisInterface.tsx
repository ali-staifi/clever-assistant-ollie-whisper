import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Settings, Volume, VolumeX } from 'lucide-react';
import { OllamaService, Message } from '@/services/OllamaService';
import { SpeechService } from '@/services/SpeechService';
import AudioVisualizer from './AudioVisualizer';
import SettingsPanel from './SettingsPanel';
import { useToast } from "@/components/ui/use-toast";

const JarvisInterface = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Check Ollama connection on startup and when URL/model changes
  useEffect(() => {
    checkOllamaConnection();
  }, [ollamaUrl, ollamaModel]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="flex flex-col h-screen bg-jarvis-darkBlue text-white p-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-jarvis-blue text-shadow-glow">J.A.R.V.I.S</h1>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${
            ollamaStatus === 'connected' ? 'bg-green-500' : 
            ollamaStatus === 'connecting' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-400">
            {ollamaStatus === 'connected' ? 'Ollama connected' : 
             ollamaStatus === 'connecting' ? 'Connecting...' : 
             'Ollama offline'}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSettings(!showSettings)}
            className="text-jarvis-blue hover:bg-jarvis-darkBlue/30"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-sm">
          <p className="font-bold">Error:</p>
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          ollamaUrl={ollamaUrl}
          ollamaModel={ollamaModel}
          onOllamaUrlChange={handleOllamaUrlChange}
          onOllamaModelChange={handleOllamaModelChange}
          onClearConversation={clearConversation}
          onClose={() => setShowSettings(false)}
          checkConnection={checkOllamaConnection}
          ollamaStatus={ollamaStatus}
        />
      )}
      
      {/* Main Interface */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Visualizer Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Pulse Ring */}
            <div className={`absolute inset-0 rounded-full border-2 border-jarvis-blue/30 animate-pulse-ring ${isListening || isProcessing || isSpeaking ? 'opacity-100' : 'opacity-0'}`}></div>
            
            {/* Rotating Ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[110%] h-[110%] border border-jarvis-blue/20 rounded-full animate-rotate-circle"></div>
              <div className="absolute w-[95%] h-[95%] border border-jarvis-blue/30 rounded-full animate-rotate-circle-slow"></div>
            </div>
            
            {/* Core Visualizer */}
            <div className="absolute inset-0">
              <AudioVisualizer 
                isListening={isListening} 
                isPulsing={isProcessing || isSpeaking} 
              />
            </div>
            
            {/* Control Buttons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-4">
                {/* Mic Button */}
                <Button 
                  className={`rounded-full w-16 h-16 transition-all ${
                    isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-jarvis-blue hover:bg-jarvis-blue/80'
                  }`}
                  onClick={toggleListening}
                  disabled={isProcessing || ollamaStatus === 'error'}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
                
                {/* Speaker Button - Only visible when speaking */}
                {isSpeaking && (
                  <Button 
                    className="rounded-full w-12 h-12 bg-jarvis-blue hover:bg-jarvis-blue/80 ml-2"
                    onClick={toggleSpeaking}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-6 w-6" />
                    ) : (
                      <Volume className="h-6 w-6" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Status Text */}
            <div className="absolute -bottom-10 left-0 right-0 text-center text-sm text-jarvis-blue">
              {isListening ? 'Listening...' : 
               isProcessing ? 'Processing...' : 
               isSpeaking ? 'Speaking...' : 
               'Ready'}
            </div>
          </div>
        </div>
        
        {/* Conversation Section */}
        <div className="flex-1 bg-jarvis-darkBlue/50 rounded-lg p-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                <p>Say "Hello" to start a conversation</p>
                <p className="mt-2 text-sm">Make sure Ollama is running at {ollamaUrl}</p>
                <p className="mt-1 text-sm">Using model: {ollamaModel}</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg max-w-[85%] animate-fade-in ${
                  msg.role === 'user' 
                    ? 'bg-jarvis-blue/30 ml-auto' 
                    : 'bg-muted text-white/90 mr-auto'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {msg.role === 'user' ? 'You' : 'J.A.R.V.I.S'}
                </div>
                <div className="whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Current processing message */}
            {isProcessing && response && (
              <div className="bg-muted text-white/90 p-3 rounded-lg max-w-[85%] mr-auto animate-fade-in">
                <div className="text-xs text-gray-400 mb-1">
                  J.A.R.V.I.S
                </div>
                <div className="whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}
            
            {/* Current transcript */}
            {isListening && transcript && (
              <div className="bg-jarvis-blue/30 p-3 rounded-lg max-w-[85%] ml-auto animate-fade-in">
                <div className="text-xs text-gray-400 mb-1">
                  You (listening...)
                </div>
                <div>{transcript}</div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JarvisInterface;

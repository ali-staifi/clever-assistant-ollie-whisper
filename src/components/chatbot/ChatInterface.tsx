
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Mic, MicOff, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useChatOllama } from '@/hooks/useChatOllama';
import OllamaConnectionSetup from './OllamaConnectionSetup';

interface FileAttachment {
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface MessageWithAttachment {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  attachment?: FileAttachment;
  pending?: boolean;
}

const ChatInterface = () => {
  const {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    messages: ollamaMessages,
    isGenerating,
    partialResponse,
    setOllamaUrl,
    setOllamaModel,
    checkConnection,
    sendMessage,
    clearMessages
  } = useChatOllama();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showConnectionSetup, setShowConnectionSetup] = useState(true); // Montrer par défaut
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Vérifier la connexion au chargement
  useEffect(() => {
    // Vérifier automatiquement la connexion au démarrage
    checkConnection();
  }, []);

  // Convert Ollama messages to UI messages with attachments
  const [localMessages, setLocalMessages] = useState<MessageWithAttachment[]>([]);

  // Update local messages when Ollama messages change
  useEffect(() => {
    // Preserve attachments when updating messages
    const updatedMessages = ollamaMessages.map(ollamaMsg => {
      // Find existing message with attachment if any
      const existingMsg = localMessages.find(m => m.id === ollamaMsg.id);
      
      return {
        ...ollamaMsg,
        attachment: existingMsg?.attachment,
      };
    });
    
    setLocalMessages(updatedMessages);
  }, [ollamaMessages]);

  // Handle voice input
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Reconnaissance vocale indisponible",
        description: "Votre navigateur ne prend pas en charge la reconnaissance vocale.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: "Erreur de reconnaissance vocale",
          description: "Un problème est survenu avec la reconnaissance vocale. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      setIsListening(true);
      
      toast({
        title: "Écoute en cours...",
        description: "Parlez maintenant, je vous écoute.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de la reconnaissance vocale:", error);
      toast({
        title: "Erreur de microphone",
        description: "Impossible d'accéder au microphone. Veuillez vérifier vos permissions.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const stopListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.stop();
    } catch (e) {
      console.error("Erreur lors de l'arrêt de la reconnaissance vocale:", e);
    }
    setIsListening(false);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Check file type
    const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    
    if (!fileType) {
      toast({
        title: "Fichier invalide",
        description: "Veuillez télécharger une image ou une vidéo.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    // Create object URL for preview
    const fileUrl = URL.createObjectURL(file);
    
    // Create a local message with attachment
    const localMsgWithAttachment: MessageWithAttachment = {
      id: Date.now().toString(),
      content: `Envoyé ${fileType}: ${file.name}`,
      role: 'user',
      attachment: {
        type: fileType as 'image' | 'video',
        url: fileUrl,
        name: file.name
      }
    };
    
    setLocalMessages((prev) => [...prev, localMsgWithAttachment]);
    
    // Send message to Ollama with file description
    sendMessage(`[Je vous ai envoyé un fichier ${fileType} nommé "${file.name}"]`);
    
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userInput = input;
    setInput('');
    
    // Send message to Ollama
    await sendMessage(userInput);
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, isGenerating]);

  return (
    <div className="flex flex-col h-full bg-jarvis-darkBlue/10 rounded-lg overflow-hidden">
      {/* Connection status and setup */}
      <div 
        className="flex items-center justify-between p-2 border-b cursor-pointer"
        onClick={() => setShowConnectionSetup(!showConnectionSetup)}
      >
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-amber-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {connectionStatus === 'connected' 
              ? `Connecté à Ollama (${ollamaModel})` 
              : connectionStatus === 'connecting' 
                ? 'Connexion à Ollama...' 
                : 'Non connecté à Ollama'}
          </span>
        </div>
        <Button variant="ghost" size="sm">
          {showConnectionSetup ? 'Cacher les paramètres' : 'Afficher les paramètres'}
        </Button>
      </div>

      {showConnectionSetup && (
        <OllamaConnectionSetup
          ollamaUrl={ollamaUrl}
          ollamaModel={ollamaModel}
          connectionStatus={connectionStatus}
          availableModels={availableModels}
          onOllamaUrlChange={setOllamaUrl}
          onOllamaModelChange={setOllamaModel}
          onCheckConnection={checkConnection}
          onClearChat={clearMessages}
        />
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {localMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400">
              <p className="text-lg mb-2">Bienvenue dans le chat</p>
              <p className="text-sm mb-4">Envoyez un message pour démarrer la conversation</p>
              {connectionStatus !== 'connected' && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowConnectionSetup(true);
                    checkConnection();
                  }}
                >
                  Connecter à Ollama
                </Button>
              )}
            </div>
          </div>
        )}

        {localMessages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-jarvis-blue text-white'
                  : 'bg-gray-700 text-white'
              } ${message.pending ? 'opacity-70' : ''}`}
            >
              {/* Message header */}
              <div className="text-sm mb-1 flex items-center justify-between">
                <span>{message.role === 'user' ? 'Vous' : 'Assistant'}</span>
                {message.pending && (
                  <span className="text-xs animate-pulse">Génération...</span>
                )}
              </div>
              
              {/* Message content */}
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Attachment preview */}
              {message.attachment && (
                <div className="mt-2">
                  {message.attachment.type === 'image' && (
                    <img 
                      src={message.attachment.url} 
                      alt={message.attachment.name} 
                      className="max-w-full rounded mt-2"
                    />
                  )}
                  {message.attachment.type === 'video' && (
                    <video 
                      src={message.attachment.url} 
                      controls 
                      className="max-w-full rounded mt-2"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          {/* File upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            disabled={isUploading || isGenerating}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Voice input button */}
          <Button
            onClick={toggleListening}
            variant="ghost"
            size="icon"
            className={isListening ? "text-red-500" : "text-gray-400 hover:text-white"}
            disabled={isGenerating}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Text input */}
          <div className="flex-1 mx-2">
            <Input
              placeholder="Tapez un message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="bg-gray-800 border-gray-700 text-white"
              disabled={isGenerating}
            />
          </div>

          {/* Send button */}
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isGenerating}
            variant="ghost"
            size="icon"
            className="text-jarvis-blue hover:text-jarvis-blue/80"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

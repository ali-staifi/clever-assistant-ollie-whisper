
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Mic, MicOff, Image, FileVideo, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'bot';
  attachment?: {
    type: 'image' | 'video';
    url: string;
    name: string;
  };
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle voice input
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition.",
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
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.stop();
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
        title: "Invalid File",
        description: "Please upload an image or video file.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    // Create object URL for preview
    const fileUrl = URL.createObjectURL(file);
    
    // Create new message with attachment
    const newMessage: Message = {
      id: Date.now().toString(),
      content: `Sent ${fileType}: ${file.name}`,
      role: 'user',
      attachment: {
        type: fileType as 'image' | 'video',
        url: fileUrl,
        name: file.name
      }
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I've received your ${fileType}. How can I help you with this?`,
        role: 'bot'
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsUploading(false);
    }, 1000);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user'
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${input}". How can I assist you further?`,
        role: 'bot'
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-jarvis-darkBlue/10 rounded-lg overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400">
              <p className="text-lg mb-2">Bienvenue dans le chat</p>
              <p className="text-sm">Envoyez un message pour démarrer la conversation</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
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
              }`}
            >
              {/* Message content */}
              <div className="text-sm mb-1">{message.role === 'user' ? 'Vous' : 'Bot'}</div>
              <div>{message.content}</div>
              
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
            disabled={isUploading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Voice input button */}
          <Button
            onClick={toggleListening}
            variant="ghost"
            size="icon"
            className={isListening ? "text-red-500" : "text-gray-400 hover:text-white"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Text input */}
          <div className="flex-1 mx-2">
            <Input
              placeholder="Tapez un message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Send button */}
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim()}
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

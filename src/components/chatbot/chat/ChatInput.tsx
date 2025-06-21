
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Mic, MicOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { SpeechService } from '@/services/SpeechService';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onFileUpload: (file: File) => void;
  isGenerating: boolean;
  speechService?: SpeechService;
  globalVoiceSettings?: {
    roboticEffect: number;
    rate: number;
    pitch: number;
    volume: number;
    voiceGender: 'male' | 'female' | 'neutral';
  };
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  isGenerating,
  speechService,
  globalVoiceSettings
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userInput = input;
    setInput('');
    
    // Send message
    await onSendMessage(userInput);
  };

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
      recognitionRef.current = recognition;
      
      // Utiliser les paramètres vocaux globaux pour la reconnaissance si disponibles
      recognition.lang = globalVoiceSettings?.voiceGender === 'male' ? 'fr-FR' : 
                        globalVoiceSettings?.voiceGender === 'female' ? 'fr-FR' : 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        
        // Si c'est un résultat final, envoyer automatiquement
        if (event.results[0].isFinal) {
          setTimeout(() => {
            if (transcript.trim()) {
              onSendMessage(transcript);
              setInput('');
            }
          }, 500);
        }
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
        recognitionRef.current = null;
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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleFileSelection = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <div className="flex items-center">
        {/* File upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileUpload(file);
          }}
          className="hidden"
          accept="image/*,video/*"
        />
        <Button
          onClick={handleFileSelection}
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          disabled={isGenerating}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Voice input button */}
        <Button
          onClick={toggleListening}
          variant="ghost"
          size="icon"
          className={isListening ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-white"}
          disabled={isGenerating}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        {/* Text input */}
        <div className="flex-1 mx-2">
          <Input
            placeholder={isListening ? "Je vous écoute..." : "Tapez un message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className="bg-gray-800 border-gray-700 text-white"
            disabled={isGenerating || isListening}
          />
        </div>

        {/* Send button */}
        <Button 
          onClick={handleSendMessage} 
          disabled={!input.trim() || isGenerating || isListening}
          variant="ghost"
          size="icon"
          className="text-jarvis-blue hover:text-jarvis-blue/80"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Status indicator */}
      {isListening && (
        <div className="mt-2 text-center">
          <span className="text-xs text-jarvis-blue animate-pulse">
            🎤 Reconnaissance vocale active - Parlez maintenant
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;

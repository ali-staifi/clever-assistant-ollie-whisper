
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { MCPAgentChatService, ChatMessage } from '../../../services/mcp/agent/MCPAgentChatService';
import { useJarvisServices } from '@/hooks/useJarvisServices';

export const MCPAgentChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Agent IA MCP initialisé. Prêt à analyser et optimiser votre système.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatService] = useState(() => new MCPAgentChatService());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { 
    speechService, 
    globalVoiceSettings,
    isSpeaking,
    toggleSpeaking 
  } = useJarvisServices();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      let assistantResponse = '';
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      await chatService.processMessage(
        userMessage.content,
        messages,
        (token) => {
          assistantResponse += token;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: assistantResponse }
                : msg
            )
          );
        }
      );

      // Synthèse vocale automatique avec paramètres globaux
      if (speechService && globalVoiceSettings && assistantResponse) {
        speechService.speak(assistantResponse);
      }

    } catch (error) {
      console.error('Erreur envoi message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Système MCP en cours de récupération...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'assistant':
        return <Brain className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const quickActions = [
    'Analyser la santé du système',
    'Optimiser les performances',
    'Vérifier les connexions',
    'Générer des recommandations'
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Chat Agent IA MCP
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSpeaking}
              className="flex items-center gap-1"
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isSpeaking ? 'Muet' : 'Audio'}
            </Button>
            <Badge variant="secondary" className="text-xs">
              {globalVoiceSettings ? 'Vocal Actif' : 'Vocal Off'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'system'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {getMessageIcon(message.type)}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 opacity-70`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
                    <span className="text-sm">Agent IA en train de réfléchir...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentMessage(action)}
                disabled={isProcessing}
              >
                {action}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Demandez à l'Agent IA d'analyser ou d'optimiser quelque chose..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isProcessing}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { OllamaConnectionStatus } from '@/hooks/useChatOllama';

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

interface ChatMessagesProps {
  messages: MessageWithAttachment[];
  connectionStatus: OllamaConnectionStatus;
  onShowConnectionSetup: () => void;
  onCheckConnection: () => Promise<boolean>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  connectionStatus, 
  onShowConnectionSetup,
  onCheckConnection
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-gray-400">
            <p className="text-lg mb-2">Bienvenue dans le chat</p>
            <p className="text-sm mb-4">Envoyez un message pour démarrer la conversation</p>
            {connectionStatus !== 'connected' && (
              <Button 
                variant="outline"
                onClick={() => {
                  onShowConnectionSetup();
                  onCheckConnection();
                }}
              >
                Connecter à Ollama
              </Button>
            )}
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
  );
};

export default ChatMessages;

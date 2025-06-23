
import React from 'react';
import { Brain } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../../../services/mcp/agent/MCPAgentChatService';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
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

  return (
    <div
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
  );
};

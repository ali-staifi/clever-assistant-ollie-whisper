
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';

interface ChatInputProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  onSendMessage: () => void;
  isProcessing: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  currentMessage,
  setCurrentMessage,
  onSendMessage,
  isProcessing
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
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
        onClick={onSendMessage}
        disabled={!currentMessage.trim() || isProcessing}
        size="sm"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Trash2 } from "lucide-react";
import type { ChatMessage } from '@/hooks/useChatOpenRouter';

interface OpenRouterChatProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  partialResponse: string;
  onSendMessage: (content: string) => Promise<void>;
  onClearMessages: () => void;
}

const OpenRouterChat: React.FC<OpenRouterChatProps> = ({
  messages,
  isGenerating,
  partialResponse,
  onSendMessage,
  onClearMessages,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    await onSendMessage(text);
    setInput('');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-jarvis-blue" />
          Conversation
        </h2>
        <Button variant="ghost" size="sm" onClick={onClearMessages} disabled={messages.length === 0 && !partialResponse}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {messages.length === 0 && !partialResponse ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Démarrez une conversation avec un modèle OpenRouter gratuit.</p>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div key={m.id} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-jarvis-blue text-white ml-8' : 'bg-muted mr-8'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {partialResponse && (
              <div className="p-3 rounded-lg bg-muted mr-8">
                <p className="text-sm whitespace-pre-wrap">{partialResponse}</p>
              </div>
            )}
            {isGenerating && !partialResponse && (
              <div className="p-3 rounded-lg bg-muted mr-8">
                <p className="text-sm">Le modèle réfléchit...</p>
              </div>
            )}
          </>
        )}
      </div>

      <Separator className="my-4" />

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          disabled={isGenerating}
        />
        <Button type="submit" className="w-full" disabled={!input.trim() || isGenerating}>
          {isGenerating ? 'Génération...' : 'Envoyer'}
        </Button>
      </form>
    </Card>
  );
};

export default OpenRouterChat;


import React from 'react';
import ChatInterface from "@/components/chatbot/ChatInterface";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";

const ChatPage = () => {
  return (
    <div className="flex flex-col h-screen p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chat Assistant</h1>
          <p className="text-muted-foreground">
            Discutez avec l'assistant et partagez des fichiers
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => {
            const event = new CustomEvent('toggle-jarvis-settings');
            document.dispatchEvent(event);
          }}
        >
          <ServerIcon className="h-4 w-4" />
          <span>Modèles Ollama</span>
        </Button>
      </div>
      
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;

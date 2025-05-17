
import React from 'react';
import ChatInterface from "@/components/chatbot/ChatInterface";

const ChatPage = () => {
  return (
    <div className="flex flex-col h-screen p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Chat Assistant</h1>
        <p className="text-muted-foreground">
          Discutez avec l'assistant et partagez des fichiers
        </p>
      </div>
      
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;

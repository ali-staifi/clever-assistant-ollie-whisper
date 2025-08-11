
import React from 'react';
import ChatInterface from '@/components/chatbot/ChatInterface';

const ChatPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-jarvis-blue">Chat IA</h1>
        <p className="text-muted-foreground">
          Chatbot intelligent alimenté par Ollama
        </p>
      </div>

      <ChatInterface />
    </div>
  );
};

export default ChatPage;

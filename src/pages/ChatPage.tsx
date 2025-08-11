
import React from 'react';
import { useChatOpenRouter } from '@/hooks/useChatOpenRouter';
import ChatInterface from '@/components/chatbot/ChatInterface';
import OpenRouterConnectionSetup from '@/components/chatbot/OpenRouterConnectionSetup';

const ChatPage = () => {
  const {
    apiKey,
    model,
    connectionStatus,
    availableModels,
    messages,
    isGenerating,
    partialResponse,
    updateApiKey,
    updateModel,
    checkConnection,
    sendMessage,
    clearMessages
  } = useChatOpenRouter();

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-jarvis-blue">Chat IA</h1>
        <p className="text-muted-foreground">
          Chatbot intelligent alimenté par OpenRouter et les modèles LLM gratuits
        </p>
      </div>

      <OpenRouterConnectionSetup
        apiKey={apiKey}
        model={model}
        connectionStatus={connectionStatus}
        availableModels={availableModels}
        onApiKeyChange={updateApiKey}
        onModelChange={updateModel}
        onCheckConnection={checkConnection}
        onClearChat={clearMessages}
      />

      {apiKey && connectionStatus === 'connected' && (
        <ChatInterface />
      )}
    </div>
  );
};

export default ChatPage;

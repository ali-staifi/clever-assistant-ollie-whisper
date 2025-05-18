
import { useEffect } from 'react';
import { useOllamaConnection } from './useOllamaConnection';
import { useChatMessages, ChatMessage } from './useChatMessages';

export type OllamaConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
export type { ChatMessage };

export const useChatOllama = (
  initialUrl = 'http://localhost:11434',
  initialModel = 'gemma:7b'
) => {
  // Utiliser le hook de connexion
  const {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    ollamaService,
    setOllamaUrl,
    setOllamaModel,
    checkConnection
  } = useOllamaConnection(initialUrl, initialModel);

  // Utiliser le hook de messages
  const {
    messages,
    isGenerating,
    partialResponse,
    sendMessage: sendMessageBase,
    clearMessages
  } = useChatMessages(ollamaService);

  // Wrapper pour la fonction sendMessage qui inclut les informations de connexion
  const sendMessage = async (content: string) => {
    await sendMessageBase(content, connectionStatus, checkConnection);
  };

  return {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    messages,
    isGenerating,
    partialResponse,
    setOllamaUrl,
    setOllamaModel,
    checkConnection,
    sendMessage,
    clearMessages
  };
};


import { useEffect } from 'react';
import { useOllamaConnection } from './useOllamaConnection';
import { useChatMessages, ChatMessage } from './useChatMessages';

export type OllamaConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
export type { ChatMessage };

export const useChatOllama = (
  initialUrl = 'http://localhost:11434',
  initialModel = 'gemma:7b'
) => {
  // Use the connection hook which now uses persistent settings
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

  // Use the chat messages hook
  const {
    messages,
    isGenerating,
    partialResponse,
    sendMessage: sendMessageBase,
    clearMessages
  } = useChatMessages(ollamaService);

  // Check connection when the component mounts
  useEffect(() => {
    // Check connection on initial load
    if (connectionStatus === 'idle') {
      checkConnection();
    }
  }, []);

  // Wrapper for the sendMessage function that includes the connection information
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

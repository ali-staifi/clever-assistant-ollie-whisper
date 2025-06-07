
import { useEffect } from 'react';
import { useChatOllama } from './useChatOllama';
import { useMemoryContext } from './useMemoryContext';

export const useChatWithMemory = (
  pageName: string,
  initialUrl = 'http://localhost:11434',
  initialModel = 'gemma:7b'
) => {
  const chatHook = useChatOllama(initialUrl, initialModel);
  const memoryContext = useMemoryContext(pageName);

  // Enhanced sendMessage with memory integration
  const sendMessageWithMemory = async (content: string) => {
    // Store user message in memory
    await memoryContext.addContextualMemory(
      `Message utilisateur: ${content}`,
      'conversation',
      6,
      ['chat', 'user-message']
    );

    // Get relevant context from memory
    const relevantContext = await memoryContext.getPageContext(content);
    
    // Enhance the prompt with memory context
    const enhancedContent = `${content}\n\nContexte pertinent de la mémoire:\n${relevantContext}`;
    
    // Send the enhanced message
    await chatHook.sendMessage(enhancedContent);
  };

  // Store assistant responses in memory
  useEffect(() => {
    if (chatHook.messages.length > 0) {
      const lastMessage = chatHook.messages[chatHook.messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        memoryContext.addContextualMemory(
          `Réponse assistant: ${lastMessage.content.substring(0, 200)}...`,
          'conversation',
          5,
          ['chat', 'assistant-response']
        );
      }
    }
  }, [chatHook.messages, memoryContext]);

  return {
    ...chatHook,
    sendMessage: sendMessageWithMemory,
    memoryContext,
  };
};

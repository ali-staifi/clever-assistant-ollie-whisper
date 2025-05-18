
import { useState } from 'react';
import { Message } from '@/services/ollama/types';
import { OllamaService } from '@/services/ollama/OllamaService';

export const useMessageProcessing = (
  ollamaService: OllamaService,
  messages: Message[],
  addAssistantMessage: (text: string) => void,
  speak?: (text: string) => Promise<boolean>
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  
  const processOllamaResponse = async (text: string, responseLanguage: string) => {
    setIsProcessing(true);
    setResponse('');
    
    try {
      // Store the full response text
      let fullResponse = '';
      
      // Define language instructions based on selected language
      let languageInstruction = '';
      if (responseLanguage.startsWith('fr')) {
        languageInstruction = "Ta réponse doit être en français.";
      } else if (responseLanguage.startsWith('ar')) {
        languageInstruction = "يجب أن تكون إجابتك باللغة العربية.";
      } else if (responseLanguage.startsWith('en')) {
        languageInstruction = "Your response must be in English.";
      }
      
      // Add language instruction to the request
      const promptWithLanguage = languageInstruction ? 
        `${languageInstruction} ${text}` : text;
      
      await ollamaService.generateResponse(
        promptWithLanguage,
        messages,
        (progressText) => {
          // Update both the temporary response state and our full response
          fullResponse = progressText;
          setResponse(progressText);
        }
      );
      
      // Save assistant response to messages and speak it
      addAssistantMessage(fullResponse);
      if (speak) {
        await speak(fullResponse);
      }
      
    } catch (error) {
      console.error('Error processing with Ollama:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      setResponse(`Désolé, j'ai rencontré une erreur lors du traitement de votre demande: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    setIsProcessing,
    response,
    setResponse,
    processOllamaResponse
  };
};


import { useState } from 'react';
import { Message } from '@/services/ollama/types';
import { OllamaService } from '@/services/ollama/OllamaService';
import { useToast } from '@/hooks/use-toast';

export const useMessageProcessing = (
  ollamaService: OllamaService,
  messages: Message[],
  addAssistantMessage: (text: string) => void,
  speak?: (text: string) => Promise<boolean>
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const { toast } = useToast();
  
  const processOllamaResponse = async (text: string, responseLanguage: string) => {
    setIsProcessing(true);
    setResponse('');
    
    try {
      // Store the full response text
      let fullResponse = '';
      let responseStarted = false;
      let lastResponseUpdate = Date.now();
      
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
      
      console.log('Sending request to Ollama:', promptWithLanguage);
      console.log('Current messages history:', JSON.stringify(messages.slice(-3)));
      
      // Add a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 120 seconds')), 120000); // Increased timeout to 120s
      });
      
      // Set up response stall detection
      const stallCheckInterval = setInterval(() => {
        if (responseStarted && Date.now() - lastResponseUpdate > 30000) { // 30s without updates
          clearInterval(stallCheckInterval);
          console.warn('Response generation stalled for 30 seconds, completing anyway');
          if (fullResponse.trim() === '') {
            fullResponse = "Je suis désolé, la génération de réponse a pris trop de temps. Veuillez réessayer avec une question plus simple.";
          }
          addAssistantMessage(fullResponse);
          if (speak) speak(fullResponse);
          setIsProcessing(false);
        }
      }, 5000);
      
      // Create response generation promise
      const responsePromise = ollamaService.generateResponse(
        promptWithLanguage,
        messages,
        (progressText) => {
          // Update both the temporary response state and our full response
          if (progressText.trim() !== '') {
            responseStarted = true;
            lastResponseUpdate = Date.now();
          }
          
          fullResponse = progressText;
          setResponse(progressText);
        }
      );
      
      try {
        // Race the promises to handle timeouts
        await Promise.race([responsePromise, timeoutPromise]);
      } finally {
        clearInterval(stallCheckInterval);
      }
      
      // Log success if we get here
      console.log('Response completed successfully with length:', fullResponse.length);
      
      // Check for empty response
      if (fullResponse.trim() === '') {
        console.warn('Empty response received from Ollama');
        fullResponse = "Je suis désolé, je n'ai pas pu générer de réponse. Veuillez réessayer avec une question différente.";
      }
      
      // Save assistant response to messages and speak it
      addAssistantMessage(fullResponse);
      if (speak) {
        await speak(fullResponse);
      }
      
    } catch (error) {
      console.error('Error processing with Ollama:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Display error in UI
      const errorResponse = `Désolé, j'ai rencontré une erreur: ${errorMsg}`;
      setResponse(errorResponse);
      
      // Add error message as assistant message
      addAssistantMessage(errorResponse);
      
      // Show error notification
      toast({
        title: "Erreur de traitement",
        description: errorMsg,
        variant: "destructive",
      });
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

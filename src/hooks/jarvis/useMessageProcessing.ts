
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
      console.log('Current messages history:', JSON.stringify(messages));
      
      // Ajout d'un timeout pour abandonner la requête si elle prend trop de temps
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('La requête a pris trop de temps')), 60000);
      });
      
      // Création d'une promesse pour la génération de réponse
      const responsePromise = ollamaService.generateResponse(
        promptWithLanguage,
        messages,
        (progressText) => {
          // Update both the temporary response state and our full response
          fullResponse = progressText;
          setResponse(progressText);
        }
      );
      
      // Utilisation de Promise.race pour limiter le temps d'attente
      await Promise.race([responsePromise, timeoutPromise]);
      
      // Si nous arrivons ici, c'est que la requête a abouti
      console.log('Response completed, full length:', fullResponse.length);
      
      if (fullResponse.trim() === '') {
        throw new Error('La réponse reçue est vide');
      }
      
      // Save assistant response to messages and speak it
      addAssistantMessage(fullResponse);
      if (speak) {
        await speak(fullResponse);
      }
      
    } catch (error) {
      console.error('Error processing with Ollama:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Afficher l'erreur dans l'interface
      setResponse(`Désolé, j'ai rencontré une erreur lors du traitement de votre demande: ${errorMsg}`);
      
      // Enregistrer également cette erreur comme message de l'assistant
      addAssistantMessage(`Désolé, j'ai rencontré une erreur lors du traitement de votre demande: ${errorMsg}`);
      
      // Notification de l'erreur
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

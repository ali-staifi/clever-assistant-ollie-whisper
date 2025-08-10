import { useState } from 'react';
import { OpenRouterService, OpenRouterMessage } from '@/services/openrouter/OpenRouterService';
import { Message } from '@/services/ollama/types';
import { useToast } from '@/hooks/use-toast';

export const useMessageProcessingOpenRouter = (
  openRouterService: OpenRouterService | null,
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
      if (!openRouterService) {
        throw new Error('Service OpenRouter indisponible');
      }

      // Instruction de langue
      let languageInstruction = '';
      if (responseLanguage.startsWith('fr')) languageInstruction = 'Réponds en français.';
      else if (responseLanguage.startsWith('ar')) languageInstruction = 'أجب باللغة العربية.';
      else if (responseLanguage.startsWith('en')) languageInstruction = 'Respond in English.';

      const promptWithLanguage = languageInstruction ? `${languageInstruction} ${text}` : text;

      // Convertir l'historique des messages
      const history: OpenRouterMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));

      // Requête avec streaming
      const full = await openRouterService.generateResponse(
        promptWithLanguage,
        history,
        (partial) => setResponse(partial)
      );

      const finalText = (full || '').trim() || "Je n'ai pas pu générer de réponse.";
      addAssistantMessage(finalText);
      if (speak) await speak(finalText);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const fallback = `Désolé, une erreur est survenue: ${errorMsg}`;
      setResponse(fallback);
      addAssistantMessage(fallback);
      toast({ title: 'Erreur OpenRouter', description: errorMsg, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, response, setResponse, setIsProcessing, processOllamaResponse };
};

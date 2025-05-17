
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSpeechErrors = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const { toast } = useToast();
  
  const handleError = (error: string, isNoSpeechError: boolean = false) => {
    console.error('Speech recognition error:', error);
    
    // Don't show error toast for no-speech as we handle it in RecognitionService
    if (isNoSpeechError) {
      return;
    }
    
    // Increment consecutive errors for clarity problems
    if (error.includes("understand") || error.includes("audio clearly")) {
      setConsecutiveErrors(prev => prev + 1);
    }
    
    // Provide different suggestions based on consecutive error count
    let friendlyError = error;
    let suggestions = "";
    
    if (consecutiveErrors > 2) {
      suggestions = `\n\nSuggestions: 
      1. Augmentez la sensibilité du microphone dans les réglages
      2. Parlez plus fort et plus clairement
      3. Réduisez les bruits ambiants
      4. Vérifiez que le bon microphone est sélectionné dans votre navigateur
      5. Essayez de redémarrer l'application`;
    }
    
    // Set a more user-friendly error message
    if (error.includes("microphone") || error.includes("permission")) {
      friendlyError = `Impossible d'accéder au microphone. Veuillez vérifier les permissions de votre navigateur.${suggestions}`;
    } else if (error.includes("understand") || error.includes("audio clearly")) {
      friendlyError = `Impossible de comprendre clairement l'audio. Essayez de parler plus fort ou d'ajuster la sensibilité du microphone.${suggestions}`;
    } else {
      friendlyError = `Erreur de reconnaissance vocale: ${error}${suggestions}`;
    }
      
    setErrorMessage(friendlyError);
    toast({
      title: "Erreur de reconnaissance vocale",
      description: friendlyError,
      variant: "destructive",
    });
  };
  
  // Reset consecutive errors
  const resetErrors = () => {
    setConsecutiveErrors(0);
  };

  return {
    errorMessage,
    setErrorMessage,
    consecutiveErrors, 
    handleError,
    resetErrors,
    showErrorToast: (title: string, description: string) => {
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
    showToast: (title: string, description: string, variant: "default" | "destructive" = "default") => {
      toast({
        title,
        description,
        variant,
      });
    }
  };
};

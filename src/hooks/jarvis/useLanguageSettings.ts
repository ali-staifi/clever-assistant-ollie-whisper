
import { useState, useEffect } from 'react';

export const useLanguageSettings = (setLanguageFunction?: (lang: string) => void) => {
  const [responseLanguage, setResponseLanguage] = useState('fr-FR'); // Default language: French
  
  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('jarvis-response-language');
    if (savedLanguage) {
      setResponseLanguage(savedLanguage);
      if (setLanguageFunction) {
        setLanguageFunction(savedLanguage);
      }
    } else {
      // Forcer le français par défaut si aucune sauvegarde
      setResponseLanguage('fr-FR');
      localStorage.setItem('jarvis-response-language', 'fr-FR');
      if (setLanguageFunction) {
        setLanguageFunction('fr-FR');
      }
    }
  }, [setLanguageFunction]);
  
  // Function to change language and save preference
  const changeResponseLanguage = (language: string) => {
    setResponseLanguage(language);
    if (setLanguageFunction) {
      setLanguageFunction(language);
    }
    // Save language preference
    localStorage.setItem('jarvis-response-language', language);
  };
  
  return {
    responseLanguage,
    changeResponseLanguage
  };
};

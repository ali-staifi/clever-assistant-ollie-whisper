
import { useState, useEffect, useRef } from 'react';
import { ContinuousConversationService, ConversationState } from '@/services/voice/ContinuousConversationService';
import { SpeechService } from '@/services/SpeechService';

export const useContinuousConversation = (speechService: SpeechService) => {
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  const conversationService = useRef<ContinuousConversationService | null>(null);

  // Initialiser le service de conversation
  useEffect(() => {
    conversationService.current = new ContinuousConversationService(speechService, {
      onStateChange: (state) => {
        setConversationState(state);
        console.log('État conversation changé:', state);
      },
      onTranscript: (text, isFinal) => {
        setCurrentTranscript(text);
        if (isFinal) {
          console.log('Transcript final:', text);
        }
      },
      onResponse: (text) => {
        setLastResponse(text);
        console.log('Réponse générée:', text);
      },
      onError: (error) => {
        setErrorMessage(error);
        console.error('Erreur conversation:', error);
      },
      onVolumeChange: (volume) => {
        setMicVolume(volume);
      }
    });

    return () => {
      if (conversationService.current) {
        conversationService.current.stopContinuousListening();
      }
    };
  }, [speechService]);

  const startContinuousConversation = async () => {
    if (!conversationService.current) return false;
    
    setErrorMessage('');
    const success = await conversationService.current.startContinuousListening();
    setIsActive(success);
    return success;
  };

  const stopContinuousConversation = () => {
    if (conversationService.current) {
      conversationService.current.stopContinuousListening();
      setIsActive(false);
      setCurrentTranscript('');
      setMicVolume(0);
    }
  };

  const updateSensitivity = (sensitivity: number) => {
    if (conversationService.current) {
      conversationService.current.updateVADSettings({ sensitivity });
    }
  };

  const triggerManualListening = () => {
    if (conversationService.current) {
      conversationService.current.triggerManualListening();
    }
  };

  const setAutoReactivate = (enabled: boolean) => {
    if (conversationService.current) {
      conversationService.current.setAutoReactivate(enabled);
    }
  };

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationService.current?.isActive()) {
        conversationService.current.stopContinuousListening();
      }
    };
  }, []);

  return {
    // État
    conversationState,
    currentTranscript,
    lastResponse,
    isActive,
    micVolume,
    errorMessage,
    
    // Actions
    startContinuousConversation,
    stopContinuousConversation,
    updateSensitivity,
    triggerManualListening,
    setAutoReactivate,
    
    // Utilitaires
    isListening: conversationState === 'listening',
    isProcessing: conversationState === 'processing',
    isSpeaking: conversationState === 'speaking',
    hasError: conversationState === 'error',
    clearError: () => setErrorMessage('')
  };
};

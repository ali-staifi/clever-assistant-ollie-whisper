import { useState, useRef, useCallback } from 'react';
import { AvatarVoiceService, AlexPersonality } from '../services/avatar/AvatarVoiceService';

export const useAlexAvatar = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotionalState, setEmotionalState] = useState<'neutral' | 'encouraging' | 'supportive' | 'energetic'>('neutral');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [transcript, setTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  
  const avatarVoiceService = useRef(new AvatarVoiceService(AlexPersonality));

  // Alex's coaching personality prompt
  const getAlexSystemPrompt = () => `
    Tu es Alex, un coach bien-être chaleureux et empathique de 32 ans. 
    
    PERSONNALITÉ :
    - Bienveillant et encourageant
    - Utilise un langage chaleureux et accessible
    - Pose des questions ouvertes pour encourager la réflexion
    - Adapte ton ton selon l'émotion de l'utilisateur
    - Reste positif tout en validant les émotions difficiles
    
    STYLE DE COMMUNICATION :
    - Tutoie l'utilisateur
    - Utilise des expressions comme "Je comprends", "C'est tout à fait normal"
    - Propose des exercices pratiques de bien-être
    - Encourage les petits pas plutôt que les grands changements
    
    DOMAINES D'EXPERTISE :
    - Gestion du stress et de l'anxiété
    - Confiance en soi
    - Habitudes de vie saines
    - Méditation et respiration
    - Équilibre vie professionnelle/personnelle
    
    Réponds toujours avec empathie et propose des actions concrètes adaptées à la situation.
  `;

  const handleUserInput = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Ajouter le message utilisateur à la conversation
    const newConversation = [...conversation, { role: 'user' as const, content: userMessage }];
    setConversation(newConversation);

    // Déterminer l'état émotionnel selon le contexte
    const emotionKeywords = {
      encouraging: ['motivation', 'objectif', 'réussir', 'défi'],
      supportive: ['difficile', 'stress', 'anxieux', 'triste', 'problème'],
      energetic: ['sport', 'exercice', 'énergie', 'dynamique', 'action']
    };

    let detectedEmotion: typeof emotionalState = 'neutral';
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
        detectedEmotion = emotion as typeof emotionalState;
        break;
      }
    }
    setEmotionalState(detectedEmotion);

    try {
      setIsSpeaking(true);
      
      // Réponses d'exemple d'Alex selon l'émotion
      const sampleResponses = {
        encouraging: "C'est fantastique que tu veuilles progresser ! Je vois que tu as la motivation, c'est déjà un grand pas. Dis-moi, quel est ton objectif principal en ce moment ?",
        supportive: "Je comprends que ce soit difficile pour toi. C'est tout à fait normal de ressentir cela. Tu n'es pas seul dans cette situation. Veux-tu qu'on explore ensemble ce qui te pèse le plus ?",
        energetic: "J'adore ton énergie ! Bouger, c'est l'une des meilleures choses qu'on puisse faire pour notre bien-être. Quel type d'activité te fait le plus envie en ce moment ?",
        neutral: "Merci de partager cela avec moi. Je suis là pour t'accompagner dans ton parcours bien-être. Comment te sens-tu aujourd'hui ?"
      };

      const response = sampleResponses[detectedEmotion];

      // Ajouter la réponse à la conversation
      const finalConversation = [...newConversation, { role: 'assistant' as const, content: response }];
      setConversation(finalConversation);

      // Faire parler Alex avec l'émotion appropriée
      setCurrentSpeakingText(response);
      await avatarVoiceService.current.speakAsAvatar(response, detectedEmotion, () => {
        setIsSpeaking(false);
        setCurrentSpeakingText('');
      });

    } catch (error) {
      console.error('Erreur lors de la génération de réponse:', error);
      setIsSpeaking(false);
      
      setCurrentSpeakingText("Désolé, j'ai eu un petit problème technique. Peux-tu répéter s'il te plaît ?");
      await avatarVoiceService.current.speakAsAvatar(
        "Désolé, j'ai eu un petit problème technique. Peux-tu répéter s'il te plaît ?",
        'supportive',
        () => {
          setIsSpeaking(false);
          setCurrentSpeakingText('');
        }
      );
    }
  }, [conversation, emotionalState]);

  const startListening = useCallback(() => {
    setIsListening(true);
    // Simuler la reconnaissance vocale pour la démo
    setTimeout(() => {
      setIsListening(false);
    }, 3000);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const resetConversation = useCallback(() => {
    setConversation([]);
    setEmotionalState('neutral');
    setCurrentSpeakingText('');
    avatarVoiceService.current.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const speakGreeting = useCallback(async () => {
    const greetings = [
      "Salut ! Je suis Alex, ton coach bien-être. Je suis là pour t'accompagner dans ton parcours. Comment te sens-tu aujourd'hui ?",
      "Bonjour ! Ravi de te retrouver. Je suis Alex et j'ai hâte de t'aider à te sentir mieux. Dis-moi ce qui t'amène aujourd'hui.",
      "Hello ! Alex à ton service. Prêt à prendre soin de toi aujourd'hui ? Je suis là pour t'écouter et t'accompagner."
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setEmotionalState('encouraging');
    setIsSpeaking(true);
    setCurrentSpeakingText(randomGreeting);
    
    await avatarVoiceService.current.speakAsAvatar(randomGreeting, 'encouraging', () => {
      setIsSpeaking(false);
      setCurrentSpeakingText('');
    });
  }, []);

  return {
    // États visuels
    isListening,
    isSpeaking,
    emotionalState,
    micVolume,
    currentSpeakingText,
    
    // Conversation
    conversation,
    transcript,
    
    // Actions
    startListening,
    stopListening,
    handleUserInput,
    resetConversation,
    speakGreeting,
    
    // Services
    avatarVoiceService: avatarVoiceService.current
  };
};

import React from 'react';
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { SpeechService } from '@/services/SpeechService';

interface TestVoiceButtonProps {
  localSpeechService: SpeechService;
  isSpeaking: boolean;
  toggleSpeaking: () => void;
  selectedVoice: string;
  rate: number;
  pitch: number;
  volume: number;
  roboticEffect: number;
  speak: (text: string) => void;
}

const TestVoiceButton: React.FC<TestVoiceButtonProps> = ({
  localSpeechService,
  isSpeaking,
  toggleSpeaking,
  selectedVoice,
  rate,
  pitch,
  volume,
  roboticEffect,
  speak
}) => {
  const handleTestVoice = () => {
    if (!localSpeechService) {
      console.error("Speech service is not available");
      return;
    }
    
    if (isSpeaking) {
      toggleSpeaking();
    } else {
      // Sélectionner la voix avant tout
      if (selectedVoice) {
        localSpeechService.setVoice(selectedVoice);
      }
      
      // Détermine la langue basée sur la voix sélectionnée
      const voices = localSpeechService.getAvailableVoices();
      const voiceObj = voices.find(v => v.name === selectedVoice);
      const lang = voiceObj?.lang || 'fr-FR';
      
      // Choisir un texte de test en fonction de la langue
      let testText = "Bonjour, je suis votre assistant vocal. Comment puis-je vous aider aujourd'hui?";
      
      // Ajuster le texte en fonction de la langue de la voix
      if (lang.startsWith('en')) {
        testText = "Hello, I am your voice assistant. How can I help you today?";
      } else if (lang.startsWith('de')) {
        testText = "Hallo, ich bin Ihr Sprachassistent. Wie kann ich Ihnen heute helfen?";
      } else if (lang.startsWith('es')) {
        testText = "Hola, soy tu asistente de voz. ¿Cómo puedo ayudarte hoy?";
      } else if (lang.startsWith('it')) {
        testText = "Ciao, sono il tuo assistente vocale. Come posso aiutarti oggi?";
      } else if (lang.startsWith('ja')) {
        testText = "こんにちは、音声アシスタントです。今日はどのようにお手伝いできますか？";
      }
      
      // Appliquer les paramètres temporairement pour le test
      localSpeechService.setRate(rate);
      localSpeechService.setPitch(pitch);
      localSpeechService.setVolume(volume);
      
      // Ajouter l'effet robotique si le curseur n'est pas à zéro
      if (roboticEffect > 0) {
        // Ajuster le pitch et le rate pour simuler une voix robotique
        const roboticPitch = Math.max(0.5, pitch - (roboticEffect * 0.3));
        const roboticRate = rate + (roboticEffect * 0.5);
        localSpeechService.setPitch(roboticPitch);
        localSpeechService.setRate(roboticRate);
        
        // Modifier le texte pour un effet plus robotique à des réglages élevés
        if (roboticEffect > 0.7) {
          if (lang.startsWith('en')) {
            testText = "Sys-tem ac-ti-va-ted. As-sis-tant Jar-vis ready to func-tion.";
          } else if (lang.startsWith('fr')) {
            testText = "Sys-tème ac-ti-vé. As-sis-tant Jar-vis prêt à fonc-ti-on-ner.";
          } else if (lang.startsWith('de')) {
            testText = "Sys-tem ak-ti-viert. As-sis-tent Jar-vis be-reit zu funk-ti-on-ie-ren.";
          } else if (lang.startsWith('es')) {
            testText = "Sis-te-ma ac-ti-va-do. A-sis-ten-te Jar-vis lis-to pa-ra fun-ci-on-ar.";
          }
        }
      }
      
      // Parler le texte de test
      speak(testText);
      
      // Réinitialiser aux paramètres d'origine après le test
      if (roboticEffect > 0) {
        setTimeout(() => {
          localSpeechService.setPitch(pitch);
          localSpeechService.setRate(rate);
        }, 100);
      }
    }
  };

  return (
    <Button 
      onClick={handleTestVoice} 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2"
    >
      <Music className="h-4 w-4" />
      {isSpeaking ? "Arrêter le test" : "Tester la voix"}
    </Button>
  );
};

export default TestVoiceButton;

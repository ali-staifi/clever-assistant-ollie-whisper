
import React from 'react';
import { Button } from "@/components/ui/button";
import { Music, Flag, Globe, Languages } from "lucide-react";
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
  speak: (text: string) => Promise<boolean>;
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
      
      // Texte spécifique pour le français (plus développé)
      if (lang.startsWith('fr')) {
        testText = "Bonjour, je suis votre assistant vocal en français. Je peux vous aider avec différentes tâches et répondre à vos questions. N'hésitez pas à me demander ce que vous voulez.";
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
      speak(testText).catch(console.error);
      
      // Réinitialiser aux paramètres d'origine après le test
      if (roboticEffect > 0) {
        setTimeout(() => {
          localSpeechService.setPitch(pitch);
          localSpeechService.setRate(rate);
        }, 100);
      }
    }
  };

  // Fonction de test spécifique pour le français
  const handleTestFrenchVoice = () => {
    if (!localSpeechService) {
      console.error("Speech service is not available");
      return;
    }
    
    if (isSpeaking) {
      toggleSpeaking();
      return;
    }
    
    // Chercher une voix française
    const voices = localSpeechService.getAvailableVoices();
    const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
    
    if (frenchVoices.length > 0) {
      // Sélectionner la première voix française
      const frenchVoice = frenchVoices[0];
      localSpeechService.setVoice(frenchVoice.name);
      
      // Texte de test en français
      const testText = "Test de la voix française. Je suis l'assistant Jarvis et je vous réponds maintenant en français. Comment puis-je vous aider aujourd'hui?";
      
      // Appliquer les paramètres actuels
      localSpeechService.setRate(rate);
      localSpeechService.setPitch(pitch);
      localSpeechService.setVolume(volume);
      
      // Parler en français
      speak(testText);
    } else {
      // Alerte si aucune voix française n'est disponible
      alert("Aucune voix française n'est disponible sur votre navigateur.");
    }
  };
  
  // Fonction pour tester une voix arabe parlant en français
  const handleTestArabicVoiceInFrench = () => {
    if (!localSpeechService) {
      console.error("Speech service is not available");
      return;
    }
    
    if (isSpeaking) {
      toggleSpeaking();
      return;
    }
    
    // Chercher une voix arabe
    const voices = localSpeechService.getAvailableVoices();
    const arabicVoices = voices.filter(v => 
      v.lang.startsWith('ar') || 
      v.name.toLowerCase().includes('arabic') || 
      v.name.includes('arabe')
    );
    
    if (arabicVoices.length > 0) {
      // Sélectionner la première voix arabe
      const arabicVoice = arabicVoices[0];
      localSpeechService.setVoice(arabicVoice.name);
      
      // Texte de test en français même si c'est une voix arabe
      const testText = "Test d'une voix arabe parlant en français. Je suis l'assistant Jarvis avec une voix arabe mais qui parle en français. Comment puis-je vous aider aujourd'hui?";
      
      // Appliquer les paramètres actuels
      localSpeechService.setRate(rate);
      localSpeechService.setPitch(pitch);
      localSpeechService.setVolume(volume);
      
      // Parler en français avec une voix arabe
      speak(testText);
    } else {
      // Alerte si aucune voix arabe n'est disponible
      alert("Aucune voix arabe n'est disponible sur votre navigateur.");
    }
  };
  
  // Nouvelle fonction pour tester une voix arabe parlant en arabe
  const handleTestArabicVoice = () => {
    if (!localSpeechService) {
      console.error("Speech service is not available");
      return;
    }
    
    if (isSpeaking) {
      toggleSpeaking();
      return;
    }
    
    // Chercher une voix arabe
    const voices = localSpeechService.getAvailableVoices();
    const arabicVoices = voices.filter(v => 
      v.lang.startsWith('ar') || 
      v.name.toLowerCase().includes('arabic') || 
      v.name.includes('arabe')
    );
    
    if (arabicVoices.length > 0) {
      // Sélectionner la première voix arabe
      const arabicVoice = arabicVoices[0];
      localSpeechService.setVoice(arabicVoice.name);
      
      // Texte de test en arabe
      const testText = "مرحبا، أنا المساعد جارفيس وأتحدث باللغة العربية الآن. كيف يمكنني مساعدتك؟";
      
      // Appliquer les paramètres actuels
      localSpeechService.setRate(rate);
      localSpeechService.setPitch(pitch);
      localSpeechService.setVolume(volume);
      
      // Parler en arabe
      speak(testText);
    } else {
      // Alerte si aucune voix arabe n'est disponible
      alert("لا توجد أصوات عربية متاحة في متصفحك");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleTestVoice} 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
      >
        <Music className="h-4 w-4" />
        {isSpeaking ? "Arrêter le test" : "Tester la voix"}
      </Button>
      
      <Button 
        onClick={handleTestFrenchVoice} 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
      >
        <Flag className="h-4 w-4" />
        {isSpeaking ? "Arrêter" : "Tester en français"}
      </Button>
      
      <Button 
        onClick={handleTestArabicVoiceInFrench} 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
      >
        <Globe className="h-4 w-4" />
        {isSpeaking ? "Arrêter" : "Voix arabe en français"}
      </Button>
      
      <Button 
        onClick={handleTestArabicVoice} 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
      >
        <Languages className="h-4 w-4" />
        {isSpeaking ? "توقف" : "اختبار باللغة العربية"}
      </Button>
    </div>
  );
};

export default TestVoiceButton;

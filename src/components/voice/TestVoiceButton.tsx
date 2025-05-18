
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
      let testText = "Bonjour, je suis votre assistant vocal. Comment puis-je vous aider aujourd'hui?";
      
      // Apply settings temporarily for test
      if (selectedVoice) {
        localSpeechService.setVoice(selectedVoice);
      }
      localSpeechService.setRate(rate);
      localSpeechService.setPitch(pitch);
      localSpeechService.setVolume(volume);
      
      // Add robotic effect if slider is not at zero
      if (roboticEffect > 0) {
        // Adjust pitch and rate to simulate robotic voice
        const roboticPitch = Math.max(0.5, pitch - (roboticEffect * 0.3));
        const roboticRate = rate + (roboticEffect * 0.5);
        localSpeechService.setPitch(roboticPitch);
        localSpeechService.setRate(roboticRate);
        
        // Change text for more robotic feel at high settings
        if (roboticEffect > 0.7) {
          testText = "Sys-tème ac-ti-vé. As-sis-tant Jar-vis prêt à fonc-ti-on-ner.";
        }
      }
      
      // Speak test text
      speak(testText);
      
      // Reset to original settings after test
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

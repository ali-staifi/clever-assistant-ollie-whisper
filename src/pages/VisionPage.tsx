
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageAnalyzer from '@/components/vision/ImageAnalyzer';
import VideoAnalyzer from '@/components/vision/VideoAnalyzer';
import AdvancedVoiceSettings from '@/components/voice/AdvancedVoiceSettings';
import VoiceCommands from '@/components/automation/VoiceCommands';
import { useFastSpeech2 } from '@/hooks/jarvis/useFastSpeech2';
import { useToast } from '@/hooks/use-toast';

const VisionPage = () => {
  const ollamaUrl = localStorage.getItem('ollama-url') || 'http://localhost:11434';
  const { toast } = useToast();
  
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    voiceParams,
    setSpeed,
    setPitch,
    setEnergy,
    setEmotion,
  } = useFastSpeech2();
  
  const handleTestVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(
        "Bonjour, je suis Jarvis, votre assistant vocal multimodal. Je peux analyser des images, répondre à vos questions, et exécuter des commandes vocales avec diverses émotions."
      );
    }
  };
  
  const handleVoiceCommand = (command: string) => {
    toast({
      title: "Commande vocale détectée",
      description: `Exécution de: ${command}`,
    });
    
    speak(`J'exécute la commande: ${command}`);
  };
  
  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Jarvis Vision et Synthèse Vocale Avancée</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Tabs defaultValue="image">
            <TabsList className="mb-4">
              <TabsTrigger value="image">Analyse d'Images</TabsTrigger>
              <TabsTrigger value="video">Analyse de Vidéos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="image">
              <ImageAnalyzer ollamaUrl={ollamaUrl} />
            </TabsContent>
            
            <TabsContent value="video">
              <VideoAnalyzer ollamaUrl={ollamaUrl} />
            </TabsContent>
          </Tabs>
          
          <VoiceCommands onCommand={handleVoiceCommand} />
        </div>
        
        <div>
          <AdvancedVoiceSettings 
            voiceParams={voiceParams}
            onSpeedChange={setSpeed}
            onPitchChange={setPitch}
            onEnergyChange={setEnergy}
            onEmotionChange={(emotion) => setEmotion(emotion)}
            onEmotionStrengthChange={(strength) => setEmotion(voiceParams.emotion, strength)}
            onTest={handleTestVoice}
            isSpeaking={isSpeaking}
          />
          
          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="font-medium mb-4">Comment utiliser Jarvis Vision</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Sélectionnez une image ou une vidéo à analyser</li>
              <li>Entrez des instructions spécifiques (optionnel)</li>
              <li>Cliquez sur "Analyser" pour lancer le traitement via LLaVA</li>
              <li>Une fois l'analyse terminée, vous pouvez écouter la description grâce à la synthèse vocale</li>
              <li>Ajustez les paramètres vocaux pour modifier le ton et l'émotion de la voix</li>
            </ol>
            
            <div className="mt-4 p-4 bg-jarvis-blue/10 rounded-lg">
              <h4 className="font-medium mb-2">Note sur FastSpeech2</h4>
              <p className="text-sm">
                L'implémentation actuelle simule le comportement de FastSpeech2. Dans une production réelle,
                ces paramètres seraient connectés à un service d'IA neuronal pour la synthèse vocale de haute qualité
                capable d'exprimer des émotions et d'insérer des pauses naturelles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionPage;

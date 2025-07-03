import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, Volume2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface VoiceLanguageResetProps {
  onReset: () => void;
  speechService?: any;
}

const VoiceLanguageReset: React.FC<VoiceLanguageResetProps> = ({ 
  onReset, 
  speechService 
}) => {
  const { toast } = useToast();

  const resetToFrench = () => {
    try {
      // Forcer le français
      localStorage.setItem('jarvis-response-language', 'fr-FR');
      
      // Si disponible, configurer le service vocal
      if (speechService) {
        speechService.setLanguage('fr-FR');
        
        // Sélectionner une voix française
        const voices = speechService.getAvailableVoices();
        const frenchVoices = voices.filter((voice: any) => 
          voice.lang.startsWith('fr') && 
          voice.name.toLowerCase().includes('hortense')
        );
        
        if (frenchVoices.length > 0) {
          speechService.setVoice(frenchVoices[0].name);
        }
      }
      
      // Callback pour mettre à jour les états
      onReset();
      
      toast({
        title: "Configuration vocale réinitialisée",
        description: "Langue française restaurée avec succès",
      });
      
      console.log("Réinitialisation forcée vers le français");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast({
        title: "Erreur de réinitialisation",
        description: "Impossible de réinitialiser la configuration vocale",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        onClick={resetToFrench}
        variant="outline" 
        size="sm"
        className="flex items-center space-x-1"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Forcer Français</span>
      </Button>
      
      <Button 
        onClick={() => {
          if (speechService) {
            speechService.speak("Test de configuration vocale en français. La langue est maintenant correctement configurée.");
          }
        }}
        variant="outline" 
        size="sm"
        className="flex items-center space-x-1"
      >
        <Volume2 className="h-3 w-3" />
        <span>Test</span>
      </Button>
    </div>
  );
};

export default VoiceLanguageReset;
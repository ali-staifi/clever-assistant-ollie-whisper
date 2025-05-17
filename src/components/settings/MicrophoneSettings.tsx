
import React, { useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, AlertTriangle, Mic, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MicrophoneSettingsProps {
  micSensitivity: number;
  onMicSensitivityChange: (value: number) => void;
  testMicrophone: () => void;
  testingMic: boolean;
  volumeLevel: number;
}

const MicrophoneSettings: React.FC<MicrophoneSettingsProps> = ({
  micSensitivity,
  onMicSensitivityChange,
  testMicrophone,
  testingMic,
  volumeLevel
}) => {
  // List of available browser languages - incluant plus d'options françaises
  const availableLanguages = [
    { value: 'fr-FR', label: 'Français (France)' },
    { value: 'fr-CA', label: 'Français (Canada)' },
    { value: 'fr-BE', label: 'Français (Belgique)' },
    { value: 'fr-CH', label: 'Français (Suisse)' },
    { value: 'en-US', label: 'Anglais (US)' },
    { value: 'en-GB', label: 'Anglais (GB)' },
    { value: 'es-ES', label: 'Espagnol' },
    { value: 'de-DE', label: 'Allemand' },
    { value: 'it-IT', label: 'Italien' }
  ];
  
  // Get the current browser language or default to French
  const [selectedLang, setSelectedLang] = React.useState('fr-FR');
  
  // État pour vérifier si le navigateur supporte la reconnaissance vocale
  const [isSpeechSupported, setIsSpeechSupported] = React.useState(true);
  
  // Vérifier le support de la reconnaissance vocale au chargement
  useEffect(() => {
    setIsSpeechSupported(
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    );
  }, []);

  return (
    <>
      {!isSpeechSupported && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Votre navigateur ne prend pas en charge la reconnaissance vocale. Essayez Chrome, Edge ou Safari.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mic-sensitivity">Sensibilité du microphone</Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(micSensitivity * 100)}%
          </span>
        </div>
        <Slider
          id="mic-sensitivity"
          min={0.5}
          max={5.0}  // Augmentation de la valeur maximale pour plus de sensibilité
          step={0.2}
          value={[micSensitivity]}
          onValueChange={(value) => onMicSensitivityChange(value[0])}
        />
        <p className="text-xs text-muted-foreground">
          Augmentez cette valeur si l'assistant a du mal à vous entendre
        </p>
      </div>
      
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="recognition-language">Langue de reconnaissance</Label>
        </div>
        <Select value={selectedLang} onValueChange={setSelectedLang}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez une langue" />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choisissez la langue dans laquelle vous parlez
        </p>
      </div>
      
      <div className="space-y-2 mt-4">
        <div className="flex justify-between items-center">
          <Label>Tester le microphone</Label>
          <Button 
            variant={testingMic ? "destructive" : "default"} 
            onClick={testMicrophone}
            size="sm"
            disabled={!isSpeechSupported}
            className="flex items-center gap-1"
          >
            {testingMic ? (
              <>
                <VolumeX className="h-4 w-4 mr-1" />
                Arrêter le test
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-1" />
                Démarrer le test
              </>
            )}
          </Button>
        </div>
        
        {testingMic && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <div className="bg-muted h-2 flex-1 rounded-full overflow-hidden">
                <div 
                  className="bg-jarvis-blue h-full transition-all duration-100"
                  style={{ width: `${volumeLevel}%` }}
                ></div>
              </div>
              <Volume2 className="h-4 w-4 text-jarvis-blue" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {volumeLevel < 20 ? "Voix trop basse - essayez de parler plus fort ou augmentez la sensibilité" : 
               volumeLevel > 70 ? "Bon niveau de volume détecté" : "Essayez de parler un peu plus fort"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default MicrophoneSettings;

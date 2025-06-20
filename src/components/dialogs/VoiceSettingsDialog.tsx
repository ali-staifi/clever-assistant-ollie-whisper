import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MicrophoneSettings from "@/components/settings/MicrophoneSettings";
import VoiceSettings from "@/components/voice/VoiceSettings";
import { useMicrophoneTesting } from "@/hooks/useMicrophoneTesting";
import { useMicSensitivity } from "@/hooks/jarvis/useMicSensitivity";
import { useMaryTTS } from "@/hooks/jarvis/useMaryTTS";
import MaryTTSConfigDialog from "@/components/dialogs/MaryTTSConfigDialog";
import VoiceSelectionDialog from "@/components/dialogs/VoiceSelectionDialog";
import { SpeechService } from '@/services/SpeechService';

interface VoiceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  globalVoiceSettings?: {
    roboticEffect: number;
    rate: number;
    pitch: number;
    volume: number;
    voiceGender: 'male' | 'female' | 'neutral';
  };
  onUpdateGlobalVoiceSettings?: (settings: any) => void;
}

const VoiceSettingsDialog: React.FC<VoiceSettingsDialogProps> = ({
  open,
  onOpenChange,
  globalVoiceSettings,
  onUpdateGlobalVoiceSettings
}) => {
  // Get microphone sensitivity settings
  const { micSensitivity, setMicSensitivity } = useMicSensitivity();
  
  // Get microphone testing functionality
  const { testingMic, volumeLevel, startMicTest, stopMicTest } = useMicrophoneTesting();
  
  // Get MaryTTS functionality
  const { 
    configureTTS, 
    serverUrl, 
    currentVoice,
    locale,
    testConnection,
    speak, 
    isSpeaking, 
    stopSpeaking 
  } = useMaryTTS();
  
  // State for MaryTTS config dialog
  const [maryConfigOpen, setMaryConfigOpen] = useState(false);
  
  // State for voice selection dialog
  const [voiceSelectionOpen, setVoiceSelectionOpen] = useState(false);
  
  // Get speech service from window or create a new instance
  const [speechService, setSpeechService] = useState<SpeechService | undefined>(undefined);
  
  // Initialize speech service
  useEffect(() => {
    // Try to get from window global first
    if (typeof window !== 'undefined' && window.jarvisSpeechService) {
      setSpeechService(window.jarvisSpeechService);
    } else {
      // Create a new instance if not available globally
      setSpeechService(new SpeechService());
    }
  }, []);
  
  // Handle microphone test button click
  const handleTestMicrophone = async () => {
    if (testingMic) {
      stopMicTest();
    } else {
      await startMicTest();
    }
  };
  
  // Handle voice test
  const handleTestVoice = async () => {
    if (speechService && globalVoiceSettings) {
      // Appliquer les paramètres avant le test
      speechService.setRate(globalVoiceSettings.rate);
      speechService.setPitch(globalVoiceSettings.pitch);
      speechService.setVolume(globalVoiceSettings.volume);
      speechService.setRoboticEffect(globalVoiceSettings.roboticEffect);
      
      const genderText = globalVoiceSettings.voiceGender === 'female' ? 'féminine' : 
                        globalVoiceSettings.voiceGender === 'male' ? 'masculine' : 'neutre';
      
      await speechService.speak(`Bonjour, ceci est un test des paramètres vocaux avancés avec une voix ${genderText}. La vitesse, la hauteur, le volume et l'effet robotique sont maintenant configurés selon vos préférences.`);
    }
  };
  
  // Handle MaryTTS test
  const handleTestMaryTTS = async () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      await speak("Bonjour, ceci est un test de MaryTTS. Le système de synthèse vocale fonctionne correctement.");
    }
  };
  
  // Handle MaryTTS configuration
  const handleConfigureMaryTTS = (config: { serverUrl: string; voice: string; locale: string }) => {
    configureTTS(config);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Paramètres vocaux</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="advanced" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
              <TabsTrigger value="microphone">Microphone</TabsTrigger>
              <TabsTrigger value="tts">Synthèse vocale</TabsTrigger>
            </TabsList>
            
            <TabsContent value="advanced" className="py-4 space-y-6">
              {globalVoiceSettings && onUpdateGlobalVoiceSettings && (
                <VoiceSettings
                  roboticEffect={globalVoiceSettings.roboticEffect}
                  setRoboticEffect={(value) => onUpdateGlobalVoiceSettings({ roboticEffect: value })}
                  rate={globalVoiceSettings.rate}
                  setRate={(value) => onUpdateGlobalVoiceSettings({ rate: value })}
                  pitch={globalVoiceSettings.pitch}
                  setPitch={(value) => onUpdateGlobalVoiceSettings({ pitch: value })}
                  volume={globalVoiceSettings.volume}
                  setVolume={(value) => onUpdateGlobalVoiceSettings({ volume: value })}
                  voiceGender={globalVoiceSettings.voiceGender}
                  setVoiceGender={(gender) => onUpdateGlobalVoiceSettings({ voiceGender: gender })}
                  onTestVoice={handleTestVoice}
                />
              )}
            </TabsContent>
            
            <TabsContent value="microphone" className="py-4 space-y-6">
              <MicrophoneSettings 
                micSensitivity={micSensitivity}
                onMicSensitivityChange={setMicSensitivity}
                testMicrophone={handleTestMicrophone}
                testingMic={testingMic}
                volumeLevel={volumeLevel}
              />
            </TabsContent>
            
            <TabsContent value="tts" className="py-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Voix du navigateur</h3>
                    <p className="text-xs text-muted-foreground">
                      Configurer la voix de synthèse vocale
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setVoiceSelectionOpen(true)}
                  >
                    Choisir une voix
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">MaryTTS</h3>
                    <p className="text-xs text-muted-foreground">
                      Synthèse vocale open-source multi-langue
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setMaryConfigOpen(true)}
                  >
                    Configurer
                  </Button>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleTestMaryTTS}
                  variant={isSpeaking ? "destructive" : "default"}
                >
                  {isSpeaking ? "Arrêter le test" : "Tester MaryTTS"}
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  <p>Serveur actuel: {serverUrl || 'Non configuré'}</p>
                  <p>Voix actuelle: {currentVoice || 'Non configurée'}</p>
                  <p>Langue: {locale || 'fr_FR'}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <MaryTTSConfigDialog
        open={maryConfigOpen}
        onOpenChange={setMaryConfigOpen}
        onConfigure={handleConfigureMaryTTS}
        serverUrl={serverUrl}
        currentVoice={currentVoice}
      />
      
      <VoiceSelectionDialog
        open={voiceSelectionOpen}
        onOpenChange={setVoiceSelectionOpen}
        speechService={speechService}
      />
    </>
  );
};

export default VoiceSettingsDialog;

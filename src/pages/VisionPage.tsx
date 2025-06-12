import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageAnalyzer from '@/components/vision/ImageAnalyzer';
import VideoAnalyzer from '@/components/vision/VideoAnalyzer';
import AdvancedVoiceSettings from '@/components/voice/AdvancedVoiceSettings';
import VoiceCommands from '@/components/automation/VoiceCommands';
import OllamaVoiceIntegration from '@/components/voice/OllamaVoiceIntegration';
import { useFastSpeech2 } from '@/hooks/jarvis/useFastSpeech2';
import { useToast } from '@/hooks/use-toast';

// Définir des modèles LLaVA recommandés
const RECOMMENDED_MODELS = [
  { name: 'llava-llama3', description: 'Modèle recommandé (Llama3)' },
  { name: 'llava:34b', description: 'Haute qualité (34B)' },
  { name: 'llava:13b', description: 'Bon équilibre (13B)' },
  { name: 'llava:7b', description: 'Rapide (7B)' },
  { name: 'bakllava', description: 'BakLLaVA (vision)' },
];

const VisionPage = () => {
  const ollamaUrl = localStorage.getItem('ollama-url') || 'http://localhost:11434';
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('llava-model') || 'llava-llama3');
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  
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
        "Bonjour, je suis Jarvis. Mes paramètres vocaux sont maintenant configurés avec une vitesse de " + voiceParams.speed + 
        ", une hauteur de " + voiceParams.pitch + 
        ", une énergie de " + voiceParams.energy + 
        " et une émotion " + voiceParams.emotion + 
        " à " + Math.round(voiceParams.emotionStrength * 100) + " pourcent d'intensité."
      );
    }
  };
  
  const handleVoiceCommand = (command: string) => {
    toast({
      title: "Commande vocale détectée",
      description: `Exécution de: ${command}`,
    });
    
    speak(`J'exécute la commande: ${command}. Les paramètres vocaux actuels sont appliqués.`);
  };

  // Tester la connexion à Ollama
  const checkOllamaConnection = async () => {
    try {
      setCheckingConnection(true);
      const response = await fetch(`${ollamaUrl}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setIsOllamaConnected(true);
        toast({
          title: "Connexion réussie",
          description: "La connexion à Ollama est établie.",
        });
      } else {
        setIsOllamaConnected(false);
        toast({
          title: "Connexion échouée",
          description: `Erreur: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setIsOllamaConnected(false);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Ollama.",
        variant: "destructive",
      });
    } finally {
      setCheckingConnection(false);
    }
  };

  // Vérifier la connexion au chargement de la page
  useEffect(() => {
    checkOllamaConnection();
  }, []);

  // Sauvegarder le modèle sélectionné
  useEffect(() => {
    localStorage.setItem('llava-model', selectedModel);
  }, [selectedModel]);
  
  return (
    <div className="container py-4 mx-auto max-h-screen overflow-y-auto">
      <h1 className="text-xl font-bold mb-3">Jarvis Vision et Synthèse Vocale Avancée</h1>
      
      {/* Statut de connexion et sélection de modèle - Version compacte */}
      <div className="bg-card border rounded-lg p-3 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-xs font-medium mb-1">Statut d'Ollama:</p>
            <div className="flex items-center">
              {isOllamaConnected === null && !checkingConnection && (
                <span className="text-muted-foreground text-sm">Statut inconnu</span>
              )}
              {checkingConnection && (
                <span className="text-muted-foreground text-sm">Vérification...</span>
              )}
              {isOllamaConnected === true && !checkingConnection && (
                <span className="text-green-500 flex items-center text-sm">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Connecté
                </span>
              )}
              {isOllamaConnected === false && !checkingConnection && (
                <span className="text-red-500 flex items-center text-sm">
                  <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                  Non connecté
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <div className="min-w-[200px]">
              <label htmlFor="llava-model" className="text-xs font-medium">
                Modèle LLaVA:
              </label>
              <select
                id="llava-model"
                className="mt-1 block w-full bg-background border border-input rounded-md px-2 py-1 text-sm"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {RECOMMENDED_MODELS.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
                <option value="custom">Autre modèle...</option>
              </select>
            </div>
            
            {selectedModel === 'custom' && (
              <div className="min-w-[150px]">
                <label htmlFor="custom-model" className="text-xs font-medium">
                  Modèle personnalisé:
                </label>
                <input
                  type="text"
                  id="custom-model"
                  className="mt-1 block w-full bg-background border border-input rounded-md px-2 py-1 text-sm"
                  placeholder="Nom du modèle"
                  onChange={(e) => setSelectedModel(e.target.value)}
                />
              </div>
            )}
            
            <button
              className="mt-auto py-1 px-3 bg-jarvis-blue text-white rounded-md text-sm h-fit"
              onClick={checkOllamaConnection}
              disabled={checkingConnection}
            >
              {checkingConnection ? 'Test...' : 'Tester'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Tabs defaultValue="image">
            <TabsList className="mb-3">
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Vidéos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="image">
              <ImageAnalyzer 
                ollamaUrl={ollamaUrl} 
                selectedModel={selectedModel}
              />
            </TabsContent>
            
            <TabsContent value="video">
              <VideoAnalyzer 
                ollamaUrl={ollamaUrl} 
                selectedModel={selectedModel}
              />
            </TabsContent>
          </Tabs>
          
          <VoiceCommands onCommand={handleVoiceCommand} />
        </div>
        
        <div className="space-y-4">
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
          
          <OllamaVoiceIntegration 
            voiceParams={voiceParams}
            onVoiceResponse={(text) => {
              toast({
                title: "Réponse Ollama générée",
                description: "Utilisation des paramètres vocaux configurés",
              });
            }}
            onSpeakGenerated={(text, params) => {
              speak(text);
              toast({
                title: "Jarvis parle",
                description: `Avec les paramètres: ${params.emotion} (${Math.round(params.emotionStrength * 100)}%)`,
              });
            }}
          />
          
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2 text-sm">Utilisation rapide</h3>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Ajustez les paramètres vocaux en haut à droite</li>
              <li>Testez la voix avec le bouton "Tester la voix"</li>
              <li>Sélectionnez voix homme/femme dans "Génération Ollama"</li>
              <li>Analysez des images/vidéos - Jarvis parlera avec vos réglages</li>
            </ol>
            
            <div className="mt-3 p-3 bg-green-500/10 border border-green-300/20 rounded-lg">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-1 text-xs">✓ Confirmation</h4>
              <p className="text-xs">
                Tous les paramètres vocaux (vitesse, hauteur, énergie, émotion) 
                influencent directement la voix de Jarvis sur cette page.
              </p>
            </div>
            
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-300/20 rounded-lg">
              <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-1 text-xs">Dépannage LLaVA</h4>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Vérifiez que le serveur Ollama fonctionne</li>
                <li>Installez le modèle: <code>ollama pull llava-llama3</code></li>
                <li>Réduisez la taille des images si nécessaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionPage;

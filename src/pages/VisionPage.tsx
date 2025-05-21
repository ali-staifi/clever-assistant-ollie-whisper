
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageAnalyzer from '@/components/vision/ImageAnalyzer';
import VideoAnalyzer from '@/components/vision/VideoAnalyzer';
import AdvancedVoiceSettings from '@/components/voice/AdvancedVoiceSettings';
import VoiceCommands from '@/components/automation/VoiceCommands';
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
    <div className="container py-6 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Jarvis Vision et Synthèse Vocale Avancée</h1>
      
      {/* Statut de connexion et sélection de modèle */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Statut d'Ollama:</p>
            <div className="flex items-center">
              {isOllamaConnected === null && !checkingConnection && (
                <span className="text-muted-foreground">Statut inconnu</span>
              )}
              {checkingConnection && (
                <span className="text-muted-foreground">Vérification...</span>
              )}
              {isOllamaConnected === true && !checkingConnection && (
                <span className="text-green-500 flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Connecté à {ollamaUrl}
                </span>
              )}
              {isOllamaConnected === false && !checkingConnection && (
                <span className="text-red-500 flex items-center">
                  <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                  Non connecté
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="llava-model" className="text-sm font-medium">
                Modèle LLaVA:
              </label>
              <select
                id="llava-model"
                className="mt-1 block w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {RECOMMENDED_MODELS.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} - {model.description}
                  </option>
                ))}
                <option value="custom">Autre modèle...</option>
              </select>
            </div>
            
            {selectedModel === 'custom' && (
              <div className="flex-1">
                <label htmlFor="custom-model" className="text-sm font-medium">
                  Modèle personnalisé:
                </label>
                <input
                  type="text"
                  id="custom-model"
                  className="mt-1 block w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                  placeholder="Nom du modèle"
                  onChange={(e) => setSelectedModel(e.target.value)}
                />
              </div>
            )}
            
            <button
              className="mt-auto py-2 px-4 bg-jarvis-blue text-white rounded-md text-sm"
              onClick={checkOllamaConnection}
              disabled={checkingConnection}
            >
              {checkingConnection ? 'Vérification...' : 'Tester la connexion'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs defaultValue="image">
            <TabsList className="mb-4">
              <TabsTrigger value="image">Analyse d'Images</TabsTrigger>
              <TabsTrigger value="video">Analyse de Vidéos</TabsTrigger>
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
          
          <div className="mt-6 p-6 bg-muted rounded-lg">
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
            
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-300/20 rounded-lg">
              <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Dépannage LLaVA</h4>
              <p className="text-sm">
                Si l'analyse d'image ne fonctionne pas, essayez ces solutions:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Vérifiez que le serveur Ollama est en cours d'exécution</li>
                <li>Assurez-vous que le modèle LLaVA est installé (<code>ollama pull llava-llama3</code>)</li>
                <li>Essayez un modèle alternatif comme llava:7b ou bakllava</li>
                <li>Réduisez la taille des images (moins de 1024x1024 pixels)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionPage;

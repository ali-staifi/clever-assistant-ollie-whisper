
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Film, Video, VolumeX, Volume2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useVisionService } from '@/hooks/useVisionService';
import { useSpeechSynthesis } from '@/hooks/jarvis/useSpeechSynthesis';
import { SpeechService } from '@/services/SpeechService';
import { useToast } from '@/hooks/use-toast';

interface VideoAnalyzerProps {
  ollamaUrl?: string;
  speechService?: SpeechService;
  selectedModel?: string;
}

const MAX_VIDEO_SIZE = 1024 * 1024 * 30; // 30MB max
const MAX_VIDEO_DURATION = 60; // 60 secondes max

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ 
  ollamaUrl = 'http://localhost:11434',
  speechService,
  selectedModel = 'llava-llama3'
}) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Décris ce qui se passe dans cette vidéo.");
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<{size: number, duration: number | null}>({size: 0, duration: null});
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Utiliser le service de vision
  const { 
    analyzeVideo, 
    isAnalyzing, 
    error,
    setModel
  } = useVisionService(ollamaUrl);
  
  // Utiliser le service de synthèse vocale
  const { 
    isSpeaking, 
    speak, 
    toggleSpeaking 
  } = useSpeechSynthesis(speechService);
  
  // Mettre à jour le modèle lorsqu'il change
  useEffect(() => {
    console.log(`Setting LLaVA model to: ${selectedModel}`);
    setModel(selectedModel);
  }, [selectedModel, setModel]);
  
  // Détecter la durée de la vidéo
  useEffect(() => {
    if (videoRef.current && videoPreview) {
      const loadedMetadataHandler = () => {
        if (videoRef.current) {
          const duration = videoRef.current.duration;
          console.log(`Video duration: ${duration} seconds`);
          setVideoInfo(prev => ({...prev, duration}));
          
          if (duration > MAX_VIDEO_DURATION) {
            toast({
              title: "Vidéo trop longue",
              description: `La durée de la vidéo (${duration.toFixed(1)}s) dépasse la limite recommandée de ${MAX_VIDEO_DURATION}s. L'analyse pourrait être lente.`,
              variant: "default"
            });
          }
        }
      };
      
      videoRef.current.addEventListener('loadedmetadata', loadedMetadataHandler);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', loadedMetadataHandler);
        }
      };
    }
  }, [videoPreview, toast]);
  
  // Gérer la sélection de la vidéo
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille du fichier
      if (file.size > MAX_VIDEO_SIZE) {
        toast({
          title: "Vidéo trop volumineuse",
          description: `La taille de la vidéo (${(file.size/1024/1024).toFixed(2)}MB) dépasse la limite de ${MAX_VIDEO_SIZE/1024/1024}MB.`,
          variant: "destructive"
        });
        return;
      }
      
      setSelectedVideo(file);
      setVideoInfo({size: file.size, duration: null});
      
      // Créer un aperçu de la vidéo
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };
  
  // Analyser la vidéo
  const handleAnalyzeClick = async () => {
    if (!selectedVideo) return;
    
    // Avertissement pour les vidéos longues
    if (videoInfo.duration && videoInfo.duration > MAX_VIDEO_DURATION) {
      const confirmed = window.confirm(
        `La vidéo dure ${videoInfo.duration.toFixed(1)} secondes, ce qui dépasse la limite recommandée. L'analyse pourrait prendre du temps. Voulez-vous continuer?`
      );
      if (!confirmed) return;
    }
    
    try {
      // Extraire un nombre d'images adapté à la durée
      const frameCount = videoInfo.duration 
        ? Math.min(5, Math.max(2, Math.ceil(videoInfo.duration / 15)))  // 1 image toutes les 15s, min 2, max 5
        : 3;  // Par défaut, 3 images
      
      const results = await analyzeVideo(selectedVideo, prompt, frameCount);
      setDescriptions(results);
      
      // Combiner les descriptions pour une vue d'ensemble
      const combinedDescription = results.join('\n\nSuivante image:\n\n');
      setCurrentDescription(combinedDescription);
      
      toast({
        title: "Analyse terminée",
        description: `${results.length} images de la vidéo ont été analysées.`,
        variant: "default"
      });
    } catch (err) {
      console.error("Erreur lors de l'analyse:", err);
    }
  };
  
  // Lire la description à voix haute
  const handleSpeakClick = async () => {
    if (isSpeaking) {
      toggleSpeaking();
    } else if (currentDescription) {
      await speak(currentDescription);
    }
  };
  
  return (
    <Card className="p-6 space-y-4 overflow-visible">
      <h2 className="text-xl font-semibold">Analyse de Vidéo avec Video-LLaVA</h2>
      
      {/* Informations sur le modèle */}
      <div className="text-sm text-muted-foreground">
        Utilisation du modèle: <span className="font-medium">{selectedModel}</span>
      </div>
      
      {/* Sélection de la vidéo */}
      <div className="space-y-2">
        <label htmlFor="video-upload" className="block text-sm font-medium">
          Sélectionner une vidéo à analyser
        </label>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('video-upload')?.click()}
            className="flex items-center gap-2"
          >
            <Film className="h-4 w-4" />
            Choisir une vidéo
          </Button>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>
        
        {/* Afficher les infos sur la vidéo */}
        {videoInfo.size > 0 && (
          <div className="text-xs text-muted-foreground">
            Taille: {(videoInfo.size / 1024 / 1024).toFixed(2)} MB
            {videoInfo.duration && `, Durée: ${videoInfo.duration.toFixed(1)}s`}
            
            {videoInfo.duration && videoInfo.duration > 30 && (
              <span className="ml-1 text-amber-500">
                (vidéo longue - peut être lente à analyser)
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Aperçu de la vidéo */}
      {videoPreview && (
        <div className="border rounded-md p-2">
          <video 
            ref={videoRef}
            src={videoPreview} 
            controls
            className="max-h-60 w-full"
          />
        </div>
      )}
      
      {/* Prompt personnalisé */}
      <div className="space-y-2">
        <label htmlFor="video-prompt" className="block text-sm font-medium">
          Instructions pour l'analyse
        </label>
        <Textarea
          id="video-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décris ce qui se passe dans cette vidéo..."
          className="min-h-[80px]"
        />
      </div>
      
      {/* Bouton d'analyse */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleAnalyzeClick} 
          disabled={!selectedVideo || isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
          {isAnalyzing ? "Analyse en cours..." : "Analyser la vidéo"}
        </Button>
        
        {currentDescription && (
          <Button
            variant="outline"
            onClick={handleSpeakClick}
            className="flex items-center gap-2"
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isSpeaking ? "Arrêter la lecture" : "Lire la description"}
          </Button>
        )}
      </div>
      
      {/* Résultat de l'analyse */}
      {descriptions.length > 0 && (
        <div className="mt-4 p-4 border rounded-md bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Description de la vidéo:</h3>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {descriptions.map((desc, index) => (
              <div key={index} className="p-2 border-b border-gray-200 last:border-b-0">
                <h4 className="font-medium text-sm">Image {index + 1}:</h4>
                <p className="text-sm whitespace-pre-wrap">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Affichage des erreurs */}
      {error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50 text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Erreur:</h3>
          </div>
          <p className="text-sm">{error}</p>
          
          <div className="mt-4 text-sm">
            <p className="font-medium">Solutions possibles:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Vérifiez que le serveur Ollama est en cours d'exécution à l'adresse: <code>{ollamaUrl}</code></li>
              <li>Assurez-vous que le modèle <code>{selectedModel}</code> est installé sur votre serveur Ollama</li>
              <li>Essayez avec une vidéo plus courte ou de résolution inférieure</li>
              <li>Essayez un autre modèle comme llava:7b ou bakllava</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VideoAnalyzer;


import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Film, Video, VolumeX, Volume2 } from "lucide-react";
import { useVisionService } from '@/hooks/useVisionService';
import { useSpeechSynthesis } from '@/hooks/jarvis/useSpeechSynthesis';
import { SpeechService } from '@/services/SpeechService';

interface VideoAnalyzerProps {
  ollamaUrl?: string;
  speechService?: SpeechService;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ 
  ollamaUrl = 'http://localhost:11434',
  speechService 
}) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Décris ce qui se passe dans cette vidéo.");
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [currentDescription, setCurrentDescription] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Utiliser le service de vision
  const { 
    analyzeVideo, 
    isAnalyzing, 
    error 
  } = useVisionService(ollamaUrl);
  
  // Utiliser le service de synthèse vocale
  const { 
    isSpeaking, 
    speak, 
    toggleSpeaking 
  } = useSpeechSynthesis(speechService);
  
  // Gérer la sélection de la vidéo
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedVideo(file);
      
      // Créer un aperçu de la vidéo
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };
  
  // Analyser la vidéo
  const handleAnalyzeClick = async () => {
    if (!selectedVideo) return;
    
    try {
      const results = await analyzeVideo(selectedVideo, prompt);
      setDescriptions(results);
      
      // Combiner les descriptions pour une vue d'ensemble
      const combinedDescription = results.join('\n\nSuivante image:\n\n');
      setCurrentDescription(combinedDescription);
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
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Analyse de Vidéo avec Video-LLaVA</h2>
      
      {/* Sélection de la vidéo */}
      <div className="space-y-2">
        <label htmlFor="video-upload" className="block text-sm font-medium text-gray-700">
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
        <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-700">
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
      <div className="flex space-x-2">
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
          <h3 className="font-medium mb-2">Description de la vidéo:</h3>
          <div className="space-y-4">
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
          <h3 className="font-medium mb-2">Erreur:</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </Card>
  );
};

export default VideoAnalyzer;

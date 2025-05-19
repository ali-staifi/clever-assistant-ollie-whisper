
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, VolumeX, Volume2 } from "lucide-react";
import { useVisionService } from '@/hooks/useVisionService';
import { useSpeechSynthesis } from '@/hooks/jarvis/useSpeechSynthesis';
import { SpeechService } from '@/services/SpeechService';

interface ImageAnalyzerProps {
  ollamaUrl?: string;
  speechService?: SpeechService;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ 
  ollamaUrl = 'http://localhost:11434',
  speechService 
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Décris cette image en détail.");
  
  // Utiliser le service de vision
  const { 
    analyzeImage, 
    isAnalyzing, 
    description, 
    error 
  } = useVisionService(ollamaUrl);
  
  // Utiliser le service de synthèse vocale
  const { 
    isSpeaking, 
    speak, 
    toggleSpeaking 
  } = useSpeechSynthesis(speechService);
  
  // Gérer le sélection de l'image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Analyser l'image
  const handleAnalyzeClick = async () => {
    if (!selectedImage) return;
    
    try {
      await analyzeImage(selectedImage, prompt);
    } catch (err) {
      console.error("Erreur lors de l'analyse:", err);
    }
  };
  
  // Lire la description à voix haute
  const handleSpeakClick = async () => {
    if (isSpeaking) {
      toggleSpeaking();
    } else if (description) {
      await speak(description);
    }
  };
  
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Analyse d'Image avec LLaVA</h2>
      
      {/* Sélection de l'image */}
      <div className="space-y-2">
        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
          Sélectionner une image à analyser
        </label>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('image-upload')?.click()}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Choisir une image
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>
      
      {/* Aperçu de l'image */}
      {imagePreview && (
        <div className="border rounded-md p-2">
          <img 
            src={imagePreview} 
            alt="Aperçu" 
            className="max-h-60 mx-auto object-contain"
          />
        </div>
      )}
      
      {/* Prompt personnalisé */}
      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Instructions pour l'analyse
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décris cette image en détail..."
          className="min-h-[80px]"
        />
      </div>
      
      {/* Bouton d'analyse */}
      <div className="flex space-x-2">
        <Button 
          onClick={handleAnalyzeClick} 
          disabled={!selectedImage || isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
          {isAnalyzing ? "Analyse en cours..." : "Analyser l'image"}
        </Button>
        
        {description && (
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
      {description && (
        <div className="mt-4 p-4 border rounded-md bg-muted/50">
          <h3 className="font-medium mb-2">Description:</h3>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
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

export default ImageAnalyzer;

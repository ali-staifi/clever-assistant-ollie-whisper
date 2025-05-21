
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, VolumeX, Volume2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useVisionService } from '@/hooks/useVisionService';
import { useSpeechSynthesis } from '@/hooks/jarvis/useSpeechSynthesis';
import { SpeechService } from '@/services/SpeechService';
import { useToast } from '@/hooks/use-toast';

interface ImageAnalyzerProps {
  ollamaUrl?: string;
  speechService?: SpeechService;
  selectedModel?: string;
}

const MAX_IMAGE_SIZE = 1024 * 1024 * 5; // 5MB max
const MAX_DIMENSIONS = 1024; // 1024px max dimension

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ 
  ollamaUrl = 'http://localhost:11434',
  speechService,
  selectedModel = 'llava-llama3'
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Décris cette image en détail.");
  const [imageSize, setImageSize] = useState<number>(0);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const { toast } = useToast();
  
  // Utiliser le service de vision
  const { 
    analyzeImage, 
    isAnalyzing, 
    description, 
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
  
  // Gérer la sélection de l'image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille du fichier
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "Image trop volumineuse",
          description: `La taille de l'image (${(file.size/1024/1024).toFixed(2)}MB) dépasse la limite de ${MAX_IMAGE_SIZE/1024/1024}MB.`,
          variant: "destructive"
        });
        return;
      }
      
      setSelectedImage(file);
      setImageSize(file.size);
      
      // Créer un aperçu de l'image et vérifier ses dimensions
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          setImagePreview(result);
          
          // Vérifier les dimensions de l'image
          const img = new Image();
          img.onload = () => {
            setImageDimensions({
              width: img.width,
              height: img.height
            });
            
            if (img.width > MAX_DIMENSIONS || img.height > MAX_DIMENSIONS) {
              toast({
                title: "Image de grande taille",
                description: `Les dimensions de l'image (${img.width}x${img.height}) peuvent ralentir l'analyse. Nous recommandons des images plus petites.`,
                variant: "default"
              });
            }
          };
          img.src = result;
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
    <Card className="p-6 space-y-4 overflow-visible">
      <h2 className="text-xl font-semibold">Analyse d'Image avec LLaVA</h2>
      
      {/* Informations sur le modèle */}
      <div className="text-sm text-muted-foreground">
        Utilisation du modèle: <span className="font-medium">{selectedModel}</span>
      </div>
      
      {/* Sélection de l'image */}
      <div className="space-y-2">
        <label htmlFor="image-upload" className="block text-sm font-medium">
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
        
        {/* Afficher les infos sur l'image */}
        {imageSize > 0 && (
          <div className="text-xs text-muted-foreground">
            Taille: {(imageSize / 1024).toFixed(1)} KB
            {imageDimensions && `, Dimensions: ${imageDimensions.width}x${imageDimensions.height}`}
            
            {imageDimensions && (imageDimensions.width > 800 || imageDimensions.height > 800) && (
              <span className="ml-1 text-amber-500">
                (grande image - peut être lente à analyser)
              </span>
            )}
          </div>
        )}
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
        <label htmlFor="prompt" className="block text-sm font-medium">
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
      <div className="flex flex-wrap gap-2">
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
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Description:</h3>
          </div>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
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
              <li>Essayez avec une image de plus petite taille ou de résolution inférieure</li>
              <li>Essayez un autre modèle comme llava:7b ou bakllava</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ImageAnalyzer;

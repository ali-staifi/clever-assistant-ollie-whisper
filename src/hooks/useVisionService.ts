
import { useState, useRef, useEffect } from 'react';
import { VisionOllamaService } from '@/services/ollama/VisionOllamaService';
import { LLaVAService } from '@/services/vision/LLaVAService';
import { useToast } from '@/hooks/use-toast';

export const useVisionService = (ollamaUrl = 'http://localhost:11434') => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Services
  const visionServiceRef = useRef(new VisionOllamaService(ollamaUrl));
  const llavaServiceRef = useRef(new LLaVAService(visionServiceRef.current));
  
  // Gestion du modèle
  const [modelName, setModelName] = useState('llava-llama3');
  
  // Handle URL changes
  useEffect(() => {
    visionServiceRef.current.setBaseUrl(ollamaUrl);
  }, [ollamaUrl]);
  
  // Méthode pour définir le modèle
  const setModel = (model: string) => {
    setModelName(model);
    visionServiceRef.current.setModel(model);
    llavaServiceRef.current.setModel(model);
  };
  
  // Vérifier si un modèle est disponible
  const checkModelAvailability = async () => {
    const isAvailable = await llavaServiceRef.current.checkModelAvailability();
    if (!isAvailable) {
      // Essayer de trouver un modèle alternatif
      const alternativeModel = await llavaServiceRef.current.tryAlternativeModels();
      if (alternativeModel) {
        toast({
          title: "Modèle alternatif trouvé",
          description: `Le modèle ${modelName} n'est pas disponible, utilisation de ${alternativeModel} à la place.`
        });
        setModel(alternativeModel);
        return true;
      } else {
        toast({
          title: "Modèle non disponible",
          description: `Le modèle ${modelName} n'est pas disponible. Veuillez installer un modèle LLaVA avec Ollama.`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };
  
  // Analyse d'image avec gestion d'erreurs améliorée
  const analyzeImage = async (imageFile: File | string, prompt?: string): Promise<string> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Vérifier la disponibilité du modèle
      await checkModelAvailability();
      
      let base64Image: string;
      
      // Convertir le fichier en base64 si nécessaire
      if (typeof imageFile === 'string') {
        base64Image = imageFile;
      } else {
        base64Image = await fileToBase64(imageFile);
      }
      
      // Analyser l'image
      const result = await llavaServiceRef.current.analyzeImage(base64Image, prompt);
      setDescription(result);
      
      toast({
        title: "Analyse d'image terminée",
        description: "L'image a été analysée avec succès."
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setError(errorMessage);
      
      toast({
        title: "Erreur d'analyse d'image",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Analyse de vidéo (extraction d'images clés)
  const analyzeVideo = async (videoFile: File, prompt?: string, frameCount: number = 5): Promise<string[]> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Vérifier la disponibilité du modèle
      await checkModelAvailability();
      
      // Extraire des images de la vidéo
      const frames = await extractVideoFrames(videoFile, frameCount);
      
      // Analyser chaque image
      const results = await llavaServiceRef.current.analyzeVideo(frames, prompt);
      
      toast({
        title: "Analyse de vidéo terminée",
        description: `${results.length} images de la vidéo ont été analysées.`
      });
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setError(errorMessage);
      
      toast({
        title: "Erreur d'analyse de vidéo",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Utilitaire - Conversion de fichier en base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extraire seulement la partie base64 si c'est une data URL
          const base64Content = reader.result.split(',')[1];
          resolve(base64Content);
        } else {
          reject(new Error("Impossible de convertir le fichier en base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Extraction d'images d'une vidéo
  const extractVideoFrames = async (videoFile: File, frameCount: number = 5): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(videoFile);
      const frames: string[] = [];
      
      video.onloadedmetadata = () => {
        // Calculer les intervalles d'extraction
        const duration = video.duration;
        const interval = duration / (frameCount + 1);
        let currentFrame = 1;
        
        const captureFrame = () => {
          if (currentFrame > frameCount) {
            URL.revokeObjectURL(url);
            resolve(frames);
            return;
          }
          
          // Positionner la vidéo
          video.currentTime = currentFrame * interval;
          currentFrame++;
        };
        
        video.onseeked = () => {
          try {
            // Capturer l'image
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(video.videoWidth, 1024); // Limiter la largeur à 1024px max
            canvas.height = Math.min(video.videoHeight, 1024); // Limiter la hauteur à 1024px max
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Dessiner l'image redimensionnée
              ctx.drawImage(
                video, 
                0, 0, video.videoWidth, video.videoHeight, 
                0, 0, canvas.width, canvas.height
              );
              const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
              frames.push(base64Image);
              console.log(`Frame ${currentFrame-1} captured (${canvas.width}x${canvas.height})`);
            }
          } catch (err) {
            console.error("Erreur lors de la capture d'image:", err);
          }
          
          captureFrame();
        };
        
        captureFrame();
      };
      
      video.onerror = (e) => {
        console.error("Erreur vidéo:", e);
        URL.revokeObjectURL(url);
        reject(new Error("Erreur lors du chargement de la vidéo"));
      };
      
      video.src = url;
      video.load();
    });
  };
  
  return {
    analyzeImage,
    analyzeVideo,
    isAnalyzing,
    description,
    error,
    setModel,
    modelName,
    checkModelAvailability,
    visionService: visionServiceRef.current,
    llavaService: llavaServiceRef.current
  };
};

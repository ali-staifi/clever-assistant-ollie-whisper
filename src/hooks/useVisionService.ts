
import { useState, useRef } from 'react';
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
  
  const setModel = (model: string) => {
    setModelName(model);
    visionServiceRef.current.setModel(model);
    llavaServiceRef.current.setModel(model);
  };
  
  // Analyse d'image
  const analyzeImage = async (imageFile: File | string, prompt?: string): Promise<string> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
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
  const analyzeVideo = async (videoFile: File, prompt?: string): Promise<string[]> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Extraire des images de la vidéo
      const frames = await extractVideoFrames(videoFile, 5); // 5 images clés
      
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
          // Capturer l'image
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            frames.push(base64Image);
          }
          
          captureFrame();
        };
        
        captureFrame();
      };
      
      video.onerror = () => {
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
    visionService: visionServiceRef.current,
    llavaService: llavaServiceRef.current
  };
};

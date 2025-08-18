import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { pipeline, env } from '@huggingface/transformers';
import { useToast } from '@/hooks/use-toast';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedUrl: string;
  timestamp: string;
  processingTime: number;
}

export const BackgroundRemover: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [deviceSupport, setDeviceSupport] = useState<'webgpu' | 'cpu' | 'unsupported'>('cpu');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const segmenterRef = useRef<any>(null);
  
  const { toast } = useToast();

  // Redimensionner l'image si nécessaire
  const resizeImageIfNeeded = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {
    let width = image.naturalWidth;
    let height = image.naturalHeight;

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
      return true;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);
    return false;
  };

  // Charger une image depuis un fichier
  const loadImage = (file: Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Initialiser le segmenteur
  const initializeSegmenter = useCallback(async () => {
    if (segmenterRef.current) return;
    
    setIsLoading(true);
    try {
      // Vérifier le support WebGPU
      let device = 'cpu';
      if ('gpu' in navigator) {
        try {
          const adapter = await (navigator as any).gpu?.requestAdapter();
          if (adapter) {
            device = 'webgpu';
            setDeviceSupport('webgpu');
          }
        } catch (e) {
          console.log('WebGPU non disponible, utilisation du CPU');
        }
      }

      // Initialiser le pipeline de segmentation
      segmenterRef.current = await pipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: device as 'webgpu' | 'cpu' }
      );

      toast({
        title: "Segmenteur initialisé",
        description: `Utilisation: ${device === 'webgpu' ? 'WebGPU (accéléré)' : 'CPU'}`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setDeviceSupport('unsupported');
      toast({
        title: "Erreur d'initialisation",
        description: "Impossible d'initialiser le segmenteur d'images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Supprimer l'arrière-plan
  const removeBackground = useCallback(async (imageElement: HTMLImageElement): Promise<Blob> => {
    try {
      console.log('Démarrage du processus de suppression d\'arrière-plan...');
      
      if (!segmenterRef.current) {
        await initializeSegmenter();
      }
      
      // Convertir HTMLImageElement en canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Impossible d\'obtenir le contexte canvas');
      
      // Redimensionner l'image si nécessaire
      const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
      console.log(`Image ${wasResized ? 'redimensionnée' : 'non redimensionnée'}. Dimensions finales: ${canvas.width}x${canvas.height}`);
      
      // Obtenir les données d'image en base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Image convertie en base64');
      
      // Traiter l'image avec le modèle de segmentation
      console.log('Traitement avec le modèle de segmentation...');
      const result = await segmenterRef.current(imageData);
      
      console.log('Résultat de segmentation:', result);
      
      if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
        throw new Error('Résultat de segmentation invalide');
      }
      
      // Créer un nouveau canvas pour l'image masquée
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) throw new Error('Impossible d\'obtenir le contexte canvas de sortie');
      
      // Dessiner l'image originale
      outputCtx.drawImage(canvas, 0, 0);
      
      // Appliquer le masque
      const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const data = outputImageData.data;
      
      // Appliquer le masque inversé au canal alpha
      for (let i = 0; i < result[0].mask.data.length; i++) {
        // Inverser la valeur du masque (1 - valeur) pour garder le sujet au lieu de l'arrière-plan
        const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
        data[i * 4 + 3] = alpha;
      }
      
      outputCtx.putImageData(outputImageData, 0, 0);
      console.log('Masque appliqué avec succès');
      
      // Convertir le canvas en blob
      return new Promise((resolve, reject) => {
        outputCanvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('Blob final créé avec succès');
              resolve(blob);
            } else {
              reject(new Error('Échec de la création du blob'));
            }
          },
          'image/png',
          1.0
        );
      });
    } catch (error) {
      console.error('Erreur lors de la suppression d\'arrière-plan:', error);
      throw error;
    }
  }, [initializeSegmenter]);

  // Traiter le fichier uploadé
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // Charger l'image
      const imageElement = await loadImage(file);
      
      // Supprimer l'arrière-plan
      const processedBlob = await removeBackground(imageElement);
      
      const processingTime = Date.now() - startTime;
      
      // Créer les URLs
      const originalUrl = URL.createObjectURL(file);
      const processedUrl = URL.createObjectURL(processedBlob);
      
      const processedImage: ProcessedImage = {
        id: Date.now().toString(),
        originalFile: file,
        originalUrl,
        processedUrl,
        timestamp: new Date().toLocaleString(),
        processingTime
      };
      
      setProcessedImages(prev => [processedImage, ...prev]);
      
      toast({
        title: "Arrière-plan supprimé",
        description: `Traitement terminé en ${processingTime}ms`,
      });
    } catch (error) {
      console.error('Erreur de traitement:', error);
      toast({
        title: "Erreur de traitement",
        description: "Impossible de supprimer l'arrière-plan",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [removeBackground, toast]);

  // Gérer le changement de fichier
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset l'input pour permettre de re-sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileUpload]);

  // Télécharger l'image traitée
  const downloadImage = useCallback((processedImage: ProcessedImage) => {
    const a = document.createElement('a');
    a.href = processedImage.processedUrl;
    a.download = `no-bg-${processedImage.originalFile.name.replace(/\.[^/.]+$/, '')}.png`;
    a.click();
  }, []);

  // Supprimer une image traitée
  const removeProcessedImage = useCallback((id: string) => {
    setProcessedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Nettoyer les URLs
      const toRemove = prev.find(img => img.id === id);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.originalUrl);
        URL.revokeObjectURL(toRemove.processedUrl);
      }
      return updated;
    });
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🖼️ Suppression d'Arrière-plan IA</span>
            <div className="flex items-center space-x-2">
              <Badge variant={deviceSupport === 'webgpu' ? 'default' : 'secondary'}>
                {deviceSupport === 'webgpu' && '⚡ WebGPU'}
                {deviceSupport === 'cpu' && '🖥️ CPU'}
                {deviceSupport === 'unsupported' && '❌ Non supporté'}
              </Badge>
              {!segmenterRef.current && (
                <Button 
                  onClick={initializeSegmenter} 
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  {isLoading ? 'Initialisation...' : 'Initialiser'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zone d'upload */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isProcessing || !segmenterRef.current}
            />
            <div className="space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || !segmenterRef.current}
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Traitement...' : 'Choisir une image'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Formats supportés: JPG, PNG, WebP
              </p>
            </div>
          </div>

          {/* Status de traitement */}
          {isProcessing && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="animate-pulse">🤖 Suppression de l'arrière-plan en cours...</div>
            </div>
          )}

          {/* Images traitées */}
          {processedImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Images traitées ({processedImages.length})</h3>
                <Button
                  onClick={() => {
                    processedImages.forEach(img => {
                      URL.revokeObjectURL(img.originalUrl);
                      URL.revokeObjectURL(img.processedUrl);
                    });
                    setProcessedImages([]);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Effacer tout
                </Button>
              </div>

              <div className="grid gap-4">
                {processedImages.map((processedImage) => (
                  <Card key={processedImage.id} className="p-4">
                    <div className="space-y-3">
                      {/* Comparaison avant/après */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Original</p>
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={processedImage.originalUrl}
                              alt="Original"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Sans arrière-plan</p>
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                            <img
                              src={processedImage.processedUrl}
                              alt="Processed"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions et métadonnées */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Fichier: {processedImage.originalFile.name}</div>
                          <div>Traité en: {processedImage.processingTime}ms</div>
                          <div>Date: {processedImage.timestamp}</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => downloadImage(processedImage)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Télécharger
                          </Button>
                          <Button
                            onClick={() => removeProcessedImage(processedImage.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Informations sur les capacités */}
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div>🚀 <strong>Local:</strong> Traitement dans le navigateur</div>
              <div>⚡ <strong>WebGPU:</strong> Accélération matérielle</div>
              <div>🔒 <strong>Privé:</strong> Aucune donnée envoyée</div>
              <div>🎯 <strong>Précis:</strong> IA de segmentation avancée</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
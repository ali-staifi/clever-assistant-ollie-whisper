import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Square, Download } from 'lucide-react';
import { pipeline, env } from '@huggingface/transformers';
import { useToast } from '@/hooks/use-toast';

// Configure transformers.js pour télécharger les modèles
env.allowLocalModels = false;
env.useBrowserCache = true;

interface TranscriptionResult {
  text: string;
  timestamp: string;
  duration?: number;
}

export const LocalWhisperTranscriber: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [deviceSupport, setDeviceSupport] = useState<'webgpu' | 'cpu' | 'unsupported'>('cpu');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriberRef = useRef<any>(null);
  
  const { toast } = useToast();

  // Initialiser le transcripteur avec WebGPU si possible
  const initializeTranscriber = useCallback(async () => {
    if (transcriberRef.current) return;
    
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

      // Initialiser le pipeline Whisper
      transcriberRef.current = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny.en',
        { device: device as 'webgpu' | 'cpu' }
      );

      toast({
        title: "Transcripteur initialisé",
        description: `Utilisation: ${device === 'webgpu' ? 'WebGPU (accéléré)' : 'CPU'}`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setDeviceSupport('unsupported');
      toast({
        title: "Erreur d'initialisation",
        description: "Impossible d'initialiser le transcripteur local",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        
        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Enregistrement démarré",
        description: "Parlez maintenant...",
      });
    } catch (error) {
      console.error('Erreur microphone:', error);
      toast({
        title: "Erreur microphone",
        description: "Impossible d'accéder au microphone",
        variant: "destructive",
      });
    }
  }, []);

  // Arrêter l'enregistrement
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Transcrire l'audio
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (!transcriberRef.current) {
      await initializeTranscriber();
    }
    
    setIsTranscribing(true);
    const startTime = Date.now();
    
    try {
      // Convertir le blob en URL pour le pipeline
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Transcrire avec Whisper
      const result = await transcriberRef.current(audioUrl);
      const duration = Date.now() - startTime;
      
      const transcription: TranscriptionResult = {
        text: result.text || 'Aucun texte détecté',
        timestamp: new Date().toLocaleTimeString(),
        duration
      };
      
      setTranscriptions(prev => [transcription, ...prev]);
      
      // Nettoyer l'URL
      URL.revokeObjectURL(audioUrl);
      
      toast({
        title: "Transcription terminée",
        description: `Durée: ${duration}ms`,
      });
    } catch (error) {
      console.error('Erreur transcription:', error);
      toast({
        title: "Erreur de transcription",
        description: "Impossible de transcrire l'audio",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  }, [initializeTranscriber, toast]);

  // Exporter les transcriptions
  const exportTranscriptions = useCallback(() => {
    const data = JSON.stringify(transcriptions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcriptions_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }, [transcriptions]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🎤 Transcription Whisper Locale</span>
            <div className="flex items-center space-x-2">
              <Badge variant={deviceSupport === 'webgpu' ? 'default' : 'secondary'}>
                {deviceSupport === 'webgpu' && '⚡ WebGPU'}
                {deviceSupport === 'cpu' && '🖥️ CPU'}
                {deviceSupport === 'unsupported' && '❌ Non supporté'}
              </Badge>
              {!transcriberRef.current && (
                <Button 
                  onClick={initializeTranscriber} 
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
          {/* Contrôles d'enregistrement */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!transcriberRef.current || isTranscribing}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="min-w-[200px]"
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Arrêter l'enregistrement
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Commencer l'enregistrement
                </>
              )}
            </Button>
          </div>

          {/* Status de transcription */}
          {isTranscribing && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="animate-pulse">🤖 Transcription en cours...</div>
            </div>
          )}

          {/* Historique des transcriptions */}
          {transcriptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transcriptions ({transcriptions.length})</h3>
                <Button onClick={exportTranscriptions} size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {transcriptions.map((transcription, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{transcription.text}</p>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                          <span>{transcription.timestamp}</span>
                          {transcription.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {transcription.duration}ms
                            </Badge>
                          )}
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
              <div>🚀 <strong>Locale:</strong> Pas d'envoi de données</div>
              <div>⚡ <strong>WebGPU:</strong> Accélération matérielle</div>
              <div>🌍 <strong>Offline:</strong> Fonctionne sans internet</div>
              <div>🔒 <strong>Privé:</strong> Transcription dans le navigateur</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { VADService } from './VADService';
import { SpeechService } from '../SpeechService';

export type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface ConversationCallbacks {
  onStateChange: (state: ConversationState) => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onResponse: (text: string) => void;
  onError: (error: string) => void;
  onVolumeChange: (volume: number) => void;
}

export class ContinuousConversationService {
  private vadService: VADService;
  private speechService: SpeechService;
  private callbacks: ConversationCallbacks;
  private state: ConversationState = 'idle';
  private isEnabled: boolean = false;
  private currentStream: MediaStream | null = null;
  private autoReactivateAfterSpeech: boolean = true;
  private conversationTimeout: number | null = null;

  constructor(speechService: SpeechService, callbacks: ConversationCallbacks) {
    this.speechService = speechService;
    this.callbacks = callbacks;
    
    this.vadService = new VADService({
      sensitivity: 1.5,
      silenceThreshold: 25,
      speechThreshold: 45,
      onSpeechStart: () => this.handleSpeechStart(),
      onSpeechEnd: () => this.handleSpeechEnd(),
      onVolumeChange: (volume) => this.callbacks.onVolumeChange(volume)
    });
  }

  async startContinuousListening(): Promise<boolean> {
    try {
      console.log('Démarrage de la conversation continue...');
      
      // Demander accès au microphone avec paramètres optimisés
      this.currentStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        }
      });

      // Initialiser VAD
      const vadSuccess = await this.vadService.initialize(this.currentStream);
      if (!vadSuccess) {
        throw new Error('Impossible d\'initialiser la détection vocale');
      }

      this.isEnabled = true;
      this.setState('listening');
      
      console.log('Conversation continue activée');
      return true;
    } catch (error) {
      console.error('Erreur lors du démarrage de la conversation continue:', error);
      this.callbacks.onError(`Erreur microphone: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return false;
    }
  }

  stopContinuousListening(): void {
    console.log('Arrêt de la conversation continue...');
    
    this.isEnabled = false;
    this.vadService.stop();
    
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
    
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout);
      this.conversationTimeout = null;
    }
    
    this.speechService.stopListening();
    this.setState('idle');
  }

  private handleSpeechStart(): void {
    if (!this.isEnabled || this.state !== 'listening') return;
    
    console.log('Parole détectée - démarrage de la reconnaissance...');
    
    // Démarrer la reconnaissance vocale
    const success = this.speechService.startListening(
      (interimText) => {
        this.callbacks.onTranscript(interimText, false);
      },
      (finalText) => {
        this.callbacks.onTranscript(finalText, true);
        this.processFinalTranscript(finalText);
      },
      (error) => {
        console.error('Erreur reconnaissance vocale:', error);
        this.callbacks.onError(error);
        this.reactivateListening();
      }
    );

    if (!success) {
      console.error('Impossible de démarrer la reconnaissance vocale');
      this.reactivateListening();
    }
  }

  private handleSpeechEnd(): void {
    if (!this.isEnabled) return;
    
    console.log('Fin de parole détectée');
    
    // Arrêter la reconnaissance après un court délai pour capturer la fin
    setTimeout(() => {
      if (this.state === 'listening') {
        this.speechService.stopListening();
      }
    }, 500);
  }

  private async processFinalTranscript(text: string): Promise<void> {
    if (!text.trim()) {
      console.log('Transcript vide, réactivation de l\'écoute');
      this.reactivateListening();
      return;
    }

    console.log('Traitement du transcript:', text);
    this.setState('processing');

    try {
      // Ici, vous pouvez intégrer le traitement Ollama
      this.callbacks.onResponse(text);
      
      // Simuler une réponse pour l'instant
      await this.speakResponse(`Vous avez dit: ${text}`);
      
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      this.callbacks.onError(`Erreur de traitement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      this.reactivateListening();
    }
  }

  private async speakResponse(text: string): Promise<void> {
    this.setState('speaking');
    
    try {
      await this.speechService.speak(text, () => {
        console.log('Fin de synthèse vocale');
        this.reactivateListening();
      });
    } catch (error) {
      console.error('Erreur synthèse vocale:', error);
      this.reactivateListening();
    }
  }

  private reactivateListening(): void {
    if (!this.isEnabled || !this.autoReactivateAfterSpeech) return;
    
    // Petit délai avant de réactiver l'écoute
    this.conversationTimeout = window.setTimeout(() => {
      if (this.isEnabled) {
        console.log('Réactivation de l\'écoute...');
        this.setState('listening');
      }
    }, 1000);
  }

  private setState(newState: ConversationState): void {
    if (this.state !== newState) {
      console.log(`État conversation: ${this.state} -> ${newState}`);
      this.state = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  // Méthodes publiques pour contrôler le service
  getState(): ConversationState {
    return this.state;
  }

  isActive(): boolean {
    return this.isEnabled;
  }

  updateVADSettings(settings: { sensitivity?: number }): void {
    if (settings.sensitivity !== undefined) {
      this.vadService.updateSettings({
        sensitivity: settings.sensitivity,
        speechThreshold: 30 + (settings.sensitivity * 20),
        silenceThreshold: 20 + (settings.sensitivity * 10)
      });
    }
  }

  setAutoReactivate(enabled: boolean): void {
    this.autoReactivateAfterSpeech = enabled;
  }

  // Méthode pour forcer l'écoute manuelle
  triggerManualListening(): void {
    if (this.isEnabled && this.state === 'listening') {
      this.handleSpeechStart();
    }
  }
}

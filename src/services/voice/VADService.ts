
export class VADService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isActive: boolean = false;
  private sensitivity: number = 0.3;
  private silenceThreshold: number = 30;
  private speechThreshold: number = 40;
  private silenceTime: number = 0;
  private speechTime: number = 0;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onVolumeChange?: (volume: number) => void;

  constructor(options?: {
    sensitivity?: number;
    silenceThreshold?: number;
    speechThreshold?: number;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onVolumeChange?: (volume: number) => void;
  }) {
    if (options) {
      this.sensitivity = options.sensitivity ?? this.sensitivity;
      this.silenceThreshold = options.silenceThreshold ?? this.silenceThreshold;
      this.speechThreshold = options.speechThreshold ?? this.speechThreshold;
      this.onSpeechStart = options.onSpeechStart;
      this.onSpeechEnd = options.onSpeechEnd;
      this.onVolumeChange = options.onVolumeChange;
    }
  }

  async initialize(stream: MediaStream): Promise<boolean> {
    try {
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isActive = true;
      
      this.detectVoiceActivity();
      return true;
    } catch (error) {
      console.error('Erreur VAD initialization:', error);
      return false;
    }
  }

  private detectVoiceActivity(): void {
    if (!this.isActive || !this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calcul du volume moyen avec emphase sur les fréquences vocales (300-3000 Hz)
    let sum = 0;
    let voiceSum = 0;
    let voiceCount = 0;
    
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const binSize = sampleRate / this.analyser.fftSize;
    
    for (let i = 0; i < this.dataArray.length; i++) {
      const frequency = i * binSize;
      const value = this.dataArray[i];
      sum += value;
      
      // Emphase sur les fréquences vocales
      if (frequency >= 300 && frequency <= 3000) {
        voiceSum += value * 2; // Pondération pour la voix
        voiceCount++;
      }
    }
    
    const avgVolume = sum / this.dataArray.length;
    const voiceVolume = voiceCount > 0 ? voiceSum / voiceCount : avgVolume;
    const adjustedVolume = Math.max(avgVolume, voiceVolume);
    
    // Réglage de sensibilité
    const effectiveVolume = adjustedVolume * this.sensitivity;
    
    // Callback pour la visualisation
    if (this.onVolumeChange) {
      this.onVolumeChange(Math.min(100, (effectiveVolume / 128) * 100));
    }
    
    // Détection de parole
    if (effectiveVolume > this.speechThreshold) {
      this.speechTime++;
      this.silenceTime = 0;
      
      // Déclenchement après 3 frames consécutives de parole
      if (this.speechTime === 3 && this.onSpeechStart) {
        this.onSpeechStart();
      }
    } else if (effectiveVolume < this.silenceThreshold) {
      this.silenceTime++;
      this.speechTime = 0;
      
      // Arrêt après 20 frames consécutives de silence
      if (this.silenceTime === 20 && this.onSpeechEnd) {
        this.onSpeechEnd();
      }
    }
    
    // Continue la détection
    if (this.isActive) {
      requestAnimationFrame(() => this.detectVoiceActivity());
    }
  }

  updateSettings(settings: {
    sensitivity?: number;
    silenceThreshold?: number;
    speechThreshold?: number;
  }): void {
    if (settings.sensitivity !== undefined) {
      this.sensitivity = Math.max(0.1, Math.min(2.0, settings.sensitivity));
    }
    if (settings.silenceThreshold !== undefined) {
      this.silenceThreshold = settings.silenceThreshold;
    }
    if (settings.speechThreshold !== undefined) {
      this.speechThreshold = settings.speechThreshold;
    }
  }

  stop(): void {
    this.isActive = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  isRunning(): boolean {
    return this.isActive;
  }
}


export class MaryTTSSpeechService {
  private serverUrl: string = '';
  private voice: string = '';
  private audioContext: AudioContext | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private enabled: boolean = false;

  constructor() {
    this.serverUrl = 'http://localhost:59125';
    this.voice = 'upmc-pierre-hsmm'; // Default to French voice
  }

  configure(useIt: boolean, serverUrl: string = '', voice: string = '') {
    this.enabled = useIt;
    this.serverUrl = serverUrl || 'http://localhost:59125';
    this.voice = voice || 'upmc-pierre-hsmm';
    
    console.log(`Configuration MaryTTS: utilisation=${useIt}, serveur=${this.serverUrl}, voix=${this.voice}`);
  }

  isEnabled(): boolean {
    return this.enabled && !!this.serverUrl;
  }

  async speak(text: string, lang: string, onEnd?: () => void): Promise<boolean> {
    if (!this.isEnabled() || !text || text.trim() === '') {
      if (onEnd) onEnd();
      return false;
    }
    
    try {
      console.log("Utilisation de MaryTTS pour la synthèse vocale");
      // Utiliser MaryTTS si configuré
      const url = new URL(`${this.serverUrl}/process`);
      url.searchParams.append('INPUT_TYPE', 'TEXT');
      url.searchParams.append('OUTPUT_TYPE', 'AUDIO');
      url.searchParams.append('AUDIO', 'WAVE');
      url.searchParams.append('LOCALE', lang.replace('-', '_'));
      url.searchParams.append('VOICE', this.voice);
      url.searchParams.append('INPUT_TEXT', text);
      
      console.log(`Appel MaryTTS: ${url.toString()}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Erreur serveur MaryTTS: ${response.status}`);
      }
      
      this.audioContext = new AudioContext();
      const audioData = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = audioBuffer;
      this.audioSource.connect(this.audioContext.destination);
      
      this.audioSource.onended = () => {
        console.log("Lecture MaryTTS terminée");
        if (onEnd) onEnd();
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
      };
      
      console.log("Démarrage de la lecture MaryTTS");
      this.audioSource.start();
      return true;
    } catch (error) {
      console.error('Erreur MaryTTS:', error);
      if (onEnd) onEnd();
      return false;
    }
  }

  stopSpeaking() {
    // Arrêter MaryTTS
    if (this.audioSource) {
      try {
        this.audioSource.stop();
        this.audioSource.disconnect();
        this.audioSource = null;
      } catch (e) {
        console.error("Erreur lors de l'arrêt de l'audio MaryTTS:", e);
      }
    }
    
    if (this.audioContext) {
      try {
        this.audioContext.close();
        this.audioContext = null;
      } catch (e) {
        console.error("Erreur lors de la fermeture du contexte audio:", e);
      }
    }
  }

  async testConnection(serverUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${serverUrl}/version`);
      return response.ok;
    } catch (error) {
      console.error('Erreur lors du test de connexion MaryTTS:', error);
      return false;
    }
  }

  async getAvailableVoices(serverUrl: string): Promise<string[]> {
    try {
      const response = await fetch(`${serverUrl}/voices`, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`MaryTTS server error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching MaryTTS voices:', error);
      return [];
    }
  }
}


export class SynthesisService {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private lang: string = 'fr-FR'; // Définir français par défaut
  private useMaryTTS: boolean = false;
  private maryTTSServerUrl: string = '';
  private maryTTSVoice: string = '';
  private audioContext: AudioContext | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  
  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Select a good voice if available
    this.setupVoice();
  }

  setupVoice() {
    if (!this.synthesis) return;
    
    // Wait for voices to load
    if (this.synthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.selectVoice();
      };
    } else {
      this.selectVoice();
    }
  }

  selectVoice() {
    const voices = this.synthesis.getVoices();
    
    // Prefer French voices first, then fallback to others
    const preferredVoices = [
      // French premium voices
      "Google français", 
      "Microsoft Denise - French (France)",
      "Microsoft Eloise Online (Natural) - French (France)",
      // Fallback to any voice that matches our language
      ...voices.filter(voice => voice.lang.startsWith(this.lang.split('-')[0]))
    ];
    
    for (const preferred of preferredVoices) {
      const match = voices.find(v => v.name === preferred);
      if (match) {
        this.voice = match;
        console.log(`Utilisation de la voix: ${match.name}`);
        return;
      }
    }
    
    // Fallback to any French voice
    const anyFrenchVoice = voices.find(v => v.lang.startsWith('fr'));
    if (anyFrenchVoice) {
      this.voice = anyFrenchVoice;
      console.log(`Utilisation de la voix de secours: ${anyFrenchVoice.name}`);
    } else {
      // Final fallback to any available voice
      this.voice = voices[0];
      console.log(`Aucune voix française trouvée, utilisation de: ${voices[0]?.name}`);
    }
  }

  async speak(text: string, onEnd?: () => void): Promise<boolean> {
    if (!text || text.trim() === '') {
      console.log("Tentative de parler avec un texte vide");
      if (onEnd) onEnd();
      return false;
    }
    
    console.log(`Synthèse vocale demandée: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    // Arrêter toute synthèse en cours
    this.stopSpeaking();
    
    if (this.useMaryTTS && this.maryTTSServerUrl) {
      try {
        console.log("Utilisation de MaryTTS pour la synthèse vocale");
        // Utiliser MaryTTS si configuré
        const url = new URL(`${this.maryTTSServerUrl}/process`);
        url.searchParams.append('INPUT_TYPE', 'TEXT');
        url.searchParams.append('OUTPUT_TYPE', 'AUDIO');
        url.searchParams.append('AUDIO', 'WAVE');
        url.searchParams.append('LOCALE', this.lang.replace('-', '_'));
        url.searchParams.append('VOICE', this.maryTTSVoice || 'upmc-pierre-hsmm'); // Default French voice
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
        // Fallback to browser TTS on error
        console.log("Échec MaryTTS, repli sur la synthèse vocale du navigateur");
        return this.speakWithBrowser(text, onEnd);
      }
    } else {
      // Utiliser la synthèse vocale du navigateur
      return this.speakWithBrowser(text, onEnd);
    }
  }
  
  speakWithBrowser(text: string, onEnd?: () => void): boolean {
    if (!this.synthesis) {
      console.error("La synthèse vocale n'est pas prise en charge");
      if (onEnd) onEnd();
      return false;
    }

    // Clear any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
      console.log(`Utilisation de la voix: ${this.voice.name}`);
    } else {
      console.log("Aucune voix spécifique sélectionnée pour la synthèse");
    }
    
    utterance.lang = this.lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (onEnd) {
      utterance.onend = () => {
        console.log("Synthèse vocale du navigateur terminée");
        onEnd();
      };
      
      utterance.onerror = (event) => {
        console.error("Erreur durant la synthèse vocale:", event);
        onEnd();
      };
    }
    
    console.log("Démarrage de la synthèse vocale du navigateur");
    this.synthesis.speak(utterance);
    return true;
  }
  
  stopSpeaking() {
    console.log("Arrêt de toute synthèse vocale en cours");
    
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
    
    // Arrêter la synthèse du navigateur
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  setLanguage(lang: string) {
    this.lang = lang;
    console.log("Langue de synthèse définie sur:", lang);
    // Refresh voice selection for the new language
    this.setupVoice();
  }
  
  // Configuration pour MaryTTS with corrected parameter list
  configureMaryTTS(useIt: boolean, serverUrl: string = '', voice: string = '') {
    this.useMaryTTS = useIt;
    this.maryTTSServerUrl = serverUrl || 'http://localhost:59125';
    this.maryTTSVoice = voice || 'upmc-pierre-hsmm'; // Default to French voice
    
    console.log(`Configuration MaryTTS: utilisation=${useIt}, serveur=${this.maryTTSServerUrl}, voix=${this.maryTTSVoice}`);
  }
}

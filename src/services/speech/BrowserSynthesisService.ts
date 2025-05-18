
export class BrowserSynthesisService {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private lang: string = 'fr-FR';
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private volume: number = 1.0;
  private roboticEffect: number = 0;
  
  constructor() {
    this.synthesis = window.speechSynthesis;
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

  selectVoice(voiceName?: string) {
    const voices = this.synthesis.getVoices();
    
    if (voiceName) {
      // Try to find the requested voice by name
      const requestedVoice = voices.find(v => v.name === voiceName);
      if (requestedVoice) {
        this.voice = requestedVoice;
        // Update language to match the selected voice's language
        this.lang = requestedVoice.lang;
        console.log(`Voix sélectionnée: ${requestedVoice.name} avec langue ${requestedVoice.lang}`);
        return;
      } else {
        console.log(`Voix demandée "${voiceName}" non trouvée, utilisation de la voix par défaut`);
      }
    }
    
    // Prefer voices for the current language first, then fallback
    const matchingVoices = voices.filter(voice => voice.lang.startsWith(this.lang.split('-')[0]));
    
    if (matchingVoices.length > 0) {
      // Use the first matching voice
      this.voice = matchingVoices[0];
      console.log(`Utilisation de la voix: ${matchingVoices[0].name} pour la langue ${this.lang}`);
      return;
    }
    
    // If no matching voices, use any available voice
    if (voices.length > 0) {
      this.voice = voices[0];
      console.log(`Aucune voix trouvée pour ${this.lang}, utilisation de: ${voices[0]?.name}`);
    }
  }

  speak(text: string, onEnd?: () => void): boolean {
    if (!this.synthesis) {
      console.error("La synthèse vocale n'est pas prise en charge");
      if (onEnd) onEnd();
      return false;
    }

    if (!text || text.trim() === '') {
      console.log("Tentative de parler avec un texte vide");
      if (onEnd) onEnd();
      return false;
    }

    // Clear any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
      // Toujours utiliser la langue de la voix sélectionnée, pas la langue système
      utterance.lang = this.voice.lang;
      console.log(`Synthèse vocale avec: ${this.voice.name} en langue ${this.voice.lang}`);
    } else {
      utterance.lang = this.lang;
      console.log("Aucune voix spécifique sélectionnée pour la synthèse, utilisant la langue par défaut:", this.lang);
    }
    
    // Apply base settings
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;
    
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
    // Ne pas automatiquement changer la voix pour éviter de remplacer un choix utilisateur
  }
  
  setVoice(voiceName: string) {
    this.selectVoice(voiceName);
  }
  
  setRate(rate: number) {
    this.rate = rate;
  }
  
  setPitch(pitch: number) {
    this.pitch = pitch;
  }
  
  setVolume(volume: number) {
    this.volume = volume;
  }
  
  setRoboticEffect(effect: number) {
    this.roboticEffect = Math.max(0, Math.min(1, effect));
  }
}

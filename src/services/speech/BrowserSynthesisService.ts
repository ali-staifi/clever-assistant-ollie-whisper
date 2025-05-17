
export class BrowserSynthesisService {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private lang: string = 'fr-FR';
  
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
}

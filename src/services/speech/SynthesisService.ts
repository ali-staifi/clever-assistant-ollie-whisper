
export class SynthesisService {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private lang: string = 'en-US';
  
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
    
    // Prefer high-quality voices in this order
    const preferredVoices = [
      // English premium voices
      "Google UK English Male", 
      "Microsoft Mark - English (United States)",
      "Microsoft Guy Online (Natural) - English (United States)",
      // Fallback to any voice that matches our language
      ...voices.filter(voice => voice.lang.startsWith(this.lang.split('-')[0]))
    ];
    
    for (const preferred of preferredVoices) {
      const match = voices.find(v => v.name === preferred);
      if (match) {
        this.voice = match;
        console.log(`Using voice: ${match.name}`);
        return;
      }
    }
    
    // Fallback to any English voice
    const anyEnglishVoice = voices.find(v => v.lang.startsWith('en'));
    if (anyEnglishVoice) {
      this.voice = anyEnglishVoice;
      console.log(`Using fallback voice: ${anyEnglishVoice.name}`);
    }
  }

  speak(text: string, onEnd?: () => void): boolean {
    if (!this.synthesis) return false;

    // Clear any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    console.log("Speaking:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
    this.synthesis.speak(utterance);
    return true;
  }

  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  setLanguage(lang: string) {
    this.lang = lang;
    // Refresh voice selection for the new language
    this.setupVoice();
  }
}

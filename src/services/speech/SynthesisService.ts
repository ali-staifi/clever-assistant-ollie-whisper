
export class SynthesisService {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private lang: string = 'en-US';
  private useMaryTTS: boolean = false;
  private maryTTSServerUrl: string = '';
  private maryTTSVoice: string = '';
  
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

  async speak(text: string, onEnd?: () => void): Promise<boolean> {
    if (this.useMaryTTS && this.maryTTSServerUrl) {
      try {
        // Utiliser MaryTTS si configuré
        const url = new URL(`${this.maryTTSServerUrl}/process`);
        url.searchParams.append('INPUT_TYPE', 'TEXT');
        url.searchParams.append('OUTPUT_TYPE', 'AUDIO');
        url.searchParams.append('AUDIO', 'WAVE');
        url.searchParams.append('LOCALE', this.lang.replace('-', '_'));
        url.searchParams.append('VOICE', this.maryTTSVoice);
        url.searchParams.append('INPUT_TEXT', text);
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`MaryTTS server error: ${response.status}`);
        }
        
        const audioContext = new AudioContext();
        const audioData = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          if (onEnd) onEnd();
          audioContext.close();
        };
        
        source.start();
        return true;
      } catch (error) {
        console.error('MaryTTS error:', error);
        // Fallback to browser TTS on error
        return this.speakWithBrowser(text, onEnd);
      }
    } else {
      // Utiliser la synthèse vocale du navigateur
      return this.speakWithBrowser(text, onEnd);
    }
  }
  
  speakWithBrowser(text: string, onEnd?: () => void): boolean {
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
  
  // Configuration pour MaryTTS
  configureMaryTTS(useIt: boolean, serverUrl: string = '', voice: string = '') {
    this.useMaryTTS = useIt;
    this.maryTTSServerUrl = serverUrl;
    this.maryTTSVoice = voice;
  }
}

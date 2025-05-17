
import { BrowserSynthesisService } from './BrowserSynthesisService';
import { MaryTTSSpeechService } from './MaryTTSSpeechService';

export class SynthesisService {
  private browserSynthesis: BrowserSynthesisService;
  private maryTTS: MaryTTSSpeechService;
  private lang: string = 'fr-FR';
  
  constructor() {
    this.browserSynthesis = new BrowserSynthesisService();
    this.maryTTS = new MaryTTSSpeechService();
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
    
    // Try MaryTTS first, fall back to browser synthesis if it fails
    if (this.maryTTS.isEnabled()) {
      const success = await this.maryTTS.speak(text, this.lang, onEnd);
      if (success) return true;
      
      // Fall back to browser synthesis if MaryTTS fails
      console.log("Échec MaryTTS, repli sur la synthèse vocale du navigateur");
    }
    
    // Use browser synthesis
    return this.browserSynthesis.speak(text, onEnd);
  }
  
  stopSpeaking() {
    console.log("Arrêt de toute synthèse vocale en cours");
    this.maryTTS.stopSpeaking();
    this.browserSynthesis.stopSpeaking();
  }

  isSynthesisSupported(): boolean {
    return this.browserSynthesis.isSynthesisSupported();
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.browserSynthesis.getAvailableVoices();
  }

  setLanguage(lang: string) {
    this.lang = lang;
    this.browserSynthesis.setLanguage(lang);
  }
  
  configureMaryTTS(useIt: boolean, serverUrl: string = '', voice: string = '') {
    this.maryTTS.configure(useIt, serverUrl, voice);
  }
  
  async testMaryTTSConnection(serverUrl: string): Promise<boolean> {
    return await this.maryTTS.testConnection(serverUrl);
  }
  
  async getMaryTTSVoices(serverUrl: string): Promise<string[]> {
    return await this.maryTTS.getAvailableVoices(serverUrl);
  }
}

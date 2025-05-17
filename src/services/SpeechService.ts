
import { RecognitionService } from './speech/RecognitionService';
import { SynthesisService } from './speech/SynthesisService';

export class SpeechService {
  private recognitionService: RecognitionService;
  private synthesisService: SynthesisService;
  
  constructor() {
    this.recognitionService = new RecognitionService();
    this.synthesisService = new SynthesisService();
  }

  startListening(
    onInterimResult?: (text: string) => void,
    onResult?: (text: string) => void,
    onError?: (error: string) => void
  ): boolean {
    return this.recognitionService.startListening(onInterimResult, onResult, onError);
  }

  stopListening() {
    this.recognitionService.stopListening();
  }

  speak(text: string, onEnd?: () => void): boolean {
    return this.synthesisService.speak(text, onEnd);
  }

  isRecognitionSupported(): boolean {
    return this.recognitionService.isRecognitionSupported();
  }

  isSynthesisSupported(): boolean {
    return this.synthesisService.isSynthesisSupported();
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesisService.getAvailableVoices();
  }

  setLanguage(lang: string) {
    this.recognitionService.setLanguage(lang);
    this.synthesisService.setLanguage(lang);
  }
}


import { RecognitionCallbacks, RecognitionProvider } from '../types/recognition';

export class NoMicrophoneProvider implements RecognitionProvider {
  private language: string = 'fr-FR';

  isSupported(): boolean {
    // Always "supported" as it's a fallback provider
    return true;
  }

  startListening(callbacks: RecognitionCallbacks): boolean {
    console.log("Running in no-microphone mode");
    if (callbacks.onResult) {
      setTimeout(() => {
        callbacks.onResult("Mode sans microphone activé. Veuillez saisir votre message via l'interface texte.");
      }, 1000);
    }
    return true;
  }

  stopListening(): void {
    // No actual listening to stop in no-microphone mode
    console.log("No-microphone mode: stop listening called (no action needed)");
  }

  setLanguage(lang: string): void {
    this.language = lang;
    console.log("No-microphone mode: language set to", lang);
  }
}


export class MaryTTSService {
  private serverUrl: string;
  private voice: string;
  private locale: string;
  private audioContext: AudioContext | null = null;
  private audioSource: AudioBufferSourceNode | null = null;

  constructor(serverUrl: string = 'http://localhost:59125', voice: string = 'cmu-slt-hsmm', locale: string = 'en_US') {
    this.serverUrl = serverUrl;
    this.voice = voice;
    this.locale = locale;
  }

  public async speak(text: string, onEnd?: () => void): Promise<boolean> {
    try {
      if (!text || text.trim() === '') {
        return false;
      }

      // Stop any current speech
      this.stopSpeaking();

      // Construct MaryTTS URL with parameters
      const url = new URL(`${this.serverUrl}/process`);
      url.searchParams.append('INPUT_TYPE', 'TEXT');
      url.searchParams.append('OUTPUT_TYPE', 'AUDIO');
      url.searchParams.append('AUDIO', 'WAVE');
      url.searchParams.append('LOCALE', this.locale);
      url.searchParams.append('VOICE', this.voice);
      url.searchParams.append('INPUT_TEXT', text);

      // Fetch audio from MaryTTS server
      console.log(`Fetching audio from MaryTTS for text: ${text.substring(0, 50)}...`);
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`MaryTTS server error: ${response.status}`);
      }

      // Get audio data as ArrayBuffer
      const audioData = await response.arrayBuffer();
      
      // Play audio using Web Audio API
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = audioBuffer;
      this.audioSource.connect(this.audioContext.destination);
      
      if (onEnd) {
        this.audioSource.onended = onEnd;
      }
      
      this.audioSource.start(0);
      return true;
    } catch (error) {
      console.error('MaryTTS error:', error);
      if (onEnd) onEnd();
      return false;
    }
  }

  public stopSpeaking(): void {
    if (this.audioSource) {
      try {
        this.audioSource.stop();
        this.audioSource.disconnect();
      } catch (e) {
        // Source might have already stopped
      }
      this.audioSource = null;
    }
  }

  public setServerUrl(url: string): void {
    this.serverUrl = url;
  }

  public setVoice(voice: string): void {
    this.voice = voice;
  }

  public setLocale(locale: string): void {
    this.locale = locale;
  }

  public getAvailableVoices(): Promise<string[]> {
    return fetch(`${this.serverUrl}/voices`)
      .then(response => response.json())
      .then(data => data.voices || [])
      .catch(error => {
        console.error('Error fetching MaryTTS voices:', error);
        return [];
      });
  }
}

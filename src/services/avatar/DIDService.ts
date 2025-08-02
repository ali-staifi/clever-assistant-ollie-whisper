export interface DIDConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface DIDAnimation {
  source_url: string;
  driver_url?: string;
  script: {
    type: 'text' | 'audio';
    input: string;
    provider?: {
      type: 'microsoft' | 'amazon' | 'elevenlabs';
      voice_id?: string;
      voice_config?: {
        style?: string;
        speed?: number;
        pitch?: number;
      };
    };
  };
  config?: {
    stitch?: boolean;
    result_format?: 'mp4' | 'gif' | 'mov';
    fluent?: boolean;
    pad_audio?: number;
  };
}

export interface DIDVideoResponse {
  id: string;
  object: string;
  created_at: string;
  status: 'created' | 'pending' | 'done' | 'error';
  result_url?: string;
  error?: {
    kind: string;
    description: string;
  };
}

export class DIDService {
  private config: DIDConfig;
  private cache = new Map<string, string>();

  constructor(config: DIDConfig) {
    this.config = config;
  }

  async createTalkingAvatar(
    sourceImageUrl: string,
    text: string,
    emotion: 'neutral' | 'encouraging' | 'supportive' | 'energetic' = 'neutral'
  ): Promise<string | null> {
    try {
      const cacheKey = `${text}-${emotion}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const voiceConfig = this.getVoiceConfigForEmotion(emotion);
      
      const animation: DIDAnimation = {
        source_url: sourceImageUrl,
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'microsoft',
            voice_id: 'fr-FR-DeniseNeural', // Voix française féminine naturelle
            voice_config: voiceConfig
          }
        },
        config: {
          fluent: true,
          pad_audio: 0.5,
          stitch: true,
          result_format: 'mp4'
        }
      };

      const response = await fetch(`${this.config.baseUrl || 'https://api.d-id.com'}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animation)
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.status}`);
      }

      const result: DIDVideoResponse = await response.json();
      
      // Attendre que la vidéo soit prête
      const videoUrl = await this.waitForVideoCompletion(result.id);
      
      if (videoUrl) {
        this.cache.set(cacheKey, videoUrl);
      }
      
      return videoUrl;
    } catch (error) {
      console.error('Erreur lors de la création de l\'avatar parlant:', error);
      return null;
    }
  }

  private async waitForVideoCompletion(videoId: string, maxWaitTime = 30000): Promise<string | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await fetch(`${this.config.baseUrl || 'https://api.d-id.com'}/talks/${videoId}`, {
          headers: {
            'Authorization': `Basic ${this.config.apiKey}`,
          }
        });

        if (!response.ok) {
          throw new Error(`D-ID status check error: ${response.status}`);
        }

        const result: DIDVideoResponse = await response.json();
        
        if (result.status === 'done' && result.result_url) {
          return result.result_url;
        }
        
        if (result.status === 'error') {
          console.error('D-ID generation error:', result.error);
          return null;
        }

        // Attendre 2 secondes avant de vérifier à nouveau
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        return null;
      }
    }
    
    console.warn('Timeout lors de l\'attente de la génération vidéo D-ID');
    return null;
  }

  private getVoiceConfigForEmotion(emotion: string) {
    switch (emotion) {
      case 'encouraging':
        return { style: 'cheerful', speed: 1.1, pitch: 1.05 };
      case 'supportive':
        return { style: 'gentle', speed: 0.95, pitch: 0.98 };
      case 'energetic':
        return { style: 'excited', speed: 1.15, pitch: 1.1 };
      default:
        return { style: 'friendly', speed: 1.0, pitch: 1.0 };
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
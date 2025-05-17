
export interface SynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface MaryTTSConfig {
  useIt: boolean;
  serverUrl: string;
  voice: string;
}

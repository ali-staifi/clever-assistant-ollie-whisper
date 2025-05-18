
import { Message } from '../types';

export class ChatOllamaCore {
  protected baseUrl: string;
  protected model: string;
  protected controller: AbortController | null = null;
  protected options: {
    temperature?: number;
    numPredict?: number;
    topK?: number;
    topP?: number;
  };

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.options = {
      temperature: 0.7,
      numPredict: 256,
      topK: 40,
      topP: 0.9
    };
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setModel(model: string) {
    this.model = model;
  }

  setOptions(options: {
    temperature?: number;
    numPredict?: number;
    topK?: number;
    topP?: number;
  }) {
    this.options = { ...this.options, ...options };
  }

  abortRequest() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}


import { useState, useEffect } from 'react';

interface OllamaSettings {
  url: string;
  model: string;
}

const STORAGE_KEY = 'ollama-settings';

export const usePersistentSettings = (
  defaultUrl = 'http://localhost:11434',
  defaultModel = 'gemma:7b'
) => {
  // Initialize state with values from localStorage or defaults
  const [settings, setSettings] = useState<OllamaSettings>(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    return { url: defaultUrl, model: defaultModel };
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateUrl = (url: string) => {
    setSettings(prev => ({ ...prev, url }));
  };

  const updateModel = (model: string) => {
    setSettings(prev => ({ ...prev, model }));
  };

  return {
    ollamaUrl: settings.url,
    ollamaModel: settings.model,
    updateOllamaUrl: updateUrl,
    updateOllamaModel: updateModel
  };
};

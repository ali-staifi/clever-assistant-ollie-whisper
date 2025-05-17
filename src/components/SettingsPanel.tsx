
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface SettingsPanelProps {
  ollamaUrl: string;
  ollamaModel: string;
  onOllamaUrlChange: (url: string) => void;
  onOllamaModelChange: (model: string) => void;
  onClearConversation: () => void;
  onClose: () => void;
  checkConnection: () => void;
  ollamaStatus: 'idle' | 'connecting' | 'connected' | 'error';
  availableModels?: string[];
}

const COMMON_MODELS = [
  { value: "llama3", label: "Llama 3 (8B)" },
  { value: "llama3:8b-instruct-q4_0", label: "Llama 3 (8B) Instruct Q4" },
  { value: "llama3:70b-instruct-q4_0", label: "Llama 3 (70B) Instruct Q4" },
  { value: "mistral", label: "Mistral" },
  { value: "mixtral", label: "Mixtral 8x7B" },
  { value: "phi3:mini", label: "Phi-3 Mini" },
  { value: "phi3:medium", label: "Phi-3 Medium" },
  { value: "gemma:7b", label: "Gemma 7B" },
  { value: "gemma:2b", label: "Gemma 2B" },
  { value: "codellama", label: "CodeLlama" },
  { value: "qwen2", label: "Qwen 2" },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  ollamaUrl,
  ollamaModel,
  onOllamaUrlChange,
  onOllamaModelChange,
  onClearConversation,
  onClose,
  checkConnection,
  ollamaStatus,
  availableModels = []
}) => {
  const [micSensitivity, setMicSensitivity] = useState(1.0);
  const [testingMic, setTestingMic] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialize microphone testing
  const testMicrophone = async () => {
    if (testingMic) {
      // Stop testing
      setTestingMic(false);
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
      return;
    }
    
    try {
      setTestingMic(true);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      
      // Create audio context
      const context = new AudioContext();
      setAudioContext(context);
      
      // Create analyzer
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      
      // Connect microphone to analyzer
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Function to update volume level
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!testingMic) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalizedVolume = Math.min(1, avg / 128);
        
        setVolumeLevel(normalizedVolume);
        
        if (testingMic) {
          requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setTestingMic(false);
    }
  };
  
  // Set speech recognition sensitivity
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      // Store sensitivity in localStorage for the speech service to use
      localStorage.setItem('jarvis-mic-sensitivity', micSensitivity.toString());
    }
  }, [micSensitivity]);
  
  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  // Get displayed models - either available models or common models
  const getDisplayModels = () => {
    if (availableModels && availableModels.length > 0) {
      // Map available models to the format needed for display
      return availableModels.map(modelName => {
        // Try to find a matching common model for better labeling
        const commonModel = COMMON_MODELS.find(m => m.value === modelName);
        return {
          value: modelName,
          label: commonModel ? commonModel.label : modelName
        };
      });
    }
    
    // Fallback to common models if available models not provided
    return COMMON_MODELS;
  };
  
  const displayModels = getDisplayModels();

  return (
    <div className="bg-card rounded-lg p-4 mb-4 shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 text-jarvis-blue">Settings</h2>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="ollama-url">Ollama API URL</Label>
          <div className="flex gap-2">
            <Input
              id="ollama-url"
              value={ollamaUrl}
              onChange={(e) => onOllamaUrlChange(e.target.value)}
              placeholder="http://localhost:11434"
            />
            <Button 
              variant="secondary" 
              onClick={checkConnection}
              className={`${ollamaStatus === 'connecting' ? 'opacity-70' : ''}`}
              disabled={ollamaStatus === 'connecting'}
            >
              {ollamaStatus === 'connecting' ? 'Connecting...' : 'Test'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The URL where your Ollama server is running
          </p>
        </div>
        
        {ollamaStatus === 'error' && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Cannot connect to Ollama. Make sure Ollama is running and CORS is properly configured.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-muted/50 border border-muted">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            <strong>Configure Ollama CORS in PowerShell:</strong>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>Open PowerShell as administrator</li>
              <li>If Ollama is already running, stop it with: <code className="bg-muted-foreground/20 px-1 rounded">Stop-Process -Name ollama</code></li>
              <li>Start Ollama with CORS enabled: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="*"; ollama serve</code></li>
              <li>Or for a specific origin: <code className="bg-muted-foreground/20 px-1 rounded">$env:OLLAMA_ORIGINS="https://yourdomain.com"; ollama serve</code></li>
            </ol>
            <p className="mt-1">If you get "Only one usage of each socket address" error, Ollama is already running. Stop it first with <code className="bg-muted-foreground/20 px-1 rounded">Stop-Process -Name ollama</code> and try again.</p>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="ollama-model">Ollama Model</Label>
          <Select
            value={ollamaModel}
            onValueChange={onOllamaModelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {displayModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The model should be installed on your Ollama server
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Install more models using: <code className="bg-muted-foreground/20 px-1 rounded">ollama pull modelname</code>
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="mic-sensitivity">Microphone Sensitivity</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(micSensitivity * 100)}%
            </span>
          </div>
          <Slider
            id="mic-sensitivity"
            min={0.1}
            max={3.0}
            step={0.1}
            value={[micSensitivity]}
            onValueChange={(value) => setMicSensitivity(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Increase if J.A.R.V.I.S has trouble hearing you
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Test Microphone</Label>
            <Button 
              variant={testingMic ? "destructive" : "outline"} 
              onClick={testMicrophone}
              size="sm"
            >
              {testingMic ? "Stop Testing" : "Start Test"}
            </Button>
          </div>
          
          {testingMic && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <div className="bg-muted h-2 flex-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-jarvis-blue h-full transition-all duration-100"
                    style={{ width: `${volumeLevel * 100}%` }}
                  ></div>
                </div>
                <Volume2 className="h-4 w-4 text-jarvis-blue" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {volumeLevel < 0.2 ? "Speech too quiet - try speaking louder" : 
                 volumeLevel > 0.7 ? "Good volume detected" : "Try speaking a bit louder"}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onClearConversation}>
            Clear Conversation
          </Button>
          <Button onClick={onClose}>Close Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

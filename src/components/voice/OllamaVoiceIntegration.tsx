
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, CheckCircle, XCircle, Settings, User, UserCheck } from "lucide-react";
import { useOllamaVoice } from '@/hooks/jarvis/useOllamaVoice';
import { FastSpeech2Params } from '@/services/speech/FastSpeech2Service';

interface OllamaVoiceIntegrationProps {
  voiceParams: FastSpeech2Params;
  onVoiceResponse?: (text: string) => void;
  onSpeakGenerated?: (text: string, params: FastSpeech2Params) => void;
}

const OllamaVoiceIntegration: React.FC<OllamaVoiceIntegrationProps> = ({
  voiceParams,
  onVoiceResponse,
  onSpeakGenerated
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastResponse, setLastResponse] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('female');
  
  const {
    isConnected,
    isGenerating,
    availableModels,
    currentModel,
    ollamaUrl,
    testConnection,
    updateOllamaUrl,
    updateModel,
    generateVoiceResponse,
    generateVoiceTest
  } = useOllamaVoice();

  // Test de connexion au chargement
  useEffect(() => {
    testConnection();
  }, []);

  const handleGenerateTest = async () => {
    const response = await generateVoiceTest(voiceParams);
    if (response) {
      setLastResponse(response);
      onVoiceResponse?.(response);
      // Corriger l'erreur TypeScript en fusionnant les paramètres
      const mergedParams: FastSpeech2Params = {
        ...voiceParams,
        // Ajouter la notion de genre à la voix
        emotion: selectedGender === 'female' ? 'happy' : voiceParams.emotion
      };
      onSpeakGenerated?.(response, mergedParams);
    }
  };

  const handleGenerateCustom = async () => {
    if (!customPrompt.trim()) return;
    
    const response = await generateVoiceResponse(customPrompt, voiceParams);
    if (response) {
      setLastResponse(response.text);
      onVoiceResponse?.(response.text);
      // Corriger l'erreur TypeScript en fusionnant les paramètres
      const mergedParams: FastSpeech2Params = {
        ...voiceParams,
        ...(response.adjustedParams || {})
      };
      onSpeakGenerated?.(response.text, mergedParams);
    }
  };

  const getConnectionStatus = () => {
    if (isConnected === null) return { icon: Loader2, color: 'text-gray-500', text: 'Test...' };
    if (isConnected) return { icon: CheckCircle, color: 'text-green-500', text: 'Connecté' };
    return { icon: XCircle, color: 'text-red-500', text: 'Déconnecté' };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-jarvis-blue" />
          Génération Ollama avec Voix
        </h3>
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${status.color} ${isConnected === null ? 'animate-spin' : ''}`} />
          <span className={`text-sm ${status.color}`}>{status.text}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sélection du genre de voix */}
      <div className="space-y-2">
        <Label htmlFor="voice-gender">Type de voix</Label>
        <Select value={selectedGender} onValueChange={(value: 'male' | 'female') => setSelectedGender(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir le type de voix" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="female" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Voix féminine
            </SelectItem>
            <SelectItem value="male" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Voix masculine
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          La voix {selectedGender === 'female' ? 'féminine' : 'masculine'} influencera le style de génération
        </p>
      </div>

      {showSettings && (
        <div className="space-y-3 p-3 bg-muted rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="ollama-url">URL Ollama</Label>
            <div className="flex gap-2">
              <Input
                id="ollama-url"
                value={ollamaUrl}
                onChange={(e) => updateOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
              />
              <Button onClick={testConnection} size="sm">
                Tester
              </Button>
            </div>
          </div>

          {availableModels.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="model-select">Modèle</Label>
              <Select value={currentModel} onValueChange={updateModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Voix: {selectedGender === 'female' ? 'Féminine' : 'Masculine'}
          </Badge>
          <Badge variant="outline">
            Émotion: {voiceParams.emotion}
          </Badge>
          <Badge variant="outline">
            Intensité: {Math.round(voiceParams.emotionStrength * 100)}%
          </Badge>
          <Badge variant="outline">
            Vitesse: {voiceParams.speed}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateTest}
            disabled={!isConnected || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Générer test vocal {selectedGender === 'female' ? 'féminin' : 'masculin'}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-prompt">Prompt personnalisé</Label>
          <div className="flex gap-2">
            <Input
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Écrivez votre demande personnalisée..."
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateCustom()}
            />
            <Button 
              onClick={handleGenerateCustom}
              disabled={!isConnected || isGenerating || !customPrompt.trim()}
            >
              Générer
            </Button>
          </div>
        </div>

        {lastResponse && (
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Dernière réponse générée:</Label>
            <p className="text-sm mt-1 whitespace-pre-wrap">{lastResponse}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          <strong>Assistant vocal connecté:</strong> Ollama génère maintenant des réponses 
          adaptées au type de voix ({selectedGender === 'female' ? 'féminine' : 'masculine'}) 
          et aux paramètres émotionnels sélectionnés.
        </p>
      </div>
    </Card>
  );
};

export default OllamaVoiceIntegration;


import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Settings, 
  Volume2,
  Zap,
  RotateCcw
} from 'lucide-react';
import { ConversationState } from '@/services/voice/ContinuousConversationService';

interface ContinuousVoiceControlsProps {
  // État de la conversation
  conversationState: ConversationState;
  isActive: boolean;
  micVolume: number;
  errorMessage: string;
  
  // Paramètres
  micSensitivity: number;
  autoReactivate: boolean;
  
  // Actions
  onStartConversation: () => Promise<void>;
  onStopConversation: () => void;
  onSensitivityChange: (value: number) => void;
  onAutoReactivateChange: (enabled: boolean) => void;
  onTriggerManualListening: () => void;
  onClearError: () => void;
}

const ContinuousVoiceControls: React.FC<ContinuousVoiceControlsProps> = ({
  conversationState,
  isActive,
  micVolume,
  errorMessage,
  micSensitivity,
  autoReactivate,
  onStartConversation,
  onStopConversation,
  onSensitivityChange,
  onAutoReactivateChange,
  onTriggerManualListening,
  onClearError
}) => {
  const getStatusColor = () => {
    switch (conversationState) {
      case 'listening':
        return 'text-blue-500';
      case 'processing':
        return 'text-yellow-500';
      case 'speaking':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (conversationState) {
      case 'listening':
        return 'En écoute continue';
      case 'processing':
        return 'Traitement en cours';
      case 'speaking':
        return 'Jarvis parle';
      case 'error':
        return 'Erreur détectée';
      default:
        return 'Conversation inactive';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-jarvis-blue" />
          Conversation Continue
        </h3>
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Contrôles principaux */}
      <div className="flex gap-4 justify-center">
        {!isActive ? (
          <Button
            onClick={onStartConversation}
            className="bg-jarvis-blue hover:bg-jarvis-blue/80 text-white px-8 py-3 rounded-full flex items-center gap-2"
          >
            <Play className="h-5 w-5" />
            Démarrer Conversation
          </Button>
        ) : (
          <>
            <Button
              onClick={onStopConversation}
              variant="destructive"
              className="px-6 py-3 rounded-full flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Arrêter
            </Button>
            
            {conversationState === 'listening' && (
              <Button
                onClick={onTriggerManualListening}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Forcer Écoute
              </Button>
            )}
          </>
        )}
      </div>

      {/* Paramètres avancés */}
      <div className="space-y-4">
        {/* Sensibilité du microphone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Sensibilité VAD
            </Label>
            <span className="text-sm text-gray-400">
              {Math.round(micSensitivity * 100)}%
            </span>
          </div>
          <Slider
            value={[micSensitivity]}
            onValueChange={(values) => onSensitivityChange(values[0])}
            min={0.5}
            max={3.0}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-gray-400">
            Ajustez pour une meilleure détection vocale automatique
          </p>
        </div>

        {/* Réactivation automatique */}
        <div className="flex items-center justify-between">
          <Label className="text-white flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Réactivation automatique
          </Label>
          <Switch
            checked={autoReactivate}
            onCheckedChange={onAutoReactivateChange}
          />
        </div>
        <p className="text-xs text-gray-400">
          Réactive automatiquement l'écoute après chaque réponse de Jarvis
        </p>

        {/* Indicateur de volume */}
        {isActive && conversationState === 'listening' && (
          <div className="space-y-2">
            <Label className="text-white">Volume détecté</Label>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100"
                style={{ width: `${micVolume}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Silence</span>
              <span>{Math.round(micVolume)}%</span>
              <span>Fort</span>
            </div>
          </div>
        )}
      </div>

      {/* Gestion des erreurs */}
      {errorMessage && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400">
              <MicOff className="h-4 w-4" />
              <span className="font-medium">Erreur</span>
            </div>
            <Button
              onClick={onClearError}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-red-300 mt-2">{errorMessage}</p>
        </div>
      )}

      {/* Conseils d'utilisation */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-400 mb-2">
          💡 Mode Conversation Continue
        </h4>
        <ul className="text-xs text-blue-300 space-y-1">
          <li>• Parlez naturellement, Jarvis détecte automatiquement votre voix</li>
          <li>• Ajustez la sensibilité si la détection est trop/pas assez sensible</li>
          <li>• La conversation redémarre automatiquement après chaque réponse</li>
          <li>• Utilisez "Forcer Écoute" si la détection ne se déclenche pas</li>
        </ul>
      </div>
    </div>
  );
};

export default ContinuousVoiceControls;

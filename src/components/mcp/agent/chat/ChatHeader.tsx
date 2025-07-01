
import React, { useState } from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bot, Volume2, VolumeX, Settings, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { OllamaConnectionStatus } from '../../../../services/mcp/agent/MCPAgentChatService';

interface ChatHeaderProps {
  isSpeaking: boolean;
  globalVoiceSettings: any;
  toggleSpeaking: () => void;
  ollamaUrl: string;
  ollamaModel: string;
  connectionStatus: OllamaConnectionStatus;
  availableModels: string[];
  onOllamaUrlChange: (url: string) => void;
  onOllamaModelChange: (model: string) => void;
  onCheckConnection: () => Promise<boolean>;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSpeaking,
  globalVoiceSettings,
  toggleSpeaking,
  ollamaUrl,
  ollamaModel,
  connectionStatus,
  availableModels,
  onOllamaUrlChange,
  onOllamaModelChange,
  onCheckConnection
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connecté';
      case 'connecting':
        return 'Connexion...';
      case 'error':
        return 'Déconnecté';
      default:
        return 'Inactif';
    }
  };

  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-purple-600" />
          <span>Agent IA MCP</span>
          <div className="flex items-center gap-2">
            {getConnectionStatusIcon()}
            <span className="text-sm text-muted-foreground">
              {getConnectionStatusText()}
            </span>
          </div>
        </CardTitle>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {ollamaModel}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSpeaking}
            className={isSpeaking ? "text-green-600" : "text-muted-foreground"}
          >
            {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Collapsible open={showSettings} onOpenChange={setShowSettings}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
                {showSettings ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="absolute right-4 top-16 z-50 w-80 bg-card border rounded-lg shadow-lg p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Ollama</label>
                <div className="flex gap-2">
                  <Input
                    value={ollamaUrl}
                    onChange={(e) => onOllamaUrlChange(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={onCheckConnection}
                    disabled={connectionStatus === 'connecting'}
                  >
                    {connectionStatus === 'connecting' ? 'Test...' : 'Tester'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Modèle Ollama</label>
                <Select value={ollamaModel} onValueChange={onOllamaModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="gemma:7b">gemma:7b (par défaut)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {availableModels.length} modèle(s) disponible(s)
                </p>
              </div>

              {connectionStatus === 'error' && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Impossible de se connecter à Ollama. Vérifiez que le service est démarré.
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </CardHeader>
  );
};


import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings, MessageCircle, Trash2 } from "lucide-react";
import { useAlexAvatar } from '@/hooks/useAlexAvatar';
import { ReadyPlayerMeAvatar } from '@/components/avatar/ReadyPlayerMeAvatar';
import OpenRouterSettings from '@/components/settings/OpenRouterSettings';

const CoachPage = () => {
  const [userInput, setUserInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    isListening,
    isSpeaking,
    currentSpeakingText,
    conversation,
    apiKey,
    model,
    connectionStatus,
    availableModels,
    updateApiKey,
    updateModel,
    checkConnection,
    handleUserInput,
    clearConversation
  } = useAlexAvatar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    await handleUserInput(userInput.trim());
    setUserInput('');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-jarvis-blue">Alex - Coach Personnel IA</h1>
        <p className="text-muted-foreground">
          Votre assistant personnel alimenté par OpenRouter et les meilleurs modèles LLM gratuits
        </p>
      </div>

      {/* Configuration OpenRouter */}
      {(!apiKey || showSettings) && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-jarvis-blue" />
            <h2 className="text-lg font-semibold">Configuration OpenRouter</h2>
          </div>
          <OpenRouterSettings
            apiKey={apiKey}
            model={model}
            onApiKeyChange={updateApiKey}
            onModelChange={updateModel}
            checkConnection={checkConnection}
            connectionStatus={connectionStatus}
            availableModels={availableModels}
          />
          {apiKey && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowSettings(false)} variant="outline">
                Fermer la configuration
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Main Interface */}
      {apiKey && connectionStatus === 'connected' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Avatar */}
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Alex</h2>
              <div className="h-96 flex items-center justify-center">
                <ReadyPlayerMeAvatar
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  emotionalState="neutral"
                  currentText={currentSpeakingText}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {isSpeaking ? (
                  <p className="text-green-600">🎤 Alex parle...</p>
                ) : (
                  <p>💤 Alex écoute...</p>
                )}
              </div>
            </div>
          </Card>

          {/* Chat Interface */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-jarvis-blue" />
                Conversation
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  disabled={conversation.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
              {conversation.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Commencez une conversation avec Alex!</p>
                  <p className="text-sm mt-2">Modèle actuel: {model}</p>
                </div>
              ) : (
                conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-jarvis-blue text-white ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))
              )}
            </div>

            <Separator className="my-4" />

            {/* Input */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Tapez votre message pour Alex..."
                disabled={isSpeaking}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={!userInput.trim() || isSpeaking}
              >
                {isSpeaking ? 'Alex répond...' : 'Envoyer'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Connection Status */}
      {apiKey && connectionStatus !== 'connected' && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            {connectionStatus === 'connecting' ? 'Connexion à OpenRouter...' : 'Connexion requise'}
          </p>
          <Button onClick={checkConnection} className="mt-2">
            Tester la connexion
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CoachPage;

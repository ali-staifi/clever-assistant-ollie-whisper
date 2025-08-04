import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAlexAvatar } from '../hooks/useAlexAvatar';
import { ReadyPlayerMeAvatar } from '../components/avatar/ReadyPlayerMeAvatar';
import { DIDConfigDialog } from '../components/dialogs/DIDConfigDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Mic, MicOff, RotateCcw, MessageCircle, Heart, Zap, Brain, Settings } from 'lucide-react';

export const CoachPage = () => {
  const [showDIDConfig, setShowDIDConfig] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  const [userInput, setUserInput] = useState('');
  
  const {
    isListening,
    isSpeaking,
    emotionalState,
    micVolume,
    conversation,
    transcript,
    startListening,
    stopListening,
    handleUserInput,
    resetConversation,
    speakGreeting
  } = useAlexAvatar();

  useEffect(() => {
    // Saluer l'utilisateur au chargement de la page
    const timer = setTimeout(() => {
      speakGreeting();
    }, 1000);

    return () => clearTimeout(timer);
  }, [speakGreeting]);

  const handleQuickAction = async (message: string) => {
    setCurrentSpeakingText(message);
    await handleUserInput(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      setCurrentSpeakingText(userInput);
      await handleUserInput(userInput);
      setUserInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Votre Coach Bien-être
          </h1>
          <p className="text-lg text-muted-foreground">
            Rencontrez Alex, votre accompagnateur personnel avec animation faciale réaliste
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <span>Alex - Coach Humain</span>
                <Badge variant={emotionalState === 'neutral' ? 'secondary' : 'default'}>
                  {emotionalState === 'neutral' ? 'Calme' : 
                   emotionalState === 'encouraging' ? 'Encourageant' :
                   emotionalState === 'supportive' ? 'Bienveillant' : 'Énergique'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Avatar avec animation faciale D-ID en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {/* Avatar Alex Humain */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ReadyPlayerMeAvatar
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  emotionalState={emotionalState}
                  currentText={currentSpeakingText}
                />
              </motion.div>

              {/* Controls */}
              <div className="flex gap-4">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  disabled={isSpeaking}
                  className="flex items-center gap-2"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening ? 'Arrêter' : 'Parler à Alex'}
                </Button>

                <Button
                  onClick={resetConversation}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>

                <Button
                  onClick={() => setShowDIDConfig(true)}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  D-ID
                </Button>
              </div>

              {/* Text Input */}
              <form onSubmit={handleSubmit} className="w-full">
                <Input
                  type="text"
                  placeholder="Écrivez votre message à Alex..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isSpeaking}
                  className="w-full"
                />
              </form>

              {/* Live Transcript */}
              {transcript && (
                <Card className="w-full bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Vous dites :</p>
                    <p className="text-foreground">{transcript}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Conversation History */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Conversation avec Alex
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {conversation.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>La conversation va apparaître ici...</p>
                      <p className="text-sm mt-2">Alex vous écoute avec son visage animé</p>
                    </div>
                  ) : (
                    conversation.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <p className="text-sm font-medium mb-1">
                            {message.role === 'user' ? 'Vous' : 'Alex'}
                          </p>
                          <p>{message.content}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Actions Rapides avec Alex
            </CardTitle>
            <CardDescription>
              Démarrez rapidement une conversation sur ces sujets bien-être
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => handleQuickAction("Je me sens stressé aujourd'hui")}
                disabled={isSpeaking}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              >
                <Heart className="w-6 h-6 text-red-500" />
                <span className="text-sm font-medium">Gestion du stress</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction("J'aimerais faire de la méditation")}
                disabled={isSpeaking}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              >
                <Brain className="w-6 h-6 text-purple-500" />
                <span className="text-sm font-medium">Méditation</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction("Comment avoir plus confiance en moi ?")}
                disabled={isSpeaking}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              >
                <Zap className="w-6 h-6 text-yellow-500" />
                <span className="text-sm font-medium">Confiance en soi</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction("J'ai besoin de motivation pour faire du sport")}
                disabled={isSpeaking}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              >
                <Heart className="w-6 h-6 text-green-500" />
                <span className="text-sm font-medium">Motivation sportive</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de configuration D-ID */}
      <DIDConfigDialog
        isOpen={showDIDConfig}
        onClose={() => setShowDIDConfig(false)}
        onConfigured={() => {
          console.log('D-ID configuré avec succès');
        }}
      />
    </div>
  );
};
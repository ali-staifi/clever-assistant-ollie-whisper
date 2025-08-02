import React, { useEffect } from 'react';
import { AlexAvatarVisualizer } from '../components/avatar/AlexAvatarVisualizer';
import { useAlexAvatar } from '../hooks/useAlexAvatar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Mic, MicOff, RotateCcw, MessageCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';

export const CoachPage = () => {
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

  const handleTextInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget;
      if (input.value.trim()) {
        handleUserInput(input.value);
        input.value = '';
      }
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
            Rencontrez Alex, votre accompagnateur personnel pour un mieux-être au quotidien
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <span>Alex - Coach Bien-être</span>
                <Badge variant={emotionalState === 'neutral' ? 'secondary' : 'default'}>
                  {emotionalState === 'neutral' ? 'Calme' : 
                   emotionalState === 'encouraging' ? 'Encourageant' :
                   emotionalState === 'supportive' ? 'Bienveillant' : 'Énergique'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <AlexAvatarVisualizer
                isListening={isListening}
                isSpeaking={isSpeaking}
                emotionalState={emotionalState}
                micVolume={micVolume}
              />

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
              </div>

              {/* Text Input */}
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Ou écrivez votre message ici et appuyez sur Entrée..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={handleTextInput}
                  disabled={isSpeaking}
                />
              </div>

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
                      <p className="text-sm mt-2">Alex vous écoute et vous accompagne</p>
                    </div>
                  ) : (
                    conversation.map((message, index) => (
                      <div
                        key={index}
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
                      </div>
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
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => handleUserInput("Je me sens stressé aujourd'hui")}
                disabled={isSpeaking}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">😰</span>
                <span className="text-sm">Gestion du stress</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleUserInput("J'aimerais faire de la méditation")}
                disabled={isSpeaking}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">🧘</span>
                <span className="text-sm">Méditation</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleUserInput("Comment avoir plus confiance en moi ?")}
                disabled={isSpeaking}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">💪</span>
                <span className="text-sm">Confiance en soi</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleUserInput("J'ai besoin de motivation pour faire du sport")}
                disabled={isSpeaking}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">🏃</span>
                <span className="text-sm">Motivation sportive</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
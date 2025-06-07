
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Brain, Target, BookOpen, Trash2 } from 'lucide-react';
import { LumenSession } from '../types';

interface SessionManagerProps {
  sessions: LumenSession[];
  onDeleteSession: (id: string) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ sessions, onDeleteSession }) => {
  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'reasoning': return <Brain className="h-4 w-4" />;
      case 'analysis': return <Target className="h-4 w-4" />;
      case 'learning': return <BookOpen className="h-4 w-4" />;
      case 'planning': return <Clock className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Historique des sessions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune session enregistrée
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Historique des sessions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-start justify-between p-2 border rounded-lg">
                <div className="flex items-start space-x-2 flex-1">
                  <div className="mt-1">
                    {getSessionIcon(session.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {session.type}
                      </Badge>
                      <Badge variant={getStatusColor(session.status)} className="text-xs">
                        {session.status}
                      </Badge>
                      {session.confidence && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(session.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.query}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSession(session.id)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SessionManager;

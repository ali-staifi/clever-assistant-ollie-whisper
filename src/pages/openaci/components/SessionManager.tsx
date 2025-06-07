
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Search, Lightbulb, Network, FileText } from 'lucide-react';
import { LumenSession } from '../types';

interface SessionManagerProps {
  sessions: LumenSession[];
}

const SessionManager: React.FC<SessionManagerProps> = ({ sessions }) => {
  const getSessionTypeIcon = (type: LumenSession['type']) => {
    switch (type) {
      case 'reasoning': return Brain;
      case 'analysis': return Search;
      case 'learning': return Lightbulb;
      case 'planning': return Network;
      default: return FileText;
    }
  };

  const getSessionTypeColor = (type: LumenSession['type']) => {
    switch (type) {
      case 'reasoning': return 'bg-purple-100 text-purple-800';
      case 'analysis': return 'bg-blue-100 text-blue-800';
      case 'learning': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: LumenSession['status']) => {
    switch (status) {
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Sessions Lumen</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          <div className="space-y-1">
            {sessions.map((session) => {
              const IconComponent = getSessionTypeIcon(session.type);
              return (
                <div key={session.id} className="p-2 border rounded text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center space-x-1">
                      <Badge className={getStatusColor(session.status) + " text-xs"}>
                        {session.status}
                      </Badge>
                      <Badge className={getSessionTypeColor(session.type) + " text-xs"}>
                        <IconComponent className="h-3 w-3 mr-1" />
                        {session.type}
                      </Badge>
                      {session.confidence > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {session.confidence}% confiance
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {session.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-1 font-medium">{session.query.substring(0, 100)}...</div>
                  {session.reasoning_steps.length > 0 && (
                    <div className="text-muted-foreground mb-1">
                      Étapes: {session.reasoning_steps.join(' → ')}
                    </div>
                  )}
                  {session.response && (
                    <div className="text-green-700">{session.response}</div>
                  )}
                </div>
              );
            })}
            {sessions.length === 0 && (
              <div className="text-center text-muted-foreground py-4 text-xs">
                Aucune session Lumen
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    );
  };
};

export default SessionManager;

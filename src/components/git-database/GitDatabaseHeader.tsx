
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Brain, Shield } from 'lucide-react';

interface GitDatabaseHeaderProps {
  isActive: boolean;
  agentSActive: boolean;
  connectionStatus: string;
  tasksCount: number;
}

const GitDatabaseHeader: React.FC<GitDatabaseHeaderProps> = ({
  isActive,
  agentSActive,
  connectionStatus,
  tasksCount
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          <Brain className="h-6 w-6 mr-2 text-purple-600" />
          AZR + Agent S - Architecture Sécurisée
        </h1>
        <p className="text-muted-foreground text-sm">
          Sandboxing • Surveillance Dérive • Isolation • Chat Sécurisé • Interface 3D • Feedback Automatique
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={isActive ? "default" : "secondary"}>
          AZR: {isActive ? "Actif" : "En Veille"}
        </Badge>
        <Badge variant={agentSActive ? "default" : "secondary"}>
          Agent S: {agentSActive ? "Actif" : "Inactif"}
        </Badge>
        <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
          LLM: {connectionStatus}
        </Badge>
        <Badge variant="outline">
          Tâches: {tasksCount}
        </Badge>
        <Badge variant="outline" className="text-green-600">
          <Shield className="h-3 w-3 mr-1" />
          Sécurisé
        </Badge>
      </div>
    </div>
  );
};

export default GitDatabaseHeader;

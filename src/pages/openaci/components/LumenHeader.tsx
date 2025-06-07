
import React from 'react';
import { Cpu } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface LumenHeaderProps {
  isLumenActive: boolean;
  connectionStatus: string;
}

const LumenHeader: React.FC<LumenHeaderProps> = ({ isLumenActive, connectionStatus }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          <Cpu className="h-6 w-6 mr-2 text-blue-600" />
          Lumen
        </h1>
        <p className="text-muted-foreground text-sm">
          Système de raisonnement automatique et d'analyse avancée
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={isLumenActive ? "default" : "secondary"}>
          {isLumenActive ? "Actif" : "Inactif"}
        </Badge>
        <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
          LLM: {connectionStatus}
        </Badge>
      </div>
    </div>
  );
};

export default LumenHeader;

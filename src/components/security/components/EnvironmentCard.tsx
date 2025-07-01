
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExecutionEnvironment } from '../types/ExecutionSandboxTypes';
import { getStatusIcon, getTypeColor } from '../utils/ExecutionSandboxUtils';

interface EnvironmentCardProps {
  environment: ExecutionEnvironment;
  onQuarantine: (id: string) => void;
  onRestore: (id: string) => void;
}

export const EnvironmentCard: React.FC<EnvironmentCardProps> = ({
  environment,
  onQuarantine,
  onRestore
}) => {
  const StatusIcon = getStatusIcon(environment.status);

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{environment.name}</span>
          <Badge className={getTypeColor(environment.type)}>
            {environment.type}
          </Badge>
        </div>
        <div className="flex gap-1">
          {environment.status === 'quarantined' ? (
            <Button 
              onClick={() => onRestore(environment.id)}
              size="sm"
              variant="outline"
            >
              Restaurer
            </Button>
          ) : (
            <Button 
              onClick={() => onQuarantine(environment.id)}
              size="sm"
              variant="destructive"
            >
              Quarantaine
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="flex justify-between">
            <span>Mémoire</span>
            <span>{environment.memoryUsage.toFixed(0)}%</span>
          </div>
          <Progress value={environment.memoryUsage} className="h-1 mt-1" />
        </div>
        <div>
          <div className="flex justify-between">
            <span>CPU</span>
            <span>{environment.cpuUsage.toFixed(0)}%</span>
          </div>
          <Progress value={environment.cpuUsage} className="h-1 mt-1" />
        </div>
        <div>
          <div className="flex justify-between">
            <span>Sécurité</span>
            <span>{environment.securityLevel.toFixed(0)}%</span>
          </div>
          <Progress value={environment.securityLevel} className="h-1 mt-1" />
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Exécutions: {environment.executionCount}</span>
        <span>Erreurs: {environment.errorCount}</span>
        <span>Taux erreur: {environment.executionCount > 0 ? ((environment.errorCount / environment.executionCount) * 100).toFixed(1) : 0}%</span>
      </div>
    </div>
  );
};

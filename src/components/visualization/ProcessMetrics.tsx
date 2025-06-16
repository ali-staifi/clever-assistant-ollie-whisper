
import React from 'react';
import { ProcessNode } from './ProcessSphere';

interface ProcessMetricsProps {
  processes: any[];
  executionResults: any[];
  processNodes: ProcessNode[];
}

const ProcessMetrics: React.FC<ProcessMetricsProps> = ({ 
  processes, 
  executionResults, 
  processNodes 
}) => {
  return (
    <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
      <div className="text-center">
        <div className="font-medium">{processes.length}</div>
        <div className="text-muted-foreground">Processus</div>
      </div>
      <div className="text-center">
        <div className="font-medium">{executionResults.length}</div>
        <div className="text-muted-foreground">Exécutions</div>
      </div>
      <div className="text-center">
        <div className="font-medium">
          {processNodes.filter(n => n.status === 'active').length}
        </div>
        <div className="text-muted-foreground">Nœuds actifs</div>
      </div>
      <div className="text-center">
        <div className="font-medium">
          {processNodes.filter(n => n.securityLevel === 'safe').length}
        </div>
        <div className="text-muted-foreground">Sécurisés</div>
      </div>
    </div>
  );
};

export default ProcessMetrics;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Shield, AlertTriangle } from 'lucide-react';
import AZR3DScene from './AZR3DScene';
import NodeSelector from './NodeSelector';
import ProcessMetrics from './ProcessMetrics';
import { ProcessNode } from './ProcessSphere';

interface AZR3DInterfaceProps {
  azrActive: boolean;
  agentSActive: boolean;
  processes: any[];
  executionResults: any[];
}

const AZR3DInterface: React.FC<AZR3DInterfaceProps> = ({
  azrActive,
  agentSActive,
  processes,
  executionResults
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [securityAlert, setSecurityAlert] = useState<boolean>(false);
  const [processNodes, setProcessNodes] = useState<ProcessNode[]>([
    {
      id: 'creation',
      type: 'creation',
      position: [-2, 1, 0],
      status: 'idle',
      connections: ['validation', 'improvement'],
      securityLevel: 'safe'
    },
    {
      id: 'validation',
      type: 'validation',
      position: [0, 0, 0],
      status: 'idle',
      connections: ['improvement'],
      securityLevel: 'monitored'
    },
    {
      id: 'improvement',
      type: 'improvement',
      position: [2, 1, 0],
      status: 'idle',
      connections: ['creation'],
      securityLevel: 'safe'
    },
    {
      id: 'orchestration',
      type: 'orchestration',
      position: [0, 2, 0],
      status: agentSActive ? 'active' : 'idle',
      connections: ['creation', 'validation', 'improvement'],
      securityLevel: 'isolated'
    }
  ]);

  useEffect(() => {
    // Surveillance de dérive algorithmique
    const driftDetection = () => {
      const errorRate = executionResults.length > 0 ? 
        executionResults.filter((r: any) => !r.success).length / executionResults.length : 0;
      
      if (errorRate > 0.5) {
        setSecurityAlert(true);
        // Isolation automatique en cas de dérive
        setProcessNodes(prev => prev.map(node => ({
          ...node,
          securityLevel: node.type === 'orchestration' ? 'isolated' : 'monitored' as const,
          status: errorRate > 0.7 ? 'error' : node.status
        })));
      } else {
        setSecurityAlert(false);
      }
    };

    if (executionResults.length > 3) {
      driftDetection();
    }

    // Mise à jour du statut des nœuds
    setProcessNodes(prev => prev.map(node => {
      if (node.type === 'orchestration') {
        return { 
          ...node, 
          status: agentSActive ? 'active' : 'idle' as const,
          securityLevel: agentSActive ? 'isolated' : 'safe' as const
        };
      }
      if (azrActive) {
        const hasActivity = processes.length > 0;
        return { 
          ...node, 
          status: hasActivity ? 'processing' : 'active' as const,
          securityLevel: hasActivity ? 'monitored' : 'safe' as const
        };
      }
      return { ...node, status: 'idle' as const, securityLevel: 'safe' as const };
    }));
  }, [azrActive, agentSActive, processes.length, executionResults]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const getActiveConnections = () => {
    if (!azrActive) return [];
    return processNodes.flatMap(node => {
      const connections = node.connections || [];
      return connections.map(connId => {
        const targetNode = processNodes.find(n => n.id === connId);
        if (!targetNode) return null;
        
        return {
          start: node.position,
          end: targetNode.position,
          active: node.status === 'processing' || node.status === 'active',
          secure: node.securityLevel === 'safe' && targetNode.securityLevel === 'safe'
        };
      }).filter(Boolean) as Array<{
        start: [number, number, number];
        end: [number, number, number];
        active: boolean;
        secure: boolean;
      }>;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-600" />
          Visualisation 3D Sécurisée - AZR + Agent S
          {securityAlert && (
            <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {securityAlert && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <Shield className="h-3 w-3 inline mr-1" />
            Dérive algorithmique détectée - Isolation automatique activée
          </div>
        )}
        
        <AZR3DScene
          processNodes={processNodes}
          onNodeClick={handleNodeClick}
          getActiveConnections={getActiveConnections}
        />
        
        <NodeSelector
          selectedNode={selectedNode}
          processNodes={processNodes}
        />
        
        <ProcessMetrics
          processes={processes}
          executionResults={executionResults}
          processNodes={processNodes}
        />
      </CardContent>
    </Card>
  );
};

export default AZR3DInterface;

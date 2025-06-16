
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ProcessNode } from './ProcessSphere';

interface NodeSelectorProps {
  selectedNode: string | null;
  processNodes: ProcessNode[];
}

const NodeSelector: React.FC<NodeSelectorProps> = ({ selectedNode, processNodes }) => {
  if (!selectedNode) return null;

  const node = processNodes.find(n => n.id === selectedNode);
  if (!node) return null;

  return (
    <div className="mt-3 p-2 border rounded bg-muted/50">
      <div className="flex items-center gap-2">
        <Badge>
          {node.type}
        </Badge>
        <Badge variant={
          node.securityLevel === 'safe' ? 'default' :
          node.securityLevel === 'monitored' ? 'secondary' : 'destructive'
        }>
          {node.securityLevel}
        </Badge>
        <span className="text-sm">
          Statut: {node.status}
        </span>
      </div>
    </div>
  );
};

export default NodeSelector;

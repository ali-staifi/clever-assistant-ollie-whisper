
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { EnvironmentCard } from './EnvironmentCard';
import { ExecutionEnvironment } from '../types/ExecutionSandboxTypes';

interface EnvironmentsListProps {
  environments: ExecutionEnvironment[];
  onQuarantine: (id: string) => void;
  onRestore: (id: string) => void;
}

export const EnvironmentsList: React.FC<EnvironmentsListProps> = ({
  environments,
  onQuarantine,
  onRestore
}) => {
  return (
    <ScrollArea className="h-64">
      <div className="space-y-3">
        {environments.map((env) => (
          <EnvironmentCard
            key={env.id}
            environment={env}
            onQuarantine={onQuarantine}
            onRestore={onRestore}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

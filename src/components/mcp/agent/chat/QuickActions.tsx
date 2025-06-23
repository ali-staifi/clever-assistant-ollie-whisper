
import React from 'react';
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onActionSelect: (action: string) => void;
  isProcessing: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onActionSelect,
  isProcessing
}) => {
  const quickActions = [
    'Analyser la santé du système',
    'Optimiser les performances',
    'Vérifier les connexions',
    'Générer des recommandations'
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onActionSelect(action)}
          disabled={isProcessing}
        >
          {action}
        </Button>
      ))}
    </div>
  );
};

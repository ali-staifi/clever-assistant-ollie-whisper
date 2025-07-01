
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { SecurityMetrics } from '../types/ExecutionSandboxTypes';
import { getThreatLevelColor } from '../utils/ExecutionSandboxUtils';

interface SecurityMetricsPanelProps {
  securityMetrics: SecurityMetrics;
}

export const SecurityMetricsPanel: React.FC<SecurityMetricsPanelProps> = ({
  securityMetrics
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Score Sécurité</span>
          <span className="font-medium">{securityMetrics.securityScore}%</span>
        </div>
        <Progress value={securityMetrics.securityScore} className="h-2" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Niveau Menace</span>
          <span className={`font-medium ${getThreatLevelColor(securityMetrics.threatLevel)}`}>
            {securityMetrics.threatLevel.toUpperCase()}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {securityMetrics.activeThreats} menace(s) active(s)
        </div>
      </div>
    </div>
  );
};

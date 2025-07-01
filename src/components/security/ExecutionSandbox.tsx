
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from 'lucide-react';
import { ExecutionSandboxProps } from './types/ExecutionSandboxTypes';
import { useExecutionSandbox } from '../../hooks/useExecutionSandbox';
import { CodeExecutionPanel } from './components/CodeExecutionPanel';
import { SecurityMetricsPanel } from './components/SecurityMetricsPanel';
import { EnvironmentsList } from './components/EnvironmentsList';

const ExecutionSandbox: React.FC<ExecutionSandboxProps> = ({
  onExecute,
  onQuarantine
}) => {
  const {
    testCode,
    setTestCode,
    selectedEnvironment,
    setSelectedEnvironment,
    isExecuting,
    executionResult,
    environments,
    securityMetrics,
    executeCode,
    quarantineEnvironment,
    restoreEnvironment
  } = useExecutionSandbox();

  const handleExecuteCode = () => {
    executeCode(onExecute);
  };

  const handleQuarantine = (environmentId: string) => {
    quarantineEnvironment(environmentId, onQuarantine);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          Environnements d'Exécution Sécurisés - Fonctionnel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CodeExecutionPanel
          testCode={testCode}
          setTestCode={setTestCode}
          selectedEnvironment={selectedEnvironment}
          setSelectedEnvironment={setSelectedEnvironment}
          environments={environments}
          isExecuting={isExecuting}
          executionResult={executionResult}
          onExecuteCode={handleExecuteCode}
        />

        <SecurityMetricsPanel securityMetrics={securityMetrics} />

        <EnvironmentsList
          environments={environments}
          onQuarantine={handleQuarantine}
          onRestore={restoreEnvironment}
        />

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm">
            <AlertTriangle className="h-4 w-4 inline mr-1 text-green-500" />
            Surveillance active - Exécution réelle
          </div>
          <div className="text-xs text-muted-foreground">
            Dernière vérification: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionSandbox;

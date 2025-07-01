
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Card, CardContent } from "@/components/ui/card";
import ExecutionSandbox from '@/components/security/ExecutionSandbox';
import AlgorithmicDriftMonitor from '@/components/monitoring/AlgorithmicDriftMonitor';
import AgentSOrchestrator from '@/components/agents/AgentSOrchestrator';
import AZR3DInterface from '@/components/visualization/AZR3DInterface';
import AdvancedCommandChat from '@/components/command/AdvancedCommandChat';
import SystemFeedbackManager from '@/components/feedback/SystemFeedbackManager';
import CreationLayer from '@/components/azr/CreationLayer';
import ValidationLayer from '@/components/azr/ValidationLayer';
import AutoImprovementLayer from '@/components/azr/AutoImprovementLayer';
import { Task, ExecutionResult } from '@/hooks/useAZRSystem';

interface GitDatabaseTabsProps {
  isActive: boolean;
  agentSActive: boolean;
  tasks: Task[];
  executionResults: ExecutionResult[];
  isGenerating: boolean;
  handlers: {
    handleSecureExecution: (code: string, environmentId: string) => Promise<any>;
    handleQuarantine: (environmentId: string) => Promise<void>;
    handleDriftDetected: (alert: any) => Promise<void>;
    handleCorrectiveAction: (action: string) => Promise<void>;
    handleEngineSelect: (engineId: string) => Promise<void>;
    handleTaskDistribute: (task: any, engineId: string) => Promise<void>;
    handleAZRCommand: (command: string) => Promise<void>;
    handleAgentSCommand: (command: string) => Promise<void>;
    handleSystemCommand: (command: string) => Promise<void>;
    handleOptimizationApplied: (optimization: string) => Promise<void>;
    handleTaskGenerated: (task: Task) => Promise<void>;
    handleTaskExecuted: (result: ExecutionResult) => Promise<void>;
    handleTaskStatusUpdate: (taskId: string, status: Task['status']) => void;
  };
}

const GitDatabaseTabs: React.FC<GitDatabaseTabsProps> = ({
  isActive,
  agentSActive,
  tasks,
  executionResults,
  isGenerating,
  handlers
}) => {
  const SafeAZR3DInterface = () => (
    <ErrorBoundary fallback={
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Interface 3D temporairement indisponible
          </p>
        </CardContent>
      </Card>
    }>
      <AZR3DInterface
        azrActive={isActive}
        agentSActive={agentSActive}
        processes={tasks}
        executionResults={executionResults}
      />
    </ErrorBoundary>
  );

  return (
    <Tabs defaultValue="security" className="space-y-2">
      <TabsList className="grid w-full grid-cols-10">
        <TabsTrigger value="security">Sécurité</TabsTrigger>
        <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="orchestration">Agent S</TabsTrigger>
        <TabsTrigger value="visualization">Interface 3D</TabsTrigger>
        <TabsTrigger value="command">Chat Commande</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
        <TabsTrigger value="creation">Création AZR</TabsTrigger>
        <TabsTrigger value="validation">Validation</TabsTrigger>
        <TabsTrigger value="improvement">Auto-Amélioration</TabsTrigger>
      </TabsList>

      <TabsContent value="security">
        <ExecutionSandbox
          onExecute={handlers.handleSecureExecution}
          onQuarantine={handlers.handleQuarantine}
        />
      </TabsContent>

      <TabsContent value="monitoring">
        <AlgorithmicDriftMonitor
          executionResults={executionResults}
          onDriftDetected={handlers.handleDriftDetected}
          onCorrectiveAction={handlers.handleCorrectiveAction}
        />
      </TabsContent>

      <TabsContent value="overview" className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SafeAZR3DInterface />
          <ErrorBoundary>
            <SystemFeedbackManager
              azrActive={isActive}
              agentSActive={agentSActive}
              executionResults={executionResults}
              onOptimizationApplied={handlers.handleOptimizationApplied}
            />
          </ErrorBoundary>
        </div>
      </TabsContent>

      <TabsContent value="orchestration">
        <AgentSOrchestrator
          onEngineSelect={handlers.handleEngineSelect}
          onTaskDistribute={handlers.handleTaskDistribute}
        />
      </TabsContent>

      <TabsContent value="visualization">
        <SafeAZR3DInterface />
      </TabsContent>

      <TabsContent value="command">
        <AdvancedCommandChat
          onAZRCommand={handlers.handleAZRCommand}
          onAgentSCommand={handlers.handleAgentSCommand}
          onSystemCommand={handlers.handleSystemCommand}
          systemStatus={{
            azrActive: isActive,
            agentSActive: agentSActive,
            processCount: tasks.length
          }}
        />
      </TabsContent>

      <TabsContent value="feedback">
        <ErrorBoundary>
          <SystemFeedbackManager
            azrActive={isActive}
            agentSActive={agentSActive}
            executionResults={executionResults}
            onOptimizationApplied={handlers.handleOptimizationApplied}
          />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="creation">
        <CreationLayer 
          onTaskGenerated={handlers.handleTaskGenerated}
          isGenerating={isGenerating}
        />
      </TabsContent>

      <TabsContent value="validation">
        <ValidationLayer 
          tasks={tasks}
          onTaskExecuted={handlers.handleTaskExecuted}
          onTaskStatusUpdate={handlers.handleTaskStatusUpdate}
        />
      </TabsContent>

      <TabsContent value="improvement">
        <AutoImprovementLayer 
          executionResults={executionResults}
        />
      </TabsContent>
    </Tabs>
  );
};

export default GitDatabaseTabs;

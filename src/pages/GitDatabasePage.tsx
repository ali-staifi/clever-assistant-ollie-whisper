
import React from 'react';
import { useAZRSystem } from '@/hooks/useAZRSystem';
import { useAZRHandlers } from '@/hooks/useAZRHandlers';
import GitDatabaseHeader from '@/components/git-database/GitDatabaseHeader';
import GitDatabaseControls from '@/components/git-database/GitDatabaseControls';
import GitDatabaseTabs from '@/components/git-database/GitDatabaseTabs';

const GitDatabasePage: React.FC = () => {
  const {
    isActive,
    agentSActive,
    tasks,
    setTasks,
    executionResults,
    setExecutionResults,
    isGenerating,
    setIsGenerating,
    selectedEngine,
    setSelectedEngine,
    connectionStatus,
    isLLMGenerating,
    memoryContext,
    activateSystem,
    deactivateSystem,
    enhancedLLMQuery
  } = useAZRSystem();

  const handlers = useAZRHandlers({
    setTasks,
    setExecutionResults,
    setIsGenerating,
    setSelectedEngine,
    memoryContext
  });

  const enhancedLLMQuerySecurity = async () => {
    enhancedLLMQuery("Évalue les vulnérabilités de sécurité du système intégré AZR + Agent S et propose des mesures de protection avancées");
  };

  return (
    <div className="container py-2 min-h-full">
      <GitDatabaseHeader
        isActive={isActive}
        agentSActive={agentSActive}
        connectionStatus={connectionStatus}
        tasksCount={tasks.length}
      />

      <GitDatabaseControls
        isActive={isActive}
        isLLMGenerating={isLLMGenerating}
        onActivateSystem={activateSystem}
        onDeactivateSystem={deactivateSystem}
        onSecurityAnalysis={enhancedLLMQuerySecurity}
      />

      <GitDatabaseTabs
        isActive={isActive}
        agentSActive={agentSActive}
        tasks={tasks}
        executionResults={executionResults}
        isGenerating={isGenerating}
        handlers={handlers}
      />
    </div>
  );
};

export default GitDatabasePage;

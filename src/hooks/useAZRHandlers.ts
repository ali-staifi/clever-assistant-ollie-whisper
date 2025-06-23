
import { useToast } from "@/hooks/use-toast";
import { Task, ExecutionResult } from './useAZRSystem';

interface UseAZRHandlersProps {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setExecutionResults: React.Dispatch<React.SetStateAction<ExecutionResult[]>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedEngine: React.Dispatch<React.SetStateAction<string>>;
  memoryContext: any;
}

export const useAZRHandlers = ({
  setTasks,
  setExecutionResults,
  setIsGenerating,
  setSelectedEngine,
  memoryContext
}: UseAZRHandlersProps) => {
  const { toast } = useToast();

  const handleTaskGenerated = async (task: Task) => {
    setTasks(prev => [task, ...prev]);
    setIsGenerating(true);
    
    await memoryContext.addContextualMemory(
      `Nouvelle tâche générée (${task.type}): ${task.description}`,
      'context',
      7,
      ['azr', 'task-generation', task.type]
    );
    
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const handleTaskExecuted = async (result: ExecutionResult) => {
    setExecutionResults(prev => [...prev, result]);
    
    await memoryContext.addContextualMemory(
      `Tâche exécutée: ${result.success ? 'Succès' : 'Échec'} - Learnability: ${result.learnabilityReward.toFixed(1)}, Accuracy: ${result.accuracyReward.toFixed(1)}`,
      'knowledge',
      result.success ? 8 : 6,
      ['azr', 'execution', result.success ? 'success' : 'failure']
    );
  };

  const handleTaskStatusUpdate = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const handleEngineSelect = async (engineId: string) => {
    setSelectedEngine(engineId);
    await memoryContext.addContextualMemory(
      `Agent S: Moteur ${engineId} sélectionné pour l'exécution`,
      'context',
      7,
      ['agents', 'engine-selection', 'optimization']
    );
  };

  const handleTaskDistribute = async (task: any, engineId: string) => {
    await memoryContext.addContextualMemory(
      `Tâche distribuée vers moteur ${engineId}: ${task.description}`,
      'context',
      6,
      ['agents', 'task-distribution', 'orchestration']
    );
  };

  const handleAZRCommand = async (command: string) => {
    await memoryContext.addContextualMemory(
      `Commande AZR exécutée: ${command}`,
      'context',
      7,
      ['azr', 'command', 'user-control']
    );
  };

  const handleAgentSCommand = async (command: string) => {
    await memoryContext.addContextualMemory(
      `Commande Agent S exécutée: ${command}`,
      'context',
      7,
      ['agents', 'command', 'user-control']
    );
  };

  const handleSystemCommand = async (command: string) => {
    await memoryContext.addContextualMemory(
      `Commande système exécutée: ${command}`,
      'context',
      6,
      ['system', 'command', 'user-control']
    );
  };

  const handleOptimizationApplied = async (optimization: string) => {
    await memoryContext.addContextualMemory(
      `Optimisation automatique appliquée: ${optimization}`,
      'knowledge',
      8,
      ['optimization', 'auto-improvement', 'feedback']
    );
    
    toast({
      title: "Optimisation appliquée",
      description: optimization,
    });
  };

  const handleSecureExecution = async (code: string, environmentId: string) => {
    await memoryContext.addContextualMemory(
      `Exécution sécurisée dans environnement ${environmentId}: ${code.substring(0, 50)}...`,
      'context',
      7,
      ['security', 'execution', 'sandbox']
    );
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: Math.random() > 0.2,
          output: `Résultat sécurisé de ${environmentId}`,
          executionTime: Math.random() * 1000 + 100
        });
      }, 1000);
    });
  };

  const handleQuarantine = async (environmentId: string) => {
    await memoryContext.addContextualMemory(
      `Environnement ${environmentId} mis en quarantaine pour raisons de sécurité`,
      'context',
      8,
      ['security', 'quarantine', 'isolation']
    );
    
    toast({
      title: "Environnement mis en quarantaine",
      description: `${environmentId} isolé pour analyse de sécurité`,
      variant: "destructive",
    });
  };

  const handleDriftDetected = async (alert: any) => {
    await memoryContext.addContextualMemory(
      `Dérive algorithmique détectée: ${alert.message}`,
      'context',
      9,
      ['monitoring', 'drift', 'alert', alert.severity]
    );
    
    toast({
      title: "Dérive Algorithmique Détectée",
      description: alert.message,
      variant: alert.severity === 'critical' ? "destructive" : "default",
    });
  };

  const handleCorrectiveAction = async (action: string) => {
    await memoryContext.addContextualMemory(
      `Action corrective appliquée: ${action}`,
      'context',
      8,
      ['monitoring', 'correction', 'stability']
    );
    
    toast({
      title: "Action Corrective Appliquée",
      description: action,
    });
  };

  return {
    handleTaskGenerated,
    handleTaskExecuted,
    handleTaskStatusUpdate,
    handleEngineSelect,
    handleTaskDistribute,
    handleAZRCommand,
    handleAgentSCommand,
    handleSystemCommand,
    handleOptimizationApplied,
    handleSecureExecution,
    handleQuarantine,
    handleDriftDetected,
    handleCorrectiveAction
  };
};

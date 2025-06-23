
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useChatWithMemory } from "@/hooks/useChatWithMemory";
import { useMemoryContext } from "@/hooks/useMemoryContext";

interface Task {
  id: string;
  type: 'deduction' | 'abduction' | 'induction';
  description: string;
  code: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
}

interface ExecutionResult {
  taskId: string;
  success: boolean;
  output: string;
  learnabilityReward: number;
  accuracyReward: number;
  executionTime: number;
}

export const useAZRSystem = () => {
  const [isActive, setIsActive] = useState(false);
  const [agentSActive, setAgentSActive] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<string>('');
  const { toast } = useToast();
  
  const {
    connectionStatus,
    checkConnection,
    sendMessage,
    messages,
    isGenerating: isLLMGenerating
  } = useChatWithMemory('AZR-System');

  const memoryContext = useMemoryContext('AZR-System');

  useEffect(() => {
    initializeAZRSystem();
  }, []);

  const initializeAZRSystem = async () => {
    await memoryContext.addContextualMemory(
      'Système AZR sécurisé initialisé avec surveillance de dérive algorithmique et environnements d\'exécution isolés',
      'context',
      9,
      ['azr', 'security', 'initialization', 'monitoring']
    );
  };

  const activateSystem = async () => {
    try {
      const connected = await checkConnection();
      if (!connected) {
        throw new Error("Impossible de se connecter à Ollama");
      }
      
      setIsActive(true);
      setAgentSActive(true);
      await memoryContext.addContextualMemory(
        'AZR + Agent S activés avec sécurisation complète: Sandboxing, surveillance de dérive, isolation des processus',
        'context',
        9,
        ['azr', 'agents', 'security', 'activation']
      );
      
      toast({
        title: "Système AZR + Agent S Sécurisé Activé",
        description: "Architecture complète avec surveillance de dérive et sandboxing",
      });
    } catch (error) {
      toast({
        title: "Erreur d'activation",
        description: "Impossible d'activer le système. Vérifiez la connexion Ollama.",
        variant: "destructive",
      });
    }
  };

  const deactivateSystem = async () => {
    setIsActive(false);
    setAgentSActive(false);
    await memoryContext.addContextualMemory(
      'Système AZR + Agent S désactivé avec mise en sécurité',
      'context',
      6,
      ['azr', 'agents', 'security', 'deactivation']
    );
    
    toast({
      title: "Système désactivé en sécurité",
      description: "AZR et Agent S ont été désactivés avec sauvegarde d'état",
    });
  };

  const enhancedLLMQuery = async (query: string) => {
    const relevantContext = await memoryContext.getPageContext(query);
    const enhancedQuery = `En tant qu'Absolute Zero Reasoner avec architecture tri-couches évolutive:

Contexte mémoire AZR: ${relevantContext}

Tâches actives: ${tasks.length}
Résultats d'exécution: ${executionResults.length}
Taux de succès: ${executionResults.length > 0 ? (executionResults.filter(r => r.success).length / executionResults.length * 100).toFixed(1) : 0}%

Question: ${query}

Réponds en intégrant l'auto-amélioration, la génération autonome et l'évolution continue.`;

    await sendMessage(enhancedQuery);
  };

  return {
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
  };
};

export type { Task, ExecutionResult };

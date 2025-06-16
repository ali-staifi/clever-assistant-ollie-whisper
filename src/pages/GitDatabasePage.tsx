import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Database, Settings, Play, Square, TrendingUp, Cpu, Terminal, ArrowRightLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useChatWithMemory } from "@/hooks/useChatWithMemory";
import { useMemoryContext } from "@/hooks/useMemoryContext";

// Import des composants AZR existants
import CreationLayer from '@/components/azr/CreationLayer';
import ValidationLayer from '@/components/azr/ValidationLayer';
import AutoImprovementLayer from '@/components/azr/AutoImprovementLayer';

// Import des nouveaux composants
import AgentSOrchestrator from '@/components/agents/AgentSOrchestrator';
import AZR3DInterface from '@/components/visualization/AZR3DInterface';
import AdvancedCommandChat from '@/components/command/AdvancedCommandChat';
import SystemFeedbackManager from '@/components/feedback/SystemFeedbackManager';

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

const GitDatabasePage: React.FC = () => {
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
    // Initialisation et chargement du contexte mémoire
    initializeAZRSystem();
  }, []);

  const initializeAZRSystem = async () => {
    await memoryContext.addContextualMemory(
      'Système AZR initialisé avec architecture évolutive tri-couches: Création, Validation, Auto-Amélioration',
      'context',
      9,
      ['azr', 'initialization', 'architecture']
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
        'AZR + Agent S activés: Architecture complète opérationnelle avec orchestration multi-moteurs',
        'context',
        9,
        ['azr', 'agents', 'activation', 'orchestration']
      );
      
      toast({
        title: "Système AZR + Agent S activé",
        description: "Architecture évolutive complète avec orchestration multi-moteurs",
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
      'Système AZR + Agent S désactivé',
      'context',
      6,
      ['azr', 'agents', 'deactivation']
    );
    
    toast({
      title: "Système désactivé",
      description: "AZR et Agent S ont été désactivés",
    });
  };

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

  const enhancedLLMQuery = async (query: string) => {
    // Enrichissement avec contexte AZR
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

  return (
    <div className="container py-2 min-h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            AZR + Agent S - Architecture Intégrée
          </h1>
          <p className="text-muted-foreground text-sm">
            Orchestration Multi-Moteurs • Raisonnement Autonome • Interface 3D • Chat de Commande • Feedback Automatique
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isActive ? "default" : "secondary"}>
            AZR: {isActive ? "Actif" : "En Veille"}
          </Badge>
          <Badge variant={agentSActive ? "default" : "secondary"}>
            Agent S: {agentSActive ? "Actif" : "Inactif"}
          </Badge>
          <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
            LLM: {connectionStatus}
          </Badge>
          <Badge variant="outline">
            Tâches: {tasks.length}
          </Badge>
        </div>
      </div>

      <div className="mb-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex space-x-2">
              {!isActive ? (
                <Button onClick={activateSystem} size="sm" className="flex items-center">
                  <Play className="h-3 w-3 mr-1" />
                  Activer Architecture Complète
                </Button>
              ) : (
                <Button onClick={deactivateSystem} variant="destructive" size="sm">
                  <Square className="h-3 w-3 mr-1" />
                  Désactiver Système
                </Button>
              )}
              <Button 
                onClick={() => enhancedLLMQuery("Évalue les performances du système intégré AZR + Agent S et propose des optimisations avancées")}
                disabled={!isActive || isLLMGenerating}
                variant="outline"
                size="sm"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Analyse Performance Globale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-2">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="orchestration">Agent S</TabsTrigger>
          <TabsTrigger value="visualization">Interface 3D</TabsTrigger>
          <TabsTrigger value="command">Chat Commande</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="creation">Création AZR</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="improvement">Auto-Amélioration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AZR3DInterface
              azrActive={isActive}
              agentSActive={agentSActive}
              processes={tasks}
              executionResults={executionResults}
            />
            <SystemFeedbackManager
              azrActive={isActive}
              agentSActive={agentSActive}
              executionResults={executionResults}
              onOptimizationApplied={handleOptimizationApplied}
            />
          </div>
        </TabsContent>

        <TabsContent value="orchestration">
          <AgentSOrchestrator
            onEngineSelect={handleEngineSelect}
            onTaskDistribute={handleTaskDistribute}
          />
        </TabsContent>

        <TabsContent value="visualization">
          <AZR3DInterface
            azrActive={isActive}
            agentSActive={agentSActive}
            processes={tasks}
            executionResults={executionResults}
          />
        </TabsContent>

        <TabsContent value="command">
          <AdvancedCommandChat
            onAZRCommand={handleAZRCommand}
            onAgentSCommand={handleAgentSCommand}
            onSystemCommand={handleSystemCommand}
            systemStatus={{
              azrActive: isActive,
              agentSActive: agentSActive,
              processCount: tasks.length
            }}
          />
        </TabsContent>

        <TabsContent value="feedback">
          <SystemFeedbackManager
            azrActive={isActive}
            agentSActive={agentSActive}
            executionResults={executionResults}
            onOptimizationApplied={handleOptimizationApplied}
          />
        </TabsContent>

        <TabsContent value="creation">
          <CreationLayer 
            onTaskGenerated={handleTaskGenerated}
            isGenerating={isGenerating}
          />
        </TabsContent>

        <TabsContent value="validation">
          <ValidationLayer 
            tasks={tasks}
            onTaskExecuted={handleTaskExecuted}
            onTaskStatusUpdate={handleTaskStatusUpdate}
          />
        </TabsContent>

        <TabsContent value="improvement">
          <AutoImprovementLayer 
            executionResults={executionResults}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GitDatabasePage;

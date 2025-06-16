
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Database, Settings, Play, Square, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useChatWithMemory } from "@/hooks/useChatWithMemory";
import { useMemoryContext } from "@/hooks/useMemoryContext";

// Import des nouvelles couches AZR
import CreationLayer from '@/components/azr/CreationLayer';
import ValidationLayer from '@/components/azr/ValidationLayer';
import AutoImprovementLayer from '@/components/azr/AutoImprovementLayer';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
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
      await memoryContext.addContextualMemory(
        'AZR activé: Début de génération autonome de tâches et auto-amélioration',
        'context',
        8,
        ['azr', 'activation', 'autonomous']
      );
      
      toast({
        title: "Absolute Zero Reasoner activé",
        description: "Architecture évolutive tri-couches opérationnelle",
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
    await memoryContext.addContextualMemory(
      'AZR désactivé: Système mis en pause',
      'context',
      6,
      ['azr', 'deactivation']
    );
    
    toast({
      title: "Système désactivé",
      description: "Absolute Zero Reasoner a été désactivé",
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
            Absolute Zero Reasoner
          </h1>
          <p className="text-muted-foreground text-sm">
            Architecture Évolutive Tri-Couches • Auto-Génération • Validation Python • Auto-Amélioration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Système Actif" : "En Veille"}
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
                  Activer AZR
                </Button>
              ) : (
                <Button onClick={deactivateSystem} variant="destructive" size="sm">
                  <Square className="h-3 w-3 mr-1" />
                  Désactiver
                </Button>
              )}
              <Button 
                onClick={() => enhancedLLMQuery("Évalue les performances actuelles du système AZR et propose des optimisations")}
                disabled={!isActive || isLLMGenerating}
                variant="outline"
                size="sm"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Analyse Performance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="architecture" className="space-y-2">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="creation">Création</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="improvement">Auto-Amélioration</TabsTrigger>
          <TabsTrigger value="analysis">Analyse LLM</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  Couche Création
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Génération autonome de tâches de raisonnement (déduction, abduction, induction)</p>
                <Badge className="mt-2">Auto-Génératif</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Play className="h-4 w-4 mr-2 text-green-600" />
                  Couche Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Exécution Python simulée avec système de récompenses (learnability + accuracy)</p>
                <Badge className="mt-2">Validation Python</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                  Auto-Amélioration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Mémoire évolutive (STM/LTM), auto-réparation et optimisation continue</p>
                <Badge className="mt-2">Évolutif</Badge>
              </CardContent>
            </Card>
          </div>
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

        <TabsContent value="analysis">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Analyse LLM Intégrée</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {messages[messages.length - 1]?.content || 'Aucune analyse disponible...'}
                </div>
              )}
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Cliquez sur "Analyse Performance" pour obtenir une évaluation LLM du système AZR
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GitDatabasePage;

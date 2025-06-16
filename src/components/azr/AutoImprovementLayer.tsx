
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Brain, Database, RefreshCw, TrendingUp } from 'lucide-react';
import { useMemoryContext } from '@/hooks/useMemoryContext';

interface ExecutionResult {
  taskId: string;
  success: boolean;
  output: string;
  learnabilityReward: number;
  accuracyReward: number;
  executionTime: number;
}

interface MemoryEntry {
  id: string;
  content: string;
  type: 'success' | 'failure' | 'optimization';
  reward: number;
  timestamp: Date;
}

interface AutoImprovementLayerProps {
  executionResults: ExecutionResult[];
}

const AutoImprovementLayer: React.FC<AutoImprovementLayerProps> = ({ executionResults }) => {
  const [shortTermMemory, setShortTermMemory] = useState<MemoryEntry[]>([]);
  const [longTermMemory, setLongTermMemory] = useState<MemoryEntry[]>([]);
  const [improvementMetrics, setImprovementMetrics] = useState({
    successRate: 0,
    avgLearnability: 0,
    avgAccuracy: 0,
    totalTasks: 0
  });
  
  const memoryContext = useMemoryContext('AZR-AutoImprovement');

  useEffect(() => {
    if (executionResults.length > 0) {
      updateMemoryAndMetrics();
    }
  }, [executionResults]);

  const updateMemoryAndMetrics = async () => {
    const recent = executionResults.slice(-10); // STM: 10 derniers résultats
    const allResults = executionResults;

    // Mise à jour STM
    const stmEntries: MemoryEntry[] = recent.map(result => ({
      id: result.taskId,
      content: result.success ? `Succès: ${result.output}` : `Échec: ${result.output}`,
      type: result.success ? 'success' : 'failure',
      reward: result.learnabilityReward + result.accuracyReward,
      timestamp: new Date()
    }));
    setShortTermMemory(stmEntries);

    // Mise à jour LTM avec compression intelligente
    const failures = allResults.filter(r => !r.success);
    const ltmEntries: MemoryEntry[] = failures.map(result => ({
      id: `ltm-${result.taskId}`,
      content: `Erreur archivée: ${result.output} - Leçon apprise`,
      type: 'failure',
      reward: result.learnabilityReward,
      timestamp: new Date()
    }));
    setLongTermMemory(ltmEntries);

    // Calcul des métriques
    const successCount = allResults.filter(r => r.success).length;
    const successRate = allResults.length > 0 ? (successCount / allResults.length) * 100 : 0;
    const avgLearnability = allResults.reduce((sum, r) => sum + r.learnabilityReward, 0) / allResults.length || 0;
    const avgAccuracy = allResults.reduce((sum, r) => sum + r.accuracyReward, 0) / allResults.length || 0;

    setImprovementMetrics({
      successRate,
      avgLearnability,
      avgAccuracy,
      totalTasks: allResults.length
    });

    // Intégration avec le système de mémoire global
    await memoryContext.addContextualMemory(
      `AZR Performance: ${successRate.toFixed(1)}% succès, ${avgLearnability.toFixed(1)} learnability, ${avgAccuracy.toFixed(1)} accuracy`,
      'knowledge',
      8,
      ['azr', 'performance', 'metrics']
    );
  };

  const optimizeSystem = async () => {
    // Simulation d'auto-optimisation
    const optimizations = [
      "Ajustement des paramètres de génération de tâches",
      "Optimisation de l'allocation mémoire",
      "Amélioration des algorithmes de validation",
      "Mise à jour des patterns de raisonnement"
    ];

    const selectedOptimization = optimizations[Math.floor(Math.random() * optimizations.length)];
    
    const optimizationEntry: MemoryEntry = {
      id: `opt-${Date.now()}`,
      content: selectedOptimization,
      type: 'optimization',
      reward: Math.random() * 5 + 5,
      timestamp: new Date()
    };

    setLongTermMemory(prev => [...prev, optimizationEntry]);
    
    await memoryContext.addContextualMemory(
      `Auto-optimisation AZR: ${selectedOptimization}`,
      'context',
      7,
      ['azr', 'optimization', 'auto-improvement']
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Couche Auto-Amélioration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métriques de performance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taux de succès</span>
              <span>{improvementMetrics.successRate.toFixed(1)}%</span>
            </div>
            <Progress value={improvementMetrics.successRate} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Learnability Avg</span>
              <span>{improvementMetrics.avgLearnability.toFixed(1)}</span>
            </div>
            <Progress value={(improvementMetrics.avgLearnability / 10) * 100} className="h-2" />
          </div>
        </div>

        {/* Mémoires */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">STM ({shortTermMemory.length})</span>
            </div>
            <ScrollArea className="h-32 border rounded p-2">
              {shortTermMemory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="text-xs mb-1 p-1 bg-muted/50 rounded">
                  <Badge className={entry.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {entry.type}
                  </Badge>
                  <div className="mt-1">{entry.content.substring(0, 50)}...</div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">LTM ({longTermMemory.length})</span>
            </div>
            <ScrollArea className="h-32 border rounded p-2">
              {longTermMemory.slice(-5).map((entry) => (
                <div key={entry.id} className="text-xs mb-1 p-1 bg-muted/50 rounded">
                  <Badge className="bg-purple-100 text-purple-800">
                    {entry.type}
                  </Badge>
                  <div className="mt-1">{entry.content.substring(0, 50)}...</div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        {/* Auto-optimisation */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm">
            <span className="font-medium">Tâches totales: </span>
            <span>{improvementMetrics.totalTasks}</span>
          </div>
          <Button onClick={optimizeSystem} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Auto-Optimiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoImprovementLayer;

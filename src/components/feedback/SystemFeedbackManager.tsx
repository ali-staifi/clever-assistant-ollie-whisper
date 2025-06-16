
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useMemoryContext } from '@/hooks/useMemoryContext';

interface FeedbackEvent {
  id: string;
  source: 'azr' | 'agents';
  target: 'azr' | 'agents';
  type: 'performance' | 'optimization' | 'error' | 'success';
  message: string;
  impact: number; // 0-10
  timestamp: Date;
  processed: boolean;
}

interface SystemMetrics {
  azrPerformance: number;
  agentSEfficiency: number;
  taskSuccessRate: number;
  resourceOptimization: number;
  overallHealth: number;
}

interface SystemFeedbackManagerProps {
  azrActive: boolean;
  agentSActive: boolean;
  executionResults: any[];
  onOptimizationApplied: (optimization: string) => void;
}

const SystemFeedbackManager: React.FC<SystemFeedbackManagerProps> = ({
  azrActive,
  agentSActive,
  executionResults,
  onOptimizationApplied
}) => {
  const [feedbackEvents, setFeedbackEvents] = useState<FeedbackEvent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    azrPerformance: 85,
    agentSEfficiency: 92,
    taskSuccessRate: 78,
    resourceOptimization: 88,
    overallHealth: 85
  });
  const [autoOptimization, setAutoOptimization] = useState(true);

  const memoryContext = useMemoryContext('SystemFeedback');

  useEffect(() => {
    // Génération de feedback automatique basé sur les performances
    if (azrActive && agentSActive) {
      generatePerformanceFeedback();
    }
  }, [executionResults.length, azrActive, agentSActive]);

  useEffect(() => {
    // Traitement automatique des événements de feedback
    if (autoOptimization) {
      processHighImpactFeedback();
    }
  }, [feedbackEvents, autoOptimization]);

  const generatePerformanceFeedback = () => {
    const recentResults = executionResults.slice(-5);
    const successRate = recentResults.length > 0 
      ? (recentResults.filter(r => r.success).length / recentResults.length) * 100 
      : 0;

    // Feedback d'AZR vers Agent S
    if (successRate < 70) {
      addFeedbackEvent({
        source: 'azr',
        target: 'agents',
        type: 'optimization',
        message: `Taux de succès faible (${successRate.toFixed(1)}%). Suggestion: optimiser la sélection des moteurs d'exécution`,
        impact: 8
      });
    }

    // Feedback d'Agent S vers AZR
    if (metrics.agentSEfficiency > 90) {
      addFeedbackEvent({
        source: 'agents',
        target: 'azr',
        type: 'performance',
        message: `Moteurs optimisés. Augmentation recommandée de la complexité des tâches générées`,
        impact: 6
      });
    }

    // Mise à jour des métriques
    setMetrics(prev => ({
      ...prev,
      taskSuccessRate: successRate,
      azrPerformance: Math.max(50, Math.min(100, prev.azrPerformance + (Math.random() - 0.5) * 10)),
      agentSEfficiency: Math.max(60, Math.min(100, prev.agentSEfficiency + (Math.random() - 0.5) * 5)),
      overallHealth: (prev.azrPerformance + prev.agentSEfficiency + successRate) / 3
    }));
  };

  const addFeedbackEvent = async (event: Omit<FeedbackEvent, 'id' | 'timestamp' | 'processed'>) => {
    const newEvent: FeedbackEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date(),
      processed: false
    };

    setFeedbackEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Garder les 20 derniers

    await memoryContext.addContextualMemory(
      `Feedback système: ${event.source} → ${event.target}: ${event.message}`,
      'context',
      event.impact,
      ['feedback', 'system-optimization', event.type]
    );
  };

  const processHighImpactFeedback = () => {
    const unprocessedHighImpact = feedbackEvents.filter(
      e => !e.processed && e.impact >= 7
    );

    unprocessedHighImpact.forEach(async (event) => {
      // Traitement automatique des optimisations à fort impact
      if (event.type === 'optimization') {
        await applyOptimization(event);
      }
      
      // Marquer comme traité
      setFeedbackEvents(prev => 
        prev.map(e => e.id === event.id ? { ...e, processed: true } : e)
      );
    });
  };

  const applyOptimization = async (event: FeedbackEvent) => {
    let optimizationMessage = '';

    if (event.source === 'azr' && event.target === 'agents') {
      // AZR suggère des optimisations à Agent S
      optimizationMessage = 'Agent S: Redistribution des tâches vers les moteurs les plus performants';
      setMetrics(prev => ({ ...prev, agentSEfficiency: Math.min(100, prev.agentSEfficiency + 5) }));
    } else if (event.source === 'agents' && event.target === 'azr') {
      // Agent S suggère des optimisations à AZR
      optimizationMessage = 'AZR: Ajustement de la complexité des tâches générées';
      setMetrics(prev => ({ ...prev, azrPerformance: Math.min(100, prev.azrPerformance + 5) }));
    }

    onOptimizationApplied(optimizationMessage);

    await memoryContext.addContextualMemory(
      `Optimisation appliquée: ${optimizationMessage}`,
      'knowledge',
      8,
      ['optimization', 'auto-improvement', 'system-adaptation']
    );
  };

  const manuallyProcessFeedback = async (eventId: string) => {
    const event = feedbackEvents.find(e => e.id === eventId);
    if (event && !event.processed) {
      await applyOptimization(event);
      setFeedbackEvents(prev => 
        prev.map(e => e.id === eventId ? { ...e, processed: true } : e)
      );
    }
  };

  const getEventIcon = (type: FeedbackEvent['type']) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'optimization': return <ArrowRightLeft className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: FeedbackEvent['type']) => {
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'optimization': return 'bg-purple-100 text-purple-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <ArrowRightLeft className="h-5 w-5 mr-2 text-orange-600" />
          Gestionnaire de Feedback Système
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métriques système */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Performance AZR</span>
              <span>{metrics.azrPerformance.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.azrPerformance} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Efficacité Agent S</span>
              <span>{metrics.agentSEfficiency.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.agentSEfficiency} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taux de succès</span>
              <span>{metrics.taskSuccessRate.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.taskSuccessRate} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Santé globale</span>
              <span>{metrics.overallHealth.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.overallHealth} className="h-2" />
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Événements de Feedback</span>
          <Button
            onClick={() => setAutoOptimization(!autoOptimization)}
            size="sm"
            variant={autoOptimization ? "default" : "outline"}
          >
            Auto-Optimisation {autoOptimization ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Liste des événements de feedback */}
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {feedbackEvents.map((event) => (
              <div key={event.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <Badge className={getEventColor(event.type)}>
                      {event.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {event.source} → {event.target}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Impact: {event.impact}/10</span>
                    {event.processed && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </div>
                </div>
                
                <p className="text-sm mb-2">{event.message}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                  {!event.processed && event.impact >= 7 && (
                    <Button
                      onClick={() => manuallyProcessFeedback(event.id)}
                      size="sm"
                      variant="outline"
                    >
                      Appliquer
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {feedbackEvents.length === 0 && (
              <div className="text-center text-muted-foreground py-4 text-sm">
                Aucun événement de feedback
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SystemFeedbackManager;

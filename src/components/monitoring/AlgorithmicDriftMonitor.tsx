
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, AlertTriangle, BarChart3, RefreshCw } from 'lucide-react';

interface DriftMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  trend: 'stable' | 'increasing' | 'decreasing' | 'critical';
  history: number[];
  lastUpdate: Date;
}

interface DriftAlert {
  id: string;
  type: 'performance' | 'accuracy' | 'behavior' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface AlgorithmicDriftMonitorProps {
  executionResults: any[];
  onDriftDetected: (alert: DriftAlert) => void;
  onCorrectiveAction: (action: string) => void;
}

const AlgorithmicDriftMonitor: React.FC<AlgorithmicDriftMonitorProps> = ({
  executionResults,
  onDriftDetected,
  onCorrectiveAction
}) => {
  const [driftMetrics, setDriftMetrics] = useState<DriftMetric[]>([
    {
      id: 'success-rate',
      name: 'Taux de Succès',
      value: 85,
      threshold: 70,
      trend: 'stable',
      history: [85, 83, 87, 85, 84],
      lastUpdate: new Date()
    },
    {
      id: 'accuracy-score',
      name: 'Score de Précision',
      value: 92,
      threshold: 80,
      trend: 'stable',
      history: [92, 90, 94, 92, 93],
      lastUpdate: new Date()
    },
    {
      id: 'response-time',
      name: 'Temps de Réponse',
      value: 245,
      threshold: 500,
      trend: 'stable',
      history: [245, 230, 260, 245, 240],
      lastUpdate: new Date()
    },
    {
      id: 'memory-efficiency',
      name: 'Efficacité Mémoire',
      value: 78,
      threshold: 60,
      trend: 'stable',
      history: [78, 75, 80, 78, 77],
      lastUpdate: new Date()
    }
  ]);

  const [driftAlerts, setDriftAlerts] = useState<DriftAlert[]>([]);
  const [stabilityScore, setStabilityScore] = useState(95);
  const [monitoringActive, setMonitoringActive] = useState(true);

  useEffect(() => {
    if (!monitoringActive) return;

    const monitoringInterval = setInterval(() => {
      updateDriftMetrics();
      detectAlgorithmicDrift();
    }, 5000);

    return () => clearInterval(monitoringInterval);
  }, [executionResults, monitoringActive]);

  const updateDriftMetrics = () => {
    setDriftMetrics(prev => prev.map(metric => {
      // Calcul des nouvelles métriques basé sur les résultats d'exécution
      let newValue = metric.value;
      
      if (executionResults.length > 0) {
        switch (metric.id) {
          case 'success-rate':
            newValue = (executionResults.filter(r => r.success).length / executionResults.length) * 100;
            break;
          case 'accuracy-score':
            newValue = executionResults.reduce((sum, r) => sum + r.accuracyReward, 0) / executionResults.length;
            break;
          case 'response-time':
            newValue = executionResults.reduce((sum, r) => sum + r.executionTime, 0) / executionResults.length;
            break;
          case 'memory-efficiency':
            // Simulation basée sur la performance
            newValue = Math.max(50, metric.value + (Math.random() - 0.5) * 20);
            break;
        }
      } else {
        // Simulation pour démonstration
        newValue = metric.value + (Math.random() - 0.5) * 10;
      }

      // Calcul de la tendance
      const newHistory = [...metric.history, newValue].slice(-10);
      const recentTrend = newHistory.slice(-3);
      const avgRecent = recentTrend.reduce((sum, val) => sum + val, 0) / recentTrend.length;
      const avgPrevious = newHistory.slice(-6, -3).reduce((sum, val) => sum + val, 0) / 3;
      
      let trend: DriftMetric['trend'] = 'stable';
      const change = avgRecent - avgPrevious;
      
      if (Math.abs(change) > metric.threshold * 0.2) {
        trend = 'critical';
      } else if (Math.abs(change) > metric.threshold * 0.1) {
        trend = change > 0 ? 'increasing' : 'decreasing';
      }

      return {
        ...metric,
        value: newValue,
        history: newHistory,
        trend,
        lastUpdate: new Date()
      };
    }));
  };

  const detectAlgorithmicDrift = () => {
    driftMetrics.forEach(metric => {
      const isDrifting = 
        (metric.id === 'response-time' && metric.value > metric.threshold) ||
        (metric.id !== 'response-time' && metric.value < metric.threshold);

      if (isDrifting && metric.trend === 'critical') {
        const alert: DriftAlert = {
          id: `alert-${Date.now()}-${metric.id}`,
          type: metric.id.includes('accuracy') ? 'accuracy' : 
                metric.id.includes('time') ? 'performance' : 'behavior',
          severity: metric.value < metric.threshold * 0.5 ? 'critical' : 'high',
          message: `Dérive détectée: ${metric.name} = ${metric.value.toFixed(1)} (seuil: ${metric.threshold})`,
          timestamp: new Date(),
          resolved: false
        };

        setDriftAlerts(prev => {
          const exists = prev.some(a => a.message === alert.message && !a.resolved);
          if (!exists) {
            onDriftDetected(alert);
            return [...prev, alert];
          }
          return prev;
        });
      }
    });

    // Calcul du score de stabilité global
    const avgPerformance = driftMetrics.reduce((sum, m) => {
      const normalized = m.id === 'response-time' ? 
        Math.max(0, 100 - (m.value / m.threshold) * 100) :
        (m.value / Math.max(m.threshold, 100)) * 100;
      return sum + normalized;
    }, 0) / driftMetrics.length;

    setStabilityScore(Math.round(avgPerformance));
  };

  const resolveAlert = (alertId: string) => {
    setDriftAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const applyCorrectiveAction = (action: string) => {
    // Actions correctives automatiques
    const actions = {
      'reset-memory': 'Réinitialisation de la mémoire court terme',
      'reduce-complexity': 'Réduction de la complexité des tâches',
      'increase-monitoring': 'Augmentation de la fréquence de surveillance',
      'isolate-processes': 'Isolation des processus défaillants'
    };

    onCorrectiveAction(actions[action as keyof typeof actions] || action);
    
    // Simulation d'amélioration après action corrective
    setDriftMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.min(100, metric.value + Math.random() * 15),
      trend: 'stable' as const
    })));
  };

  const getTrendIcon = (trend: DriftMetric['trend']) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: DriftAlert['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
          Surveillance de Dérive Algorithmique
          <Badge 
            variant={stabilityScore > 80 ? "default" : stabilityScore > 60 ? "secondary" : "destructive"}
            className="ml-2"
          >
            Stabilité: {stabilityScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contrôles de surveillance */}
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setMonitoringActive(!monitoringActive)}
              size="sm"
              variant={monitoringActive ? "default" : "outline"}
            >
              {monitoringActive ? "Pause" : "Reprendre"} Surveillance
            </Button>
            <span className="text-sm text-muted-foreground">
              {monitoringActive ? "Actif" : "En pause"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Alertes non résolues: {driftAlerts.filter(a => !a.resolved).length}
          </div>
        </div>

        {/* Métriques de dérive */}
        <div className="grid grid-cols-2 gap-3">
          {driftMetrics.map((metric) => (
            <div key={metric.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{metric.name}</span>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Valeur: {metric.value.toFixed(1)}</span>
                  <span>Seuil: {metric.threshold}</span>
                </div>
                <Progress 
                  value={metric.id === 'response-time' ? 
                    Math.max(0, 100 - (metric.value / metric.threshold) * 100) :
                    (metric.value / Math.max(metric.threshold, 100)) * 100
                  } 
                  className="h-2" 
                />
              </div>
              
              <div className="mt-1 text-xs text-muted-foreground">
                Tendance: {metric.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Alertes actives */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Alertes de Dérive</span>
            <Button
              onClick={() => applyCorrectiveAction('auto-correct')}
              size="sm"
              variant="outline"
              disabled={driftAlerts.filter(a => !a.resolved).length === 0}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Correction Auto
            </Button>
          </div>
          
          <ScrollArea className="h-32 border rounded p-2">
            {driftAlerts.slice(-5).map((alert) => (
              <div key={alert.id} className={`mb-2 p-2 rounded text-xs ${alert.resolved ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <div className="mt-1">{alert.message}</div>
                    <div className="text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button 
                      onClick={() => resolveAlert(alert.id)}
                      size="sm"
                      variant="ghost"
                    >
                      Résoudre
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {driftAlerts.length === 0 && (
              <div className="text-center text-muted-foreground py-4 text-sm">
                Aucune dérive détectée - Système stable
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Actions correctives rapides */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => applyCorrectiveAction('reset-memory')}
            size="sm" 
            variant="outline"
          >
            Reset Mémoire
          </Button>
          <Button 
            onClick={() => applyCorrectiveAction('reduce-complexity')}
            size="sm" 
            variant="outline"
          >
            Réduire Complexité
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmicDriftMonitor;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, RefreshCw } from 'lucide-react';
import { DriftMonitoringService, DriftAlert, MonitoringMetrics } from '../../services/monitoring/DriftMonitoringService';

interface AlgorithmicDriftMonitorProps {
  executionResults?: any[];
  onDriftDetected?: (alert: DriftAlert) => void;
  onCorrectiveAction?: (action: string) => void;
}

const AlgorithmicDriftMonitor: React.FC<AlgorithmicDriftMonitorProps> = ({
  executionResults = [],
  onDriftDetected,
  onCorrectiveAction
}) => {
  const [monitoringService] = useState(() => new DriftMonitoringService());
  const [currentMetrics, setCurrentMetrics] = useState<MonitoringMetrics | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<DriftAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const updateMonitoring = () => {
      const metrics = monitoringService.getCurrentMetrics();
      setCurrentMetrics(metrics);
      
      const alerts = monitoringService.getRecentAlerts(5);
      const newAlerts = alerts.filter(alert => 
        !recentAlerts.some(existing => existing.id === alert.id)
      );
      
      if (newAlerts.length > 0) {
        setRecentAlerts(alerts);
        newAlerts.forEach(alert => {
          if (onDriftDetected) {
            onDriftDetected(alert);
          }
        });
      }
    };

    if (isMonitoring) {
      updateMonitoring();
      const interval = setInterval(updateMonitoring, 3000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, monitoringService, recentAlerts, onDriftDetected]);

  const handleCorrectiveAction = async (actionType: string) => {
    const success = monitoringService.applyCorrectiveAction(actionType);
    if (success && onCorrectiveAction) {
      onCorrectiveAction(actionType);
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

  const getSeverityIcon = (severity: DriftAlert['severity']) => {
    switch (severity) {
      case 'low': return <Activity className="h-3 w-3" />;
      case 'medium': return <TrendingDown className="h-3 w-3" />;
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'critical': return <Shield className="h-3 w-3" />;
    }
  };

  const getMetricTrend = (current: number, baseline: number) => {
    if (current > baseline) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (current < baseline) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Activity className="h-3 w-3 text-blue-500" />;
  };

  if (!currentMetrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Initialisation du monitoring...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-600" />
            Surveillance Dérive Algorithmique (Fonctionnel)
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              size="sm"
              variant={isMonitoring ? "default" : "outline"}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isMonitoring ? 'animate-spin' : ''}`} />
              {isMonitoring ? 'Actif' : 'Inactif'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Performance</span>
              <div className="flex items-center gap-1">
                {getMetricTrend(currentMetrics.performance.responseTime, 250)}
                <span>{currentMetrics.performance.responseTime.toFixed(0)}ms</span>
              </div>
            </div>
            <Progress value={Math.max(0, 100 - (currentMetrics.performance.responseTime / 5))} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Précision</span>
              <div className="flex items-center gap-1">
                {getMetricTrend(currentMetrics.accuracy.predictionAccuracy, 0.85)}
                <span>{(currentMetrics.accuracy.predictionAccuracy * 100).toFixed(1)}%</span>
              </div>
            </div>
            <Progress value={currentMetrics.accuracy.predictionAccuracy * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Comportement</span>
              <div className="flex items-center gap-1">
                {getMetricTrend(currentMetrics.behavior.outputPatternScore, 0.8)}
                <span>{(currentMetrics.behavior.outputPatternScore * 100).toFixed(0)}%</span>
              </div>
            </div>
            <Progress value={currentMetrics.behavior.outputPatternScore * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Sécurité</span>
              <div className="flex items-center gap-1">
                {getMetricTrend(1 - currentMetrics.security.anomalyScore, 0.8)}
                <span>{((1 - currentMetrics.security.anomalyScore) * 100).toFixed(0)}%</span>
              </div>
            </div>
            <Progress value={(1 - currentMetrics.security.anomalyScore) * 100} className="h-2" />
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertes Récentes ({recentAlerts.length})
          </h3>
          <ScrollArea className="h-32">
            {recentAlerts.length > 0 ? (
              <div className="space-y-2">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-2 border rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <span className="text-xs font-medium">{alert.message}</span>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()} • 
                      Déviation: {(alert.metrics.deviation * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                Aucune alerte récente
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Corrective Actions */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Actions Correctives</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleCorrectiveAction('optimize-performance')}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Optimiser Performance
            </Button>
            <Button
              onClick={() => handleCorrectiveAction('retrain-model')}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Réentraîner Modèle
            </Button>
            <Button
              onClick={() => handleCorrectiveAction('reset-baseline')}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Réinitialiser Baseline
            </Button>
            <Button
              onClick={() => handleCorrectiveAction('security-scan')}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Scan Sécurité
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="text-xs text-muted-foreground border-t pt-2 flex justify-between">
          <span>Monitoring: {isMonitoring ? 'Actif' : 'Inactif'}</span>
          <span>Dernière MAJ: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmicDriftMonitor;

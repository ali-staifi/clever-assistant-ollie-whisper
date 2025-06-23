
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, Lightbulb, CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';
import { SystemFeedbackService, OptimizationSuggestion, FeedbackMetrics } from '../../services/feedback/SystemFeedbackService';

interface SystemFeedbackManagerProps {
  azrActive?: boolean;
  agentSActive?: boolean;
  executionResults?: any[];
  onOptimizationApplied?: (optimization: string) => void;
}

const SystemFeedbackManager: React.FC<SystemFeedbackManagerProps> = ({
  azrActive = false,
  agentSActive = false,
  executionResults = [],
  onOptimizationApplied
}) => {
  const [feedbackService] = useState(() => new SystemFeedbackService());
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [healthTrend, setHealthTrend] = useState<number>(0);

  useEffect(() => {
    const updateFeedback = () => {
      const currentOptimizations = feedbackService.getOptimizations();
      setOptimizations(currentOptimizations);
      
      const currentMetrics = feedbackService.getCurrentMetrics();
      setMetrics(currentMetrics);
      
      const trend = feedbackService.getSystemHealthTrend();
      setHealthTrend(trend);
    };

    updateFeedback();
    const interval = setInterval(updateFeedback, 5000);
    return () => clearInterval(interval);
  }, [feedbackService]);

  const handleApplyOptimization = async (optimizationId: string) => {
    const optimization = optimizations.find(o => o.id === optimizationId);
    if (!optimization) return;

    const success = await feedbackService.applyOptimization(optimizationId);
    if (success && onOptimizationApplied) {
      onOptimizationApplied(optimization.title);
    }
  };

  const getPriorityColor = (priority: OptimizationSuggestion['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: OptimizationSuggestion['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 text-gray-500" />;
      case 'implementing': return <Play className="h-3 w-3 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getEffortBadge = (effort: OptimizationSuggestion['implementation']['effort']) => {
    const colors = {
      minimal: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      significant: 'bg-red-100 text-red-800'
    };
    return colors[effort];
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Initialisation du système de feedback...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Feedback & Auto-Amélioration (Fonctionnel)
        </CardTitle>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-green-600">{metrics.systemHealth.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Santé Système</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-blue-600">{metrics.performanceScore.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Performance</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className={`text-lg font-bold ${healthTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {healthTrend >= 0 ? '+' : ''}{healthTrend.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Tendance</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* System Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Satisfaction Utilisateur</span>
              <span>{metrics.userSatisfaction.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.userSatisfaction} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Utilisation Ressources</span>
              <span>{metrics.resourceUtilization.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.resourceUtilization} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Index Stabilité</span>
              <span>{metrics.stabilityIndex.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.stabilityIndex} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Score Global</span>
              <span>{((metrics.systemHealth + metrics.performanceScore) / 2).toFixed(0)}%</span>
            </div>
            <Progress value={(metrics.systemHealth + metrics.performanceScore) / 2} className="h-2" />
          </div>
        </div>

        {/* Optimizations */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Optimisations Automatiques ({optimizations.filter(o => o.status === 'pending').length} en attente)
          </h3>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {optimizations.map((optimization) => (
                <div key={optimization.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(optimization.status)}
                      <span className="text-sm font-medium">{optimization.title}</span>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={getPriorityColor(optimization.priority)}>
                        {optimization.priority}
                      </Badge>
                      <Badge className={getEffortBadge(optimization.implementation.effort)}>
                        {optimization.implementation.effort}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {optimization.description}
                  </p>
                  
                  <div className="text-xs mb-2">
                    <strong>Impact:</strong> {optimization.impact}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span>
                      {optimization.metrics.currentValue.toFixed(1)} → {optimization.metrics.targetValue.toFixed(1)} {optimization.metrics.unit}
                    </span>
                    <span className="text-muted-foreground">
                      Temps estimé: {optimization.implementation.timeEstimate}
                    </span>
                  </div>
                  
                  {optimization.status === 'pending' && (
                    <Button
                      onClick={() => handleApplyOptimization(optimization.id)}
                      size="sm"
                      className="w-full mt-2 text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Appliquer Optimisation
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Status */}
        <div className="text-xs text-muted-foreground border-t pt-2 flex justify-between">
          <span>
            AZR: {azrActive ? 'Actif' : 'Inactif'} • 
            Agent S: {agentSActive ? 'Actif' : 'Inactif'}
          </span>
          <span>MAJ: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemFeedbackManager;

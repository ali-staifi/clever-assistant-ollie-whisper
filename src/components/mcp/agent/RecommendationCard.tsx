
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Settings,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { AgentRecommendation } from '../../../services/mcp/agent/MCPAgentChatService';

interface RecommendationCardProps {
  recommendation: AgentRecommendation;
  isImplementing: boolean;
  onImplement: (recommendation: AgentRecommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  isImplementing,
  onImplement
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'integration': return <Zap className="h-4 w-4" />;
      case 'optimization': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyProgress = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 25;
      case 'medium': return 50;
      case 'hard': return 75;
      default: return 0;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'completed': return 'Complété';
      case 'failed': return 'Échec';
      case 'in_progress': return 'En cours';
      default: return status;
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(recommendation.type)}
            <div>
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {recommendation.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority}
            </Badge>
            {recommendation.status === 'completed' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Impact */}
        <div className="bg-blue-50 p-3 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Impact attendu</span>
          </div>
          <p className="text-sm">{recommendation.impact}</p>
        </div>

        {/* Détails d'implémentation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Difficulté</span>
            <div className="flex items-center gap-2">
              <Progress value={getDifficultyProgress(recommendation.implementation.difficulty)} className="w-20" />
              <span className="text-sm capitalize">{recommendation.implementation.difficulty}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Temps estimé</span>
            <span className="text-sm">{recommendation.implementation.estimatedTime}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Statut</span>
            <span className={`text-sm font-medium ${getStatusColor(recommendation.status)}`}>
              {getStatusText(recommendation.status)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Étapes d'implémentation */}
        <div>
          <span className="text-sm font-medium mb-2 block">Étapes d'implémentation:</span>
          <ul className="space-y-1">
            {recommendation.implementation.steps.map((step, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                  {index + 1}
                </div>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onImplement(recommendation)}
            disabled={
              recommendation.status === 'completed' || 
              isImplementing
            }
            size="sm"
            className="flex-1"
          >
            {isImplementing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Implémentation...
              </>
            ) : recommendation.status === 'completed' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complété
              </>
            ) : (
              'Implémenter'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

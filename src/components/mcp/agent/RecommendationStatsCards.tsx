
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { AgentRecommendation } from '../../../services/mcp/agent/MCPAgentChatService';

interface RecommendationStatsCardsProps {
  recommendations: AgentRecommendation[];
}

export const RecommendationStatsCards: React.FC<RecommendationStatsCardsProps> = ({
  recommendations
}) => {
  const pendingRecommendations = recommendations.filter(r => r.status === 'pending');
  const completedRecommendations = recommendations.filter(r => r.status === 'completed');
  const criticalRecommendations = recommendations.filter(r => r.priority === 'critical');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">{recommendations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">En attente</p>
              <p className="text-2xl font-bold">{pendingRecommendations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Complétées</p>
              <p className="text-2xl font-bold">{completedRecommendations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">Critiques</p>
              <p className="text-2xl font-bold">{criticalRecommendations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

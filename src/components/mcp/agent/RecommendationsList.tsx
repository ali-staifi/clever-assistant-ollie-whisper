
import React from 'react';
import { RecommendationCard } from './RecommendationCard';
import { AgentRecommendation } from '../../../services/mcp/agent/MCPAgentChatService';

interface RecommendationsListProps {
  recommendations: AgentRecommendation[];
  implementingId: string | null;
  onImplement: (recommendation: AgentRecommendation) => void;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  implementingId,
  onImplement
}) => {
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <RecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          isImplementing={implementingId === recommendation.id}
          onImplement={onImplement}
        />
      ))}
    </div>
  );
};

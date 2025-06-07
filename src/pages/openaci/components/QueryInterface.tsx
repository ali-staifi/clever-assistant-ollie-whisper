
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Search, Lightbulb, Network, Zap } from 'lucide-react';
import { LumenSession } from '../types';

interface QueryInterfaceProps {
  sessionType: LumenSession['type'];
  currentQuery: string;
  isLumenActive: boolean;
  isGenerating: boolean;
  onSessionTypeChange: (type: LumenSession['type']) => void;
  onQueryChange: (query: string) => void;
  onProcessQuery: () => void;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
  sessionType,
  currentQuery,
  isLumenActive,
  isGenerating,
  onSessionTypeChange,
  onQueryChange,
  onProcessQuery
}) => {
  const getPlaceholder = () => {
    switch (sessionType) {
      case 'reasoning': return 'Posez une question nécessitant un raisonnement logique...';
      case 'analysis': return 'Décrivez ce que vous voulez analyser...';
      case 'learning': return 'Partagez de nouvelles informations à apprendre...';
      case 'planning': return 'Décrivez votre objectif pour la planification...';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Mode de traitement</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant={sessionType === 'reasoning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSessionTypeChange('reasoning')}
            className="text-xs"
          >
            <Brain className="h-3 w-3 mr-1" />
            Raisonnement
          </Button>
          <Button
            variant={sessionType === 'analysis' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSessionTypeChange('analysis')}
            className="text-xs"
          >
            <Search className="h-3 w-3 mr-1" />
            Analyse
          </Button>
          <Button
            variant={sessionType === 'learning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSessionTypeChange('learning')}
            className="text-xs"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Apprentissage
          </Button>
          <Button
            variant={sessionType === 'planning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSessionTypeChange('planning')}
            className="text-xs"
          >
            <Network className="h-3 w-3 mr-1" />
            Planification
          </Button>
        </div>
        
        <Textarea
          placeholder={getPlaceholder()}
          value={currentQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={!isLumenActive}
          className="h-20 font-mono text-xs"
        />
        
        <Button 
          onClick={onProcessQuery} 
          disabled={!isLumenActive || !currentQuery.trim() || isGenerating} 
          size="sm"
          className="w-full"
        >
          <Zap className="h-3 w-3 mr-1" />
          {isGenerating ? 'Traitement Lumen...' : 'Exécuter Lumen'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QueryInterface;

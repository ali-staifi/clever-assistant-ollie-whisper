
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, TrendingUp } from 'lucide-react';

interface GitDatabaseControlsProps {
  isActive: boolean;
  isLLMGenerating: boolean;
  onActivateSystem: () => void;
  onDeactivateSystem: () => void;
  onSecurityAnalysis: () => void;
}

const GitDatabaseControls: React.FC<GitDatabaseControlsProps> = ({
  isActive,
  isLLMGenerating,
  onActivateSystem,
  onDeactivateSystem,
  onSecurityAnalysis
}) => {
  return (
    <div className="mb-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex space-x-2">
            {!isActive ? (
              <Button onClick={onActivateSystem} size="sm" className="flex items-center">
                <Play className="h-3 w-3 mr-1" />
                Activer Architecture Sécurisée
              </Button>
            ) : (
              <Button onClick={onDeactivateSystem} variant="destructive" size="sm">
                <Square className="h-3 w-3 mr-1" />
                Désactiver Système
              </Button>
            )}
            <Button 
              onClick={onSecurityAnalysis}
              disabled={!isActive || isLLMGenerating}
              variant="outline"
              size="sm"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Analyse Sécurité Globale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitDatabaseControls;

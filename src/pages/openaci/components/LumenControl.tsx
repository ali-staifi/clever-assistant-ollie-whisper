
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Play, Square } from 'lucide-react';

interface LumenControlProps {
  isLumenActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

const LumenControl: React.FC<LumenControlProps> = ({ 
  isLumenActive, 
  onActivate, 
  onDeactivate 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Contrôle système Lumen
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex space-x-2">
          {!isLumenActive ? (
            <Button onClick={onActivate} size="sm" className="flex items-center">
              <Play className="h-3 w-3 mr-1" />
              Activer Lumen
            </Button>
          ) : (
            <Button onClick={onDeactivate} variant="destructive" size="sm">
              <Square className="h-3 w-3 mr-1" />
              Désactiver
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LumenControl;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from 'lucide-react';
import { KnowledgeEntry } from '../types';

interface KnowledgeManagerProps {
  knowledgeBase: KnowledgeEntry[];
  newConcept: string;
  conceptDescription: string;
  onNewConceptChange: (concept: string) => void;
  onConceptDescriptionChange: (description: string) => void;
  onAddKnowledge: () => void;
}

const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({
  knowledgeBase,
  newConcept,
  conceptDescription,
  onNewConceptChange,
  onConceptDescriptionChange,
  onAddKnowledge
}) => {
  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ajouter une connaissance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <Input
            placeholder="Nouveau concept..."
            value={newConcept}
            onChange={(e) => onNewConceptChange(e.target.value)}
            className="h-8"
          />
          <Textarea
            placeholder="Description du concept..."
            value={conceptDescription}
            onChange={(e) => onConceptDescriptionChange(e.target.value)}
            className="h-16"
          />
          <Button 
            onClick={onAddKnowledge} 
            disabled={!newConcept.trim() || !conceptDescription.trim()} 
            size="sm"
          >
            <Database className="h-3 w-3 mr-1" />
            Ajouter
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Base de connaissances</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {knowledgeBase.map((entry) => (
                <div key={entry.id} className="p-2 border rounded text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{entry.concept}</div>
                    <span className="text-muted-foreground">
                      {entry.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-1 text-muted-foreground">{entry.description}</div>
                  {entry.relations.length > 0 && (
                    <div className="flex gap-1">
                      {entry.relations.map((relation, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {relation}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeManager;

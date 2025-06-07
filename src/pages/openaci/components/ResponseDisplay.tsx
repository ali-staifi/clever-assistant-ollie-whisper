
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain } from 'lucide-react';

interface ResponseDisplayProps {
  messages: Array<{ content: string }>;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Brain className="h-4 w-4 mr-2 text-blue-600" />
          Réponse Lumen
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          <div className="prose prose-sm max-w-none">
            <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {messages[messages.length - 1]?.content || 'En attente de la réponse Lumen...'}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ResponseDisplay;

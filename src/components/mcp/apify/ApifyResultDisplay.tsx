
import React from 'react';
import { Label } from '../../ui/label';
import { ScrollArea } from '../../ui/scroll-area';

interface ApifyResultDisplayProps {
  result: any;
}

const ApifyResultDisplay: React.FC<ApifyResultDisplayProps> = ({ result }) => {
  return (
    <div className="mt-4">
      <Label>Résultat</Label>
      <ScrollArea className="h-[150px] mt-1 rounded-md border">
        <div className="bg-muted p-3 whitespace-pre-wrap">
          {result.error ? (
            <div className="text-red-500">Erreur: {result.error}</div>
          ) : (
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ApifyResultDisplay;

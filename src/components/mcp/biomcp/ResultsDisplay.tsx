
import React from 'react';
import { Label } from '../../ui/label';

interface ResultsDisplayProps {
  result: any;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="mt-6">
      <Label>Résultat</Label>
      <div className="bg-muted p-4 rounded-md mt-1 whitespace-pre-wrap overflow-auto max-h-[300px]">
        {result.error ? (
          <div className="text-red-500">Erreur: {result.error}</div>
        ) : (
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;

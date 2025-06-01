
import React from 'react';
import { Label } from '../../ui/label';
import MedicalResearchResults from './MedicalResearchResults';

interface ResultsDisplayProps {
  result: any;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) return null;

  // Check if this is a medical research result
  const isMedicalResearch = result.analysisType === 'medical_research' || 
                           result.protocols || 
                           result.medications || 
                           result.guidelines;

  if (isMedicalResearch) {
    return <MedicalResearchResults result={result} />;
  }

  // For other types of results, show the original JSON display
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

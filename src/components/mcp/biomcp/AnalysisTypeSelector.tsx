
import React from 'react';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Search } from 'lucide-react';

interface AnalysisTypeSelectorProps {
  analysisType: string;
  setAnalysisType: (value: string) => void;
}

const AnalysisTypeSelector: React.FC<AnalysisTypeSelectorProps> = ({
  analysisType,
  setAnalysisType
}) => {
  return (
    <div className="space-y-2">
      <Label>Type d'analyse</Label>
      <RadioGroup 
        value={analysisType} 
        onValueChange={setAnalysisType}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="genomic_sequence_analysis" id="genomic" />
          <Label htmlFor="genomic">Analyse de séquence génomique</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="variant_annotation" id="variant" />
          <Label htmlFor="variant">Annotation de variant</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pathway_analysis" id="pathway" />
          <Label htmlFor="pathway">Analyse de voie métabolique</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="medical_research" id="medical_research" />
          <Label htmlFor="medical_research" className="flex items-center">
            <Search className="h-4 w-4 mr-2 text-green-500" />
            Recherche médicale - Protocoles et médicaments
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default AnalysisTypeSelector;

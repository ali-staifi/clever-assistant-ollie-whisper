
import React, { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Activity, Stethoscope } from 'lucide-react';
import DiseaseTypeSelector from './biomcp/DiseaseTypeSelector';
import AnalysisTypeSelector from './biomcp/AnalysisTypeSelector';
import GenomicAnalysisForm from './biomcp/GenomicAnalysisForm';
import MedicalResearchForm from './biomcp/MedicalResearchForm';
import ResultsDisplay from './biomcp/ResultsDisplay';

const BioMCPPanel: React.FC = () => {
  const { isProcessing, processLocalRequest } = useMCP();
  const [analysisType, setAnalysisType] = useState('genomic_sequence_analysis');
  const [sequence, setSequence] = useState('');
  const [variant, setVariant] = useState('');
  const [genome, setGenome] = useState('GRCh38');
  const [genes, setGenes] = useState('');
  const [pathwayDb, setPathwayDb] = useState('KEGG');
  const [result, setResult] = useState<any>(null);
  const [diseaseType, setDiseaseType] = useState('cancer');
  const [cancerType, setCancerType] = useState('lung');
  const [pulmonaryCondition, setPulmonaryCondition] = useState('copd');
  
  // Medical research states
  const [pathologyType, setPathologyType] = useState('cancer');
  const [searchQuery, setSearchQuery] = useState('');
  const [researchType, setResearchType] = useState('care_protocol');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let content: any = {
        diseaseType,
        cancerType: diseaseType === 'cancer' ? cancerType : undefined,
        pulmonaryCondition: diseaseType === 'pulmonology' ? pulmonaryCondition : undefined
      };
      
      switch (analysisType) {
        case 'genomic_sequence_analysis':
          content = { ...content, sequence, analysisType: 'basic' };
          break;
        case 'variant_annotation':
          content = { ...content, variant, genome };
          break;
        case 'pathway_analysis':
          content = { ...content, genes: genes.split(',').map(g => g.trim()), pathwayDb };
          break;
        case 'medical_research':
          content = { 
            pathologyType, 
            searchQuery, 
            researchType,
            analysisType: 'medical_research'
          };
          break;
      }
      
      const response = await processLocalRequest(analysisType, content);
      
      if (response.status === 'success') {
        setResult(response.content);
      } else {
        setResult({ error: response.content.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error('BioMCP error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' });
    }
  };

  const isFormValid = () => {
    switch (analysisType) {
      case 'genomic_sequence_analysis':
        return !!sequence;
      case 'variant_annotation':
        return !!variant;
      case 'pathway_analysis':
        return !!genes;
      case 'medical_research':
        return !!searchQuery;
      default:
        return false;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {diseaseType === 'cancer' ? (
            <Activity className="h-6 w-6 mr-2 text-red-500" />
          ) : (
            <Stethoscope className="h-6 w-6 mr-2 text-blue-500" />
          )}
          BioMCP - Recherche Médicale
        </CardTitle>
        <CardDescription>
          Analyses génomiques et recherche médicale spécialisées pour la recherche en cancérologie, pneumologie et diabétologie
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DiseaseTypeSelector
            diseaseType={diseaseType}
            setDiseaseType={setDiseaseType}
            cancerType={cancerType}
            setCancerType={setCancerType}
            pulmonaryCondition={pulmonaryCondition}
            setPulmonaryCondition={setPulmonaryCondition}
          />
          
          <AnalysisTypeSelector
            analysisType={analysisType}
            setAnalysisType={setAnalysisType}
          />
          
          {analysisType === 'medical_research' ? (
            <MedicalResearchForm
              pathologyType={pathologyType}
              setPathologyType={setPathologyType}
              researchType={researchType}
              setResearchType={setResearchType}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            <GenomicAnalysisForm
              analysisType={analysisType}
              sequence={sequence}
              setSequence={setSequence}
              variant={variant}
              setVariant={setVariant}
              genome={genome}
              setGenome={setGenome}
              genes={genes}
              setGenes={setGenes}
              pathwayDb={pathwayDb}
              setPathwayDb={setPathwayDb}
              diseaseType={diseaseType}
            />
          )}
          
          <Button 
            type="submit" 
            disabled={isProcessing || !isFormValid()}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : analysisType === 'medical_research' ? 'Rechercher' : 'Analyser'}
          </Button>
        </form>
        
        <ResultsDisplay result={result} />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setResult(null)}>
          Effacer le résultat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BioMCPPanel;

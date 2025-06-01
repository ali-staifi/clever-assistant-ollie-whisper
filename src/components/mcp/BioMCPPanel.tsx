
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
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
      {/* Formulaire */}
      <Card className="w-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            {diseaseType === 'cancer' ? (
              <Activity className="h-5 w-5 mr-2 text-red-500" />
            ) : (
              <Stethoscope className="h-5 w-5 mr-2 text-blue-500" />
            )}
            BioMCP - Recherche Médicale
          </CardTitle>
          <CardDescription className="text-sm">
            Analyses génomiques et recherche médicale spécialisées
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-3">
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
              className="w-full h-9"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : analysisType === 'medical_research' ? 'Rechercher' : 'Analyser'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => setResult(null)}>
            Effacer le résultat
          </Button>
        </CardFooter>
      </Card>

      {/* Résultats */}
      <div className="w-full flex flex-col h-full">
        {result ? (
          <Card className="w-full flex flex-col h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Résultats</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <ResultsDisplay result={result} />
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full h-full border-dashed flex flex-col">
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Les résultats apparaîtront ici après avoir lancé une recherche</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BioMCPPanel;

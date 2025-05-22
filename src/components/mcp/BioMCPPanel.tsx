
import React, { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Cancer, Lungs } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {diseaseType === 'cancer' ? (
            <Cancer className="h-6 w-6 mr-2 text-red-500" />
          ) : (
            <Lungs className="h-6 w-6 mr-2 text-blue-500" />
          )}
          BioMCP - Recherche Médicale
        </CardTitle>
        <CardDescription>
          Analyses génomiques spécialisées pour la recherche en cancérologie et pneumologie
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Domaine médical</Label>
            <RadioGroup 
              value={diseaseType} 
              onValueChange={setDiseaseType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cancer" id="cancer" />
                <Label htmlFor="cancer" className="flex items-center">
                  <Cancer className="h-4 w-4 mr-2 text-red-500" />
                  Cancérologie
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pulmonology" id="pulmonology" />
                <Label htmlFor="pulmonology" className="flex items-center">
                  <Lungs className="h-4 w-4 mr-2 text-blue-500" />
                  Pneumologie
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {diseaseType === 'cancer' && (
            <div className="space-y-2">
              <Label htmlFor="cancerType">Type de cancer</Label>
              <Select value={cancerType} onValueChange={setCancerType}>
                <SelectTrigger id="cancerType">
                  <SelectValue placeholder="Sélectionner un type de cancer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lung">Cancer du poumon</SelectItem>
                  <SelectItem value="breast">Cancer du sein</SelectItem>
                  <SelectItem value="colorectal">Cancer colorectal</SelectItem>
                  <SelectItem value="prostate">Cancer de la prostate</SelectItem>
                  <SelectItem value="melanoma">Mélanome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {diseaseType === 'pulmonology' && (
            <div className="space-y-2">
              <Label htmlFor="pulmonaryCondition">Condition pulmonaire</Label>
              <Select value={pulmonaryCondition} onValueChange={setPulmonaryCondition}>
                <SelectTrigger id="pulmonaryCondition">
                  <SelectValue placeholder="Sélectionner une condition pulmonaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="copd">BPCO</SelectItem>
                  <SelectItem value="asthma">Asthme</SelectItem>
                  <SelectItem value="fibrosis">Fibrose pulmonaire</SelectItem>
                  <SelectItem value="pneumonia">Pneumonie</SelectItem>
                  <SelectItem value="tuberculosis">Tuberculose</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
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
            </RadioGroup>
          </div>
          
          {analysisType === 'genomic_sequence_analysis' && (
            <div className="space-y-2">
              <Label htmlFor="sequence">Séquence génomique</Label>
              <Textarea
                id="sequence"
                placeholder={diseaseType === 'cancer' 
                  ? "Entrez une séquence ADN/ARN liée au cancer (ex: ATGCATGCATGC...)" 
                  : "Entrez une séquence ADN/ARN liée à la pneumologie (ex: ATGCATGCATGC...)"}
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}
          
          {analysisType === 'variant_annotation' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="variant">Variant</Label>
                <Input
                  id="variant"
                  placeholder={diseaseType === 'cancer' 
                    ? "Ex: EGFR T790M, BRAF V600E" 
                    : "Ex: CFTR F508del, SERPINA1 E342K"}
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genome">Génome de référence</Label>
                <Input
                  id="genome"
                  placeholder="Ex: GRCh38"
                  value={genome}
                  onChange={(e) => setGenome(e.target.value)}
                />
              </div>
            </>
          )}
          
          {analysisType === 'pathway_analysis' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="genes">Gènes (séparés par des virgules)</Label>
                <Textarea
                  id="genes"
                  placeholder={diseaseType === 'cancer' 
                    ? "Ex: EGFR, TP53, KRAS, BRAF, HER2" 
                    : "Ex: CFTR, SERPINA1, TNF, IL6, TLR4"}
                  value={genes}
                  onChange={(e) => setGenes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathwayDb">Base de données de voies métaboliques</Label>
                <Select value={pathwayDb} onValueChange={setPathwayDb}>
                  <SelectTrigger id="pathwayDb">
                    <SelectValue placeholder="Sélectionner une base de données" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KEGG">KEGG</SelectItem>
                    <SelectItem value="Reactome">Reactome</SelectItem>
                    <SelectItem value="WikiPathways">WikiPathways</SelectItem>
                    <SelectItem value="BioCarta">BioCarta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          <Button 
            type="submit" 
            disabled={isProcessing || 
              (analysisType === 'genomic_sequence_analysis' && !sequence) ||
              (analysisType === 'variant_annotation' && !variant) ||
              (analysisType === 'pathway_analysis' && !genes)
            }
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : 'Analyser'}
          </Button>
        </form>
        
        {result && (
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
        )}
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

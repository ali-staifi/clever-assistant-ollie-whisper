
import React, { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const BioMCPPanel: React.FC = () => {
  const { isProcessing, processLocalRequest } = useMCP();
  const [analysisType, setAnalysisType] = useState('genomic_sequence_analysis');
  const [sequence, setSequence] = useState('');
  const [variant, setVariant] = useState('');
  const [genome, setGenome] = useState('GRCh38');
  const [genes, setGenes] = useState('');
  const [pathwayDb, setPathwayDb] = useState('KEGG');
  const [result, setResult] = useState<any>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let content: any = {};
      
      switch (analysisType) {
        case 'genomic_sequence_analysis':
          content = { sequence, analysisType: 'basic' };
          break;
        case 'variant_annotation':
          content = { variant, genome };
          break;
        case 'pathway_analysis':
          content = { genes: genes.split(',').map(g => g.trim()), pathwayDb };
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
        <CardTitle>BioMCP Demo</CardTitle>
        <CardDescription>
          Interagissez avec le module BioMCP pour des analyses génomiques
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Entrez une séquence ADN/ARN (ex: ATGCATGCATGC...)"
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
                  placeholder="Ex: rs6025, chr1:g.169519049T>C"
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
                  placeholder="Ex: BRCA1, TP53, KRAS, EGFR"
                  value={genes}
                  onChange={(e) => setGenes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathwayDb">Base de données de voies métaboliques</Label>
                <Input
                  id="pathwayDb"
                  placeholder="Ex: KEGG, Reactome"
                  value={pathwayDb}
                  onChange={(e) => setPathwayDb(e.target.value)}
                />
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

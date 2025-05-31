
import React from 'react';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface GenomicAnalysisFormProps {
  analysisType: string;
  sequence: string;
  setSequence: (value: string) => void;
  variant: string;
  setVariant: (value: string) => void;
  genome: string;
  setGenome: (value: string) => void;
  genes: string;
  setGenes: (value: string) => void;
  pathwayDb: string;
  setPathwayDb: (value: string) => void;
  diseaseType: string;
}

const GenomicAnalysisForm: React.FC<GenomicAnalysisFormProps> = ({
  analysisType,
  sequence,
  setSequence,
  variant,
  setVariant,
  genome,
  setGenome,
  genes,
  setGenes,
  pathwayDb,
  setPathwayDb,
  diseaseType
}) => {
  if (analysisType === 'genomic_sequence_analysis') {
    return (
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
    );
  }

  if (analysisType === 'variant_annotation') {
    return (
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
    );
  }

  if (analysisType === 'pathway_analysis') {
    return (
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
    );
  }

  return null;
};

export default GenomicAnalysisForm;

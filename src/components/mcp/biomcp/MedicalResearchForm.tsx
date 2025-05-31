
import React from 'react';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Activity, Pill, Search, BookOpen } from 'lucide-react';

interface MedicalResearchFormProps {
  pathologyType: string;
  setPathologyType: (value: string) => void;
  researchType: string;
  setResearchType: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const MedicalResearchForm: React.FC<MedicalResearchFormProps> = ({
  pathologyType,
  setPathologyType,
  researchType,
  setResearchType,
  searchQuery,
  setSearchQuery
}) => {
  const handleQuickSearch = (query: string, type: string, pathology?: string) => {
    setSearchQuery(query);
    setResearchType(type);
    if (pathology) {
      setPathologyType(pathology);
    }
  };

  const quickSearches = [
    {
      label: "BPCO - Protocoles de soins",
      query: "protocole prise en charge BPCO exacerbation hospitalisation",
      type: "care_protocol",
      pathology: "pneumology",
      icon: Activity
    },
    {
      label: "BPCO - Médicaments",
      query: "bronchodilatateurs corticoïdes BPCO traitement pharmacologique",
      type: "medications",
      pathology: "pneumology",
      icon: Pill
    },
    {
      label: "Cancer poumon - Protocoles complets",
      query: "cancer poumon non petites cellules chimiothérapie immunothérapie",
      type: "combined",
      pathology: "cancer",
      icon: Search
    },
    {
      label: "Diabète type 2 - Soins",
      query: "diabète type 2 prise en charge HbA1c complications",
      type: "care_protocol",
      pathology: "diabetes",
      icon: Activity
    }
  ];

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-green-50">
      <div className="space-y-2">
        <Label htmlFor="pathologyType">Pathologie</Label>
        <Select value={pathologyType} onValueChange={setPathologyType}>
          <SelectTrigger id="pathologyType">
            <SelectValue placeholder="Sélectionner une pathologie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cancer">Cancérologie</SelectItem>
            <SelectItem value="pneumology">Pneumologie</SelectItem>
            <SelectItem value="diabetes">Diabétologie</SelectItem>
            <SelectItem value="cardiology">Cardiologie</SelectItem>
            <SelectItem value="neurology">Neurologie</SelectItem>
            <SelectItem value="nephrology">Néphrologie</SelectItem>
            <SelectItem value="hematology">Hématologie</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="researchType">Type de recherche</Label>
        <RadioGroup 
          value={researchType} 
          onValueChange={setResearchType}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="care_protocol" id="care_protocol" />
            <Label htmlFor="care_protocol" className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500" />
              Protocoles de soins
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medications" id="medications" />
            <Label htmlFor="medications" className="flex items-center">
              <Pill className="h-4 w-4 mr-2 text-purple-500" />
              Médicaments et traitements
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="combined" id="combined" />
            <Label htmlFor="combined" className="flex items-center">
              <Search className="h-4 w-4 mr-2 text-green-500" />
              Protocoles complets (soins + médicaments)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Recherches rapides</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {quickSearches.map((search, index) => {
            const IconComponent = search.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-3"
                onClick={() => handleQuickSearch(search.query, search.type, search.pathology)}
              >
                <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-xs">{search.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="searchQuery">Recherche spécifique</Label>
        <Textarea
          id="searchQuery"
          placeholder="Ex: protocole chimiothérapie cancer poumon stade 3, traitement BPCO exacerbation, protocole diabète type 2 avec complications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="text-xs text-muted-foreground">
          Utilisez les boutons de recherche rapide ci-dessus ou tapez votre propre requête
        </div>
      </div>
    </div>
  );
};

export default MedicalResearchForm;

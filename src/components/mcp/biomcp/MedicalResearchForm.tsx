
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
      label: "BPCO - Protocoles",
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
      label: "Cancer poumon",
      query: "cancer poumon non petites cellules chimiothérapie immunothérapie",
      type: "combined",
      pathology: "cancer",
      icon: Search
    },
    {
      label: "Diabète type 2",
      query: "diabète type 2 prise en charge HbA1c complications",
      type: "care_protocol",
      pathology: "diabetes",
      icon: Activity
    }
  ];

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-green-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="pathologyType" className="text-sm font-medium">Pathologie</Label>
          <Select value={pathologyType} onValueChange={setPathologyType}>
            <SelectTrigger id="pathologyType" className="h-8">
              <SelectValue placeholder="Sélectionner" />
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
        
        <div className="space-y-1">
          <Label className="text-sm font-medium">Type de recherche</Label>
          <RadioGroup 
            value={researchType} 
            onValueChange={setResearchType}
            className="grid grid-cols-3 gap-1"
          >
            <div className="flex items-center space-x-1 p-1 border rounded bg-white hover:bg-gray-50">
              <RadioGroupItem value="care_protocol" id="care_protocol" className="h-3 w-3" />
              <Label htmlFor="care_protocol" className="text-xs cursor-pointer flex items-center">
                <Activity className="h-3 w-3 mr-1 text-blue-500" />
                Protocoles
              </Label>
            </div>
            <div className="flex items-center space-x-1 p-1 border rounded bg-white hover:bg-gray-50">
              <RadioGroupItem value="medications" id="medications" className="h-3 w-3" />
              <Label htmlFor="medications" className="text-xs cursor-pointer flex items-center">
                <Pill className="h-3 w-3 mr-1 text-purple-500" />
                Médicaments
              </Label>
            </div>
            <div className="flex items-center space-x-1 p-1 border rounded bg-white hover:bg-gray-50">
              <RadioGroupItem value="combined" id="combined" className="h-3 w-3" />
              <Label htmlFor="combined" className="text-xs cursor-pointer flex items-center">
                <Search className="h-3 w-3 mr-1 text-green-500" />
                Complets
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium">Recherches rapides</Label>
        <div className="grid grid-cols-2 gap-1">
          {quickSearches.map((search, index) => {
            const IconComponent = search.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-8 p-2"
                onClick={() => handleQuickSearch(search.query, search.type, search.pathology)}
              >
                <IconComponent className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="text-xs truncate">{search.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="searchQuery" className="text-sm font-medium">Recherche spécifique</Label>
        <Textarea
          id="searchQuery"
          placeholder="Ex: protocole chimiothérapie cancer poumon stade 3, traitement BPCO exacerbation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-h-[60px] text-sm"
        />
        <div className="text-xs text-muted-foreground">
          Utilisez les boutons de recherche rapide ou tapez votre requête
        </div>
      </div>
    </div>
  );
};

export default MedicalResearchForm;

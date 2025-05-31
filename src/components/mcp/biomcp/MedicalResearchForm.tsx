
import React from 'react';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Textarea } from '../../ui/textarea';
import { Activity, Pill, Search } from 'lucide-react';

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
        <Label htmlFor="searchQuery">Recherche spécifique</Label>
        <Textarea
          id="searchQuery"
          placeholder="Ex: protocole chimiothérapie cancer poumon stade 3, traitement BPCO exacerbation, protocole diabète type 2 avec complications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default MedicalResearchForm;

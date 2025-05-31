
import React from 'react';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Activity, Stethoscope } from 'lucide-react';

interface DiseaseTypeSelectorProps {
  diseaseType: string;
  setDiseaseType: (value: string) => void;
  cancerType: string;
  setCancerType: (value: string) => void;
  pulmonaryCondition: string;
  setPulmonaryCondition: (value: string) => void;
}

const DiseaseTypeSelector: React.FC<DiseaseTypeSelectorProps> = ({
  diseaseType,
  setDiseaseType,
  cancerType,
  setCancerType,
  pulmonaryCondition,
  setPulmonaryCondition
}) => {
  return (
    <>
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
              <Activity className="h-4 w-4 mr-2 text-red-500" />
              Cancérologie
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pulmonology" id="pulmonology" />
            <Label htmlFor="pulmonology" className="flex items-center">
              <Stethoscope className="h-4 w-4 mr-2 text-blue-500" />
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
    </>
  );
};

export default DiseaseTypeSelector;

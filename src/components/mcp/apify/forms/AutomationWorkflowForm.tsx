
import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';

interface AutomationWorkflowFormProps {
  workflow: string;
  parameters: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AutomationWorkflowForm: React.FC<AutomationWorkflowFormProps> = ({ workflow, parameters, onChange }) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="workflow">Workflow</Label>
        <Input
          id="workflow"
          name="workflow"
          placeholder="Nom du workflow Apify"
          value={workflow}
          onChange={onChange}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="parameters">Paramètres (JSON)</Label>
        <Textarea
          id="parameters"
          name="parameters"
          placeholder='{"param1": "valeur1", "param2": "valeur2"}'
          value={parameters}
          onChange={onChange}
          className="min-h-[80px]"
        />
      </div>
    </>
  );
};

export default AutomationWorkflowForm;


import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';

interface DataExtractionFormProps {
  content: string;
  format: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const DataExtractionForm: React.FC<DataExtractionFormProps> = ({ content, format, onChange }) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="content">Contenu à analyser</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Collez ici le contenu HTML, JSON, etc. à analyser"
          value={content}
          onChange={onChange}
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="format">Format</Label>
        <Input
          id="format"
          name="format"
          placeholder="html, json, csv, etc."
          value={format}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default DataExtractionForm;

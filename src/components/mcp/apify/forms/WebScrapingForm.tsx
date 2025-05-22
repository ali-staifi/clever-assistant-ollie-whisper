
import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

interface WebScrapingFormProps {
  url: string;
  selectors: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const WebScrapingForm: React.FC<WebScrapingFormProps> = ({ url, selectors, onChange }) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          placeholder="https://example.com"
          value={url}
          onChange={onChange}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="selectors">Sélecteurs CSS (séparés par des virgules)</Label>
        <Input
          id="selectors"
          name="selectors"
          placeholder="Ex: h1, .product-card, #main-content"
          value={selectors}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default WebScrapingForm;

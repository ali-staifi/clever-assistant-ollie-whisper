
import React from 'react';
import LanguageSelector from '../voice/LanguageSelector';

interface LanguageControlsProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageControls: React.FC<LanguageControlsProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  const availableLanguages = [
    { code: 'fr-FR', name: 'Français' },
    { code: 'ar-SA', name: 'العربية' },
    { code: 'en-US', name: 'English' }
  ];

  return (
    <div className="mb-2">
      <LanguageSelector
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        availableLanguages={availableLanguages}
      />
    </div>
  );
};

export default LanguageControls;

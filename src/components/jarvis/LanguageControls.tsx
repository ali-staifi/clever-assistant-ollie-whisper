
import React from 'react';
import LanguageSelector from '../voice/LanguageSelector';
import VoiceLanguageReset from '../voice/VoiceLanguageReset';

interface LanguageControlsProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  speechService?: any;
}

const LanguageControls: React.FC<LanguageControlsProps> = ({
  currentLanguage,
  onLanguageChange,
  speechService
}) => {
  const availableLanguages = [
    { code: 'fr-FR', name: 'Français' },
    { code: 'ar-SA', name: 'العربية' },
    { code: 'en-US', name: 'English' }
  ];

  const handleReset = () => {
    onLanguageChange('fr-FR');
    window.location.reload(); // Force page reload to reset all voice settings
  };

  return (
    <div className="flex items-center justify-between space-x-4 p-3 bg-card border rounded-lg">
      <LanguageSelector
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        availableLanguages={availableLanguages}
      />
      <VoiceLanguageReset 
        onReset={handleReset}
        speechService={speechService}
      />
    </div>
  );
};

export default LanguageControls;


import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  availableLanguages?: {code: string, name: string}[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  availableLanguages = [
    { code: 'fr-FR', name: 'Français' },
    { code: 'ar-SA', name: 'العربية' },
    { code: 'en-US', name: 'English' },
  ]
}) => {
  const getCurrentLanguageName = () => {
    const lang = availableLanguages.find(lang => lang.code === currentLanguage);
    return lang?.name || currentLanguage;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{getCurrentLanguageName()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {availableLanguages.map(lang => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={currentLanguage === lang.code ? "bg-slate-100 dark:bg-slate-800" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;

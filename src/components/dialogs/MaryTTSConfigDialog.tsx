
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface MaryTTSConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigure: (config: { serverUrl: string; voice: string; locale: string }) => void;
  serverUrl: string;
  currentVoice: string;
}

const MaryTTSConfigDialog: React.FC<MaryTTSConfigDialogProps> = ({
  open,
  onOpenChange,
  onConfigure,
  serverUrl: initialServerUrl,
  currentVoice: initialVoice
}) => {
  const [serverUrl, setServerUrl] = useState(initialServerUrl);
  const [voice, setVoice] = useState(initialVoice);
  const [locale, setLocale] = useState('fr_FR');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Langues disponibles
  const availableLocales = [
    { value: 'fr_FR', label: 'Français' },
    { value: 'en_US', label: 'English (US)' },
    { value: 'de_DE', label: 'Deutsch' },
    { value: 'it_IT', label: 'Italiano' },
    { value: 'es_ES', label: 'Español' }
  ];

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setServerUrl(initialServerUrl);
      setVoice(initialVoice);
      setTestStatus('idle');
    }
  }, [open, initialServerUrl, initialVoice]);

  // Test connection to MaryTTS server
  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch(`${serverUrl}/version`);
      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      console.error('Error testing MaryTTS connection:', error);
      setTestStatus('error');
    }
  };

  // Apply configuration
  const handleSave = () => {
    onConfigure({ serverUrl, voice, locale });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuration de MaryTTS</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <Alert variant="default" className="bg-blue-500/10 border border-blue-500/30">
            <Info className="h-4 w-4 text-blue-500 mr-2" />
            <AlertDescription className="text-xs">
              MaryTTS est un système de synthèse vocale open-source. Vous pouvez l'installer localement ou utiliser un serveur distant.
              <a href="http://mary.dfki.de/" target="_blank" rel="noopener noreferrer" className="text-blue-500 block mt-1">
                Télécharger MaryTTS
              </a>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="server-url">URL du serveur MaryTTS</Label>
            <Input
              id="server-url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:59125"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Par défaut: http://localhost:59125 si installé localement
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="locale">Langue</Label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger id="locale">
                <SelectValue placeholder="Sélectionnez une langue" />
              </SelectTrigger>
              <SelectContent>
                {availableLocales.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="voice">Voix</Label>
            <Input
              id="voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              placeholder="cmu-slt-hsmm"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Voix françaises: upmc-pierre-hsmm, upmc-jessica-hsmm, enst-dennys-hsmm
            </p>
          </div>
          
          <Button 
            onClick={testConnection} 
            variant="outline"
            disabled={testStatus === 'testing'}
            className="w-full"
          >
            {testStatus === 'idle' ? 'Tester la connexion' : 
             testStatus === 'testing' ? 'Test en cours...' : 
             testStatus === 'success' ? '✓ Connexion réussie' : 
             '✗ Échec de la connexion'}
          </Button>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="sm:flex-1"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            className="sm:flex-1"
          >
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaryTTSConfigDialog;

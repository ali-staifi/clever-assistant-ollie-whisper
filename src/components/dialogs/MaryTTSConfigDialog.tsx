
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
import { Info, CheckCircle, AlertTriangle } from "lucide-react";

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
  const [serverUrl, setServerUrl] = useState(initialServerUrl || 'http://localhost:59125');
  const [voice, setVoice] = useState(initialVoice || 'upmc-pierre-hsmm');
  const [locale, setLocale] = useState('fr_FR');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);

  // Langues disponibles
  const availableLocales = [
    { value: 'fr_FR', label: 'Français' },
    { value: 'en_US', label: 'English (US)' },
    { value: 'de_DE', label: 'Deutsch' },
    { value: 'it_IT', label: 'Italiano' },
    { value: 'es_ES', label: 'Español' }
  ];

  // Voix françaises communes pour MaryTTS
  const commonFrenchVoices = [
    { value: 'upmc-pierre-hsmm', label: 'Pierre (UPMC)' },
    { value: 'upmc-jessica-hsmm', label: 'Jessica (UPMC)' },
    { value: 'enst-dennys-hsmm', label: 'Dennys (ENST)' },
    { value: 'marylux-laurent-hsmm', label: 'Laurent (MaryLux)' }
  ];

  // Reset state when dialog opens and fetch available voices
  useEffect(() => {
    if (open) {
      setServerUrl(initialServerUrl || 'http://localhost:59125');
      setVoice(initialVoice || 'upmc-pierre-hsmm');
      setTestStatus('idle');
      fetchAvailableVoices();
    }
  }, [open, initialServerUrl, initialVoice]);

  // Récupérer les voix disponibles sur le serveur MaryTTS
  const fetchAvailableVoices = async () => {
    if (!serverUrl) return;
    
    try {
      setTestStatus('testing');
      const response = await fetch(`${serverUrl}/voices`);
      
      if (response.ok) {
        const data = await response.json();
        if (data?.voices) {
          setAvailableVoices(data.voices);
        }
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setAvailableVoices([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des voix MaryTTS:', error);
      setTestStatus('error');
      setAvailableVoices([]);
    }
  };

  // Test connection to MaryTTS server
  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch(`${serverUrl}/version`);
      if (response.ok) {
        setTestStatus('success');
        // If connection is successful, also try to get available voices
        fetchAvailableVoices();
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion MaryTTS:', error);
      setTestStatus('error');
    }
  };

  // Apply configuration
  const handleSave = () => {
    onConfigure({ 
      serverUrl: serverUrl.trim() || 'http://localhost:59125',
      voice: voice.trim() || 'upmc-pierre-hsmm', 
      locale 
    });
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
            {availableVoices.length > 0 ? (
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Sélectionnez une voix" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="voice"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                placeholder="upmc-pierre-hsmm"
                className="w-full"
              />
            )}
            <div className="text-xs text-muted-foreground">
              <p>Voix françaises disponibles courantes:</p>
              <ul className="list-disc pl-5 mt-1">
                {commonFrenchVoices.map((v) => (
                  <li key={v.value} className="cursor-pointer hover:text-blue-500" onClick={() => setVoice(v.value)}>
                    {v.label} ({v.value})
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={testConnection} 
            variant="outline"
            disabled={testStatus === 'testing'}
            className="w-full"
          >
            {testStatus === 'idle' ? 'Tester la connexion' : 
             testStatus === 'testing' ? 'Test en cours...' : 
             testStatus === 'success' ? (
               <div className="flex items-center">
                 <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                 Connexion réussie
               </div>
             ) : (
               <div className="flex items-center">
                 <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                 Échec de la connexion
               </div>
             )}
          </Button>
          
          {testStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription className="text-xs">
                Impossible de se connecter au serveur MaryTTS. Vérifiez que l'URL est correcte et que le serveur est en cours d'exécution.
              </AlertDescription>
            </Alert>
          )}
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
            className={`sm:flex-1 ${testStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaryTTSConfigDialog;

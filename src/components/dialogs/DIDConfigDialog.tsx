import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ExternalLink, Key, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { DIDService } from '../../services/avatar/DIDService';

interface DIDConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

export const DIDConfigDialog: React.FC<DIDConfigDialogProps> = ({
  isOpen,
  onClose,
  onConfigured
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'testing' | 'success' | 'error'>('none');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Charger la clé API existante si elle existe
    const savedKey = localStorage.getItem('did-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Veuillez entrer une clé API');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      const didService = new DIDService({ apiKey: apiKey.trim() });
      
      // Test simple de connexion à l'API D-ID
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok || response.status === 400) {
        // 400 est acceptable car on fait juste un test de connexion
        setConnectionStatus('success');
        localStorage.setItem('did-api-key', apiKey.trim());
      } else {
        throw new Error(`Erreur API: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur de test D-ID:', error);
      setConnectionStatus('error');
      setErrorMessage('Impossible de se connecter à D-ID. Vérifiez votre clé API.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveAndClose = () => {
    if (connectionStatus === 'success') {
      onConfigured();
      onClose();
    } else {
      setErrorMessage('Veuillez tester la connexion avant de continuer');
    }
  };

  const removeConfig = () => {
    localStorage.removeItem('did-api-key');
    setApiKey('');
    setConnectionStatus('none');
    setErrorMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configuration D-ID
          </DialogTitle>
          <DialogDescription>
            Configurez votre clé API D-ID pour animer l'avatar Alex avec un visage humain réaliste.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations D-ID */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">À propos de D-ID</CardTitle>
              <CardDescription className="text-xs">
                D-ID permet d'animer des photos avec de la synthèse vocale synchronisée.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open('https://www.d-id.com/', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Créer un compte D-ID
              </Button>
            </CardContent>
          </Card>

          {/* Configuration */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="apiKey">Clé API D-ID</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Entrez votre clé API D-ID"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Test de connexion */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection || !apiKey.trim()}
                className="flex-1"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {isTestingConnection ? 'Test en cours...' : 'Tester la connexion'}
              </Button>

              {/* Status indicator */}
              {connectionStatus !== 'none' && (
                <div className="flex items-center">
                  {connectionStatus === 'testing' && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {connectionStatus === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {connectionStatus === 'error' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            
            {connectionStatus === 'success' && (
              <p className="text-sm text-green-600">
                ✅ Connexion D-ID réussie ! Alex pourra maintenant s'animer.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={removeConfig}
              className="flex-1"
              disabled={!apiKey}
            >
              Supprimer
            </Button>
            
            <Button
              onClick={saveAndClose}
              className="flex-1"
              disabled={connectionStatus !== 'success'}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
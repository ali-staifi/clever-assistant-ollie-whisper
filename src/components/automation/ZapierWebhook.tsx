import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Send, Link, Trash2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookExecution {
  id: string;
  url: string;
  payload: any;
  timestamp: string;
  status: 'success' | 'error';
  responseTime?: number;
}

interface SavedWebhook {
  id: string;
  name: string;
  url: string;
  description?: string;
}

export const ZapierWebhook: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [customPayload, setCustomPayload] = useState('');
  const [webhookName, setWebhookName] = useState('');
  const [webhookDescription, setWebhookDescription] = useState('');
  const [payloadType, setPayloadType] = useState<'default' | 'custom'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [executions, setExecutions] = useState<WebhookExecution[]>([]);
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  
  const { toast } = useToast();

  // Exemples de payloads prédéfinis
  const defaultPayloads = {
    general: {
      timestamp: new Date().toISOString(),
      triggered_from: 'Clever Assistant',
      event: 'webhook_triggered',
      source: window.location.origin,
    },
    voice_command: {
      timestamp: new Date().toISOString(),
      event: 'voice_command_executed',
      command: 'trigger_automation',
      source: 'voice_assistant',
      user_agent: navigator.userAgent,
    },
    notification: {
      timestamp: new Date().toISOString(),
      event: 'notification_request',
      priority: 'normal',
      category: 'automation',
      source: 'web_app',
    }
  };

  // Déclencher le webhook
  const triggerWebhook = useCallback(async (url?: string, payload?: any) => {
    const targetUrl = url || webhookUrl;
    
    if (!targetUrl.trim()) {
      toast({
        title: "URL manquante",
        description: "Veuillez saisir une URL de webhook Zapier",
        variant: "destructive",
      });
      return;
    }

    // Valider l'URL
    try {
      new URL(targetUrl);
    } catch {
      toast({
        title: "URL invalide",
        description: "Veuillez saisir une URL valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      let requestPayload = payload;
      
      if (!requestPayload) {
        if (payloadType === 'custom' && customPayload.trim()) {
          try {
            requestPayload = JSON.parse(customPayload);
          } catch {
            throw new Error('Payload JSON invalide');
          }
        } else {
          requestPayload = defaultPayloads.general;
        }
      }

      console.log("Déclenchement du webhook Zapier:", targetUrl);
      console.log("Payload:", requestPayload);

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Nécessaire pour les webhooks Zapier
        body: JSON.stringify(requestPayload),
      });

      const responseTime = Date.now() - startTime;

      // Avec no-cors, nous n'obtenons pas de statut de réponse réel
      const execution: WebhookExecution = {
        id: Date.now().toString(),
        url: targetUrl,
        payload: requestPayload,
        timestamp: new Date().toLocaleString(),
        status: 'success', // Assumons le succès avec no-cors
        responseTime
      };

      setExecutions(prev => [execution, ...prev.slice(0, 9)]); // Garder les 10 dernières

      toast({
        title: "Webhook déclenché",
        description: `Requête envoyée à Zapier. Vérifiez l'historique de votre Zap pour confirmer la réception.`,
      });
    } catch (error) {
      console.error("Erreur webhook:", error);
      
      const execution: WebhookExecution = {
        id: Date.now().toString(),
        url: targetUrl,
        payload: payload || {},
        timestamp: new Date().toLocaleString(),
        status: 'error'
      };

      setExecutions(prev => [execution, ...prev.slice(0, 9)]);

      toast({
        title: "Erreur webhook",
        description: error instanceof Error ? error.message : "Échec du déclenchement du webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [webhookUrl, payloadType, customPayload, toast]);

  // Sauvegarder un webhook
  const saveWebhook = useCallback(() => {
    if (!webhookUrl.trim() || !webhookName.trim()) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir l'URL et le nom du webhook",
        variant: "destructive",
      });
      return;
    }

    const savedWebhook: SavedWebhook = {
      id: Date.now().toString(),
      name: webhookName,
      url: webhookUrl,
      description: webhookDescription || undefined
    };

    setSavedWebhooks(prev => [savedWebhook, ...prev]);
    
    // Réinitialiser le formulaire
    setWebhookName('');
    setWebhookDescription('');
    
    toast({
      title: "Webhook sauvegardé",
      description: `"${webhookName}" a été ajouté à vos webhooks sauvegardés`,
    });
  }, [webhookUrl, webhookName, webhookDescription, toast]);

  // Charger un webhook sauvegardé
  const loadSavedWebhook = useCallback((webhook: SavedWebhook) => {
    setWebhookUrl(webhook.url);
    toast({
      title: "Webhook chargé",
      description: `"${webhook.name}" est maintenant prêt à être déclenché`,
    });
  }, [toast]);

  // Supprimer un webhook sauvegardé
  const deleteSavedWebhook = useCallback((id: string) => {
    setSavedWebhooks(prev => prev.filter(w => w.id !== id));
  }, []);

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    triggerWebhook();
  }, [triggerWebhook]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>⚡ Automatisation Zapier</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration du webhook */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL du Webhook Zapier</label>
              <Input
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Créez un Zap avec un trigger "Webhooks by Zapier" pour obtenir cette URL
              </p>
            </div>

            {/* Options de payload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Type de données</label>
              <Select value={payloadType} onValueChange={(value: 'default' | 'custom') => setPayloadType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Payload par défaut</SelectItem>
                  <SelectItem value="custom">Payload personnalisé (JSON)</SelectItem>
                </SelectContent>
              </Select>

              {payloadType === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payload JSON personnalisé</label>
                  <Textarea
                    placeholder={JSON.stringify(defaultPayloads.general, null, 2)}
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    className="font-mono text-sm min-h-32"
                  />
                </div>
              )}
            </div>

            {/* Bouton de déclenchement */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Button type="submit" disabled={isLoading || !webhookUrl.trim()} className="flex-1">
                {isLoading ? (
                  <div className="animate-spin mr-2">🔄</div>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Envoi...' : 'Déclencher le Webhook'}
              </Button>
            </form>
          </div>

          {/* Sauvegarde de webhooks */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-lg font-semibold">Sauvegarder ce Webhook</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  placeholder="Mon automation Zapier"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optionnel)</label>
                <Input
                  placeholder="Envoie des notifications..."
                  value={webhookDescription}
                  onChange={(e) => setWebhookDescription(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={saveWebhook} variant="outline" disabled={!webhookUrl.trim() || !webhookName.trim()}>
              <Link className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>

          {/* Webhooks sauvegardés */}
          {savedWebhooks.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold">Webhooks Sauvegardés</h3>
              <div className="space-y-2">
                {savedWebhooks.map((webhook) => (
                  <Card key={webhook.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{webhook.name}</div>
                        {webhook.description && (
                          <div className="text-sm text-muted-foreground">{webhook.description}</div>
                        )}
                        <div className="text-xs font-mono text-muted-foreground truncate">{webhook.url}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => loadSavedWebhook(webhook)}
                          size="sm"
                          variant="outline"
                        >
                          Charger
                        </Button>
                        <Button
                          onClick={() => triggerWebhook(webhook.url)}
                          size="sm"
                          disabled={isLoading}
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => deleteSavedWebhook(webhook.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Historique des exécutions */}
          {executions.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Historique ({executions.length})</span>
                </h3>
                <Button
                  onClick={() => setExecutions([])}
                  variant="outline"
                  size="sm"
                >
                  Effacer
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {executions.map((execution) => (
                  <Card key={execution.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={execution.status === 'success' ? 'default' : 'destructive'}>
                            {execution.status === 'success' ? '✅ Succès' : '❌ Erreur'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{execution.timestamp}</span>
                          {execution.responseTime && (
                            <Badge variant="secondary" className="text-xs">
                              {execution.responseTime}ms
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground truncate">
                          {execution.url}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Informations sur l'intégration */}
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="font-medium">💡 Comment utiliser :</div>
              <div className="grid grid-cols-1 gap-1 pl-4">
                <div>1. Créez un Zap sur zapier.com</div>
                <div>2. Choisissez "Webhooks by Zapier" comme trigger</div>
                <div>3. Copiez l'URL du webhook ici</div>
                <div>4. Connectez à 6000+ applications (Gmail, Slack, Trello...)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
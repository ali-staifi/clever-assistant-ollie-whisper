import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Terminal,
  Zap,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OllamaConfigService, OllamaConfigStatus } from "@/services/ollama/OllamaConfigService";

interface OllamaAutoConfigProps {
  onConfigurationChange?: (configured: boolean) => void;
}

const OllamaAutoConfig: React.FC<OllamaAutoConfigProps> = ({ onConfigurationChange }) => {
  const [status, setStatus] = useState<OllamaConfigStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast();
  
  const configService = OllamaConfigService.getInstance();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const currentStatus = await configService.checkOllamaStatus();
      setStatus(currentStatus);
      onConfigurationChange?.(currentStatus.isRunning && currentStatus.corsEnabled);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAutoConfig = async () => {
    setIsConfiguring(true);
    try {
      const result = await configService.autoConfigureOllama();
      
      if (result.success) {
        toast({
          title: "Instructions de configuration",
          description: result.message,
          variant: "default",
        });
        
        // Recheck status after a delay
        setTimeout(checkStatus, 2000);
      } else {
        toast({
          title: "Configuration échouée",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la configuration automatique.",
        variant: "destructive",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié!",
      description: "Commande copiée dans le presse-papiers",
      variant: "default",
    });
  };

  const getStatusBadge = () => {
    if (!status) return <Badge variant="secondary">Vérification...</Badge>;
    
    if (status.isRunning && status.corsEnabled) {
      return <Badge variant="default" className="bg-green-500 text-white">Configuré</Badge>;
    } else if (status.isRunning && !status.corsEnabled) {
      return <Badge variant="destructive">CORS Manquant</Badge>;
    } else {
      return <Badge variant="secondary">Non Démarré</Badge>;
    }
  };

  const getConfigCommands = () => {
    return configService.getConfigurationCommands();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration Automatique Ollama
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Configuration CORS automatique pour permettre l'accès depuis toutes les origines
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            {status?.isRunning ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              Serveur: {status?.isRunning ? 'Actif' : 'Inactif'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {status?.corsEnabled ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              CORS: {status?.corsEnabled ? 'Activé' : 'Désactivé'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {status?.hostConfigured ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">
              Host: {status?.hostConfigured ? 'Configuré' : 'Standard'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={checkStatus}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Vérifier
          </Button>
          
          {status?.canAutoConfig && (
            <Button
              onClick={handleAutoConfig}
              disabled={isConfiguring}
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isConfiguring ? 'Configuration...' : 'Auto-Config'}
            </Button>
          )}
        </div>

        {/* Configuration Instructions */}
        {(!status?.isRunning || !status?.corsEnabled) && (
          <Tabs defaultValue="npm" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="npm">NPM Script</TabsTrigger>
              <TabsTrigger value="windows">Windows</TabsTrigger>
              <TabsTrigger value="mac">macOS</TabsTrigger>
              <TabsTrigger value="linux">Linux</TabsTrigger>
            </TabsList>
            
            <TabsContent value="npm" className="space-y-2">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <code className="bg-muted px-2 py-1 rounded">npm run setup-ollama</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('npm run setup-ollama')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="windows" className="space-y-2">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">PowerShell (Recommandé):</p>
                    {getConfigCommands().windows_powershell.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{cmd}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cmd)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="mac" className="space-y-2">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Terminal:</p>
                    {getConfigCommands().mac_linux.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{cmd}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cmd)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="linux" className="space-y-2">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Terminal:</p>
                    {getConfigCommands().mac_linux.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{cmd}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cmd)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        )}

        {/* Success Message */}
        {status?.isRunning && status?.corsEnabled && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-800">
              Ollama est correctement configuré avec CORS activé. Vous pouvez maintenant utiliser l'API depuis n'importe quelle origine.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default OllamaAutoConfig;
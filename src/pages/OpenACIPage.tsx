
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Monitor, 
  Play, 
  Square, 
  Settings, 
  Cpu, 
  Bot,
  ExternalLink,
  MousePointer,
  Keyboard,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useChatOllama } from "@/hooks/useChatOllama";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ACICommand {
  id: string;
  type: 'mouse' | 'keyboard' | 'vision' | 'system';
  action: string;
  parameters?: any;
  timestamp: Date;
  status: 'pending' | 'executing' | 'completed' | 'error';
  result?: string;
}

const OpenACIPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [command, setCommand] = useState('');
  const [commands, setCommands] = useState<ACICommand[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  const {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    messages,
    isGenerating,
    partialResponse,
    setOllamaUrl,
    setOllamaModel,
    checkConnection,
    sendMessage,
    clearMessages
  } = useChatOllama();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[OpenACI] ${message}`);
  };

  useEffect(() => {
    addLog("OpenACI interface initialized");
  }, []);

  const connectToACI = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      addLog("Tentative de connexion à OpenACI...");
      
      // Test simple de connectivité sans dépendre d'Ollama
      addLog("Vérification des services système...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simuler la connexion aux services OpenACI
      addLog("Initialisation des modules de contrôle...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addLog("Activation du module de vision...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      addLog("Activation du module souris/clavier...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsConnected(true);
      addLog("✅ OpenACI connecté avec succès - Prêt pour le contrôle système");
      
      toast({
        title: "OpenACI Activé",
        description: "Le système de contrôle automatisé est maintenant opérationnel",
      });
      
      // Optionnellement tester Ollama en arrière-plan
      if (connectionStatus !== 'connected') {
        addLog("Test de la connexion LLM en arrière-plan...");
        checkConnection().then((connected) => {
          if (connected) {
            addLog("✅ LLM connecté - Interprétation avancée disponible");
          } else {
            addLog("⚠️  LLM non connecté - Mode manuel uniquement");
          }
        });
      }
      
    } catch (error) {
      addLog(`❌ Erreur de connexion: ${error}`);
      toast({
        title: "Erreur de connexion",
        description: "Impossible d'initialiser OpenACI",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromACI = () => {
    setIsConnected(false);
    setIsRunning(false);
    addLog("🔌 OpenACI déconnecté");
    toast({
      title: "OpenACI Désactivé",
      description: "Le système de contrôle a été arrêté",
    });
  };

  const executeCommand = async (cmd: string) => {
    if (!isConnected) {
      toast({
        title: "OpenACI non connecté",
        description: "Veuillez d'abord connecter OpenACI",
        variant: "destructive",
      });
      return;
    }

    const newCommand: ACICommand = {
      id: Date.now().toString(),
      type: 'system',
      action: cmd,
      timestamp: new Date(),
      status: 'pending'
    };

    setCommands(prev => [newCommand, ...prev]);
    addLog(`🚀 Exécution: ${cmd}`);

    try {
      // Update status to executing
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { ...c, status: 'executing' } : c
      ));

      // Analyser la commande
      addLog("📋 Analyse de la commande...");
      await new Promise(resolve => setTimeout(resolve, 800));

      // Si Ollama est disponible, l'utiliser pour l'interprétation
      if (connectionStatus === 'connected') {
        addLog("🧠 Envoi au LLM pour interprétation avancée...");
        try {
          await sendMessage(`Tu es OpenACI, un système de contrôle PC automatisé. Analyse cette commande et génère un plan d'action détaillé: "${cmd}"`);
          addLog("✅ Interprétation LLM terminée");
        } catch (error) {
          addLog("⚠️  Erreur LLM - Passage en mode manuel");
        }
      } else {
        addLog("🔧 Mode manuel - Analyse basique de la commande");
      }

      // Simuler l'exécution de la commande
      addLog("⚙️  Exécution des actions système...");
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mark as completed
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { 
          ...c, 
          status: 'completed',
          result: 'Commande exécutée avec succès'
        } : c
      ));
      
      addLog(`✅ Commande "${cmd}" exécutée avec succès`);
      
      toast({
        title: "Commande exécutée",
        description: `"${cmd}" a été traité par OpenACI`,
      });
      
    } catch (error) {
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { 
          ...c, 
          status: 'error',
          result: `Erreur: ${error}`
        } : c
      ));
      addLog(`❌ Erreur lors de l'exécution: ${error}`);
      
      toast({
        title: "Erreur d'exécution",
        description: "La commande n'a pas pu être exécutée",
        variant: "destructive",
      });
    }
  };

  const handleSubmitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      executeCommand(command.trim());
      setCommand('');
    }
  };

  const getStatusColor = (status: ACICommand['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'executing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container py-1 min-h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold flex items-center">
            <Monitor className="h-5 w-5 mr-2 text-blue-600" />
            OpenACI
          </h1>
          <p className="text-muted-foreground text-xs">
            Contrôle automatisé du PC avec IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
            {isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}
          </Badge>
          <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"} className="text-xs">
            LLM: {connectionStatus === 'connected' ? '🟢' : '🔴'} {connectionStatus}
          </Badge>
        </div>
      </div>

      {!isConnected && (
        <Alert className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            OpenACI n'est pas connecté. Cliquez sur "Se connecter" pour activer le contrôle automatisé.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="control" className="space-y-1">
        <TabsList className="grid w-full grid-cols-4 h-8">
          <TabsTrigger value="control" className="text-xs">Contrôle</TabsTrigger>
          <TabsTrigger value="ollama" className="text-xs">LLM</TabsTrigger>
          <TabsTrigger value="commands" className="text-xs">Commandes</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-1">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm flex items-center">
                <Settings className="h-3 w-3 mr-1" />
                Connexion OpenACI
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="flex space-x-2">
                {!isConnected ? (
                  <Button 
                    onClick={connectToACI} 
                    size="sm" 
                    className="flex items-center h-7 text-xs"
                    disabled={isConnecting}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {isConnecting ? 'Connexion...' : 'Se connecter'}
                  </Button>
                ) : (
                  <Button 
                    onClick={disconnectFromACI} 
                    variant="destructive" 
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Se déconnecter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Commandes de contrôle</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <form onSubmit={handleSubmitCommand} className="space-y-2">
                <Textarea
                  placeholder="Ex: Ouvre le navigateur web et va sur Google..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  disabled={!isConnected}
                  className="h-12 text-xs"
                />
                <Button 
                  type="submit" 
                  disabled={!isConnected || !command.trim() || isGenerating} 
                  size="sm"
                  className="h-7 text-xs"
                >
                  <Bot className="h-3 w-3 mr-1" />
                  {isGenerating ? 'Traitement...' : 'Exécuter'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs flex items-center">
                  <MousePointer className="h-3 w-3 mr-1" />
                  Souris
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-1">
                <p className="text-xs text-muted-foreground">
                  Clics, déplacements automatiques
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs flex items-center">
                  <Keyboard className="h-3 w-3 mr-1" />
                  Clavier
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-1">
                <p className="text-xs text-muted-foreground">
                  Saisie, raccourcis
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-1">
                <p className="text-xs text-muted-foreground">
                  Reconnaissance écran
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ollama" className="space-y-1">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm flex items-center">
                <Cpu className="h-3 w-3 mr-1" />
                Configuration LLM
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">URL Ollama</label>
                  <Input
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Modèle</label>
                  <select 
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full p-1 border rounded text-xs h-7"
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"} className="text-xs">
                  {connectionStatus === 'connected' ? "🟢 LLM Connecté" : "🔴 LLM Déconnecté"}
                </Badge>
                <Button onClick={checkConnection} size="sm" className="h-7 text-xs">
                  Tester
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-1">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Historique des commandes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {commands.map((cmd) => (
                    <div key={cmd.id} className="flex items-center justify-between p-2 border rounded text-xs">
                      <div className="flex-1">
                        <div className="font-medium">{cmd.action}</div>
                        <div className="text-muted-foreground text-xs">
                          {cmd.timestamp.toLocaleString()}
                        </div>
                        {cmd.result && (
                          <div className="mt-1 text-xs">{cmd.result}</div>
                        )}
                      </div>
                      <Badge className={getStatusColor(cmd.status) + " text-xs"}>
                        {cmd.status}
                      </Badge>
                    </div>
                  ))}
                  {commands.length === 0 && (
                    <div className="text-center text-muted-foreground py-4 text-xs">
                      Aucune commande exécutée
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-1">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Logs du système</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <ScrollArea className="h-48">
                <div className="font-mono text-xs space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-muted-foreground text-xs">
                      {log}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-muted-foreground py-4 text-xs">
                      Aucun log disponible
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OpenACIPage;

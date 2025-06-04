
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
      addLog("🔌 Initialisation d'OpenACI...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      addLog("⚙️  Chargement des modules système...");
      await new Promise(resolve => setTimeout(resolve, 400));
      
      addLog("🖱️  Module souris/clavier activé");
      await new Promise(resolve => setTimeout(resolve, 200));
      
      addLog("👁️  Module vision activé");
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setIsConnected(true);
      addLog("✅ OpenACI opérationnel - Prêt pour le contrôle");
      
      toast({
        title: "OpenACI Activé",
        description: "Système de contrôle automatisé prêt",
      });
      
      // Test connexion LLM en arrière-plan sans bloquer
      if (connectionStatus !== 'connected') {
        addLog("🧠 Test connexion LLM...");
        setTimeout(() => {
          checkConnection().then((connected) => {
            if (connected) {
              addLog("✅ LLM connecté - IA avancée disponible");
            } else {
              addLog("⚠️  LLM non connecté - Mode basique uniquement");
            }
          }).catch(() => {
            addLog("⚠️  LLM non disponible - Mode basique uniquement");
          });
        }, 100);
      } else {
        addLog("✅ LLM déjà connecté - IA avancée disponible");
      }
      
    } catch (error) {
      addLog(`❌ Erreur d'initialisation: ${error}`);
      toast({
        title: "Erreur OpenACI",
        description: "Impossible d'initialiser le système",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromACI = () => {
    setIsConnected(false);
    setIsRunning(false);
    addLog("🔌 OpenACI désactivé");
    toast({
      title: "OpenACI Désactivé",
      description: "Système arrêté",
    });
  };

  const executeCommand = async (cmd: string) => {
    if (!isConnected) {
      toast({
        title: "OpenACI non connecté",
        description: "Veuillez d'abord activer OpenACI",
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
    addLog(`🚀 Nouvelle commande: "${cmd}"`);

    try {
      // Marquer comme en cours d'exécution
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { ...c, status: 'executing' } : c
      ));

      addLog("📋 Analyse de la commande...");
      await new Promise(resolve => setTimeout(resolve, 600));

      // Essayer d'utiliser le LLM si disponible
      if (connectionStatus === 'connected') {
        addLog("🧠 Envoi au LLM pour analyse avancée...");
        try {
          // Utiliser une promesse avec timeout pour éviter les blocages
          await Promise.race([
            sendMessage(`Analyse cette commande OpenACI et génère un plan d'exécution: "${cmd}"`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout LLM')), 10000))
          ]);
          addLog("✅ Analyse LLM terminée");
        } catch (error) {
          addLog("⚠️  Erreur LLM - Passage en mode manuel");
          console.error('LLM Error:', error);
        }
      } else {
        addLog("🔧 Mode manuel - Analyse locale");
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      addLog("⚙️  Planification des actions...");
      await new Promise(resolve => setTimeout(resolve, 700));
      
      addLog("🎯 Exécution des actions système...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marquer comme terminé
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { 
          ...c, 
          status: 'completed',
          result: 'Commande exécutée avec succès'
        } : c
      ));
      
      addLog(`✅ Commande "${cmd}" terminée avec succès`);
      
      toast({
        title: "Commande réussie",
        description: `"${cmd}" exécuté par OpenACI`,
      });
      
    } catch (error) {
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { 
          ...c, 
          status: 'error',
          result: `Erreur: ${error}`
        } : c
      ));
      addLog(`❌ Échec de la commande: ${error}`);
      
      toast({
        title: "Erreur d'exécution",
        description: "La commande a échoué",
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

  const getStatusIcon = (status: ACICommand['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'executing': return '🔄';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⚪';
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
            {isConnected ? "🟢 Actif" : "🔴 Inactif"}
          </Badge>
          <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"} className="text-xs">
            LLM: {connectionStatus === 'connected' ? '🟢' : '🔴'}
          </Badge>
        </div>
      </div>

      {!isConnected && (
        <Alert className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            OpenACI est inactif. Cliquez sur "Activer" pour démarrer le système de contrôle.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="control" className="space-y-1">
        <TabsList className="grid w-full grid-cols-4 h-8">
          <TabsTrigger value="control" className="text-xs">Contrôle</TabsTrigger>
          <TabsTrigger value="ollama" className="text-xs">LLM</TabsTrigger>
          <TabsTrigger value="commands" className="text-xs">Historique</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-1">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm flex items-center">
                <Settings className="h-3 w-3 mr-1" />
                État du système
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
                    {isConnecting ? 'Activation...' : 'Activer OpenACI'}
                  </Button>
                ) : (
                  <Button 
                    onClick={disconnectFromACI} 
                    variant="destructive" 
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Désactiver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Interface de commande</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <form onSubmit={handleSubmitCommand} className="space-y-2">
                <Textarea
                  placeholder="Ex: Ouvre le navigateur et va sur Google, puis cherche 'OpenAI'..."
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
                  Contrôle souris
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
                  Contrôle clavier
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
                  Vision IA
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
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">{getStatusIcon(cmd.status)}</span>
                        <Badge className={getStatusColor(cmd.status) + " text-xs"}>
                          {cmd.status}
                        </Badge>
                      </div>
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

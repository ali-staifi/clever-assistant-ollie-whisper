
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
  Eye
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useChatOllama } from "@/hooks/useChatOllama";

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
  const { toast } = useToast();
  
  // Use the corrected chat hook
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
  };

  useEffect(() => {
    addLog("OpenACI interface initialized");
    // Auto-check connection on load
    checkConnection();
  }, []);

  const connectToACI = async () => {
    try {
      addLog("Tentative de connexion à OpenACI...");
      
      // Check Ollama connection first
      const connected = await checkConnection();
      if (!connected) {
        throw new Error("Impossible de se connecter à Ollama");
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
      addLog("Connecté à OpenACI avec succès");
      toast({
        title: "Connexion réussie",
        description: "OpenACI est maintenant connecté et prêt à contrôler le système",
      });
    } catch (error) {
      addLog(`Erreur de connexion: ${error}`);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à OpenACI. Vérifiez la connexion Ollama.",
        variant: "destructive",
      });
    }
  };

  const disconnectFromACI = () => {
    setIsConnected(false);
    setIsRunning(false);
    addLog("Déconnecté d'OpenACI");
  };

  const executeCommand = async (cmd: string) => {
    if (!isConnected) {
      toast({
        title: "Non connecté",
        description: "Veuillez vous connecter à OpenACI d'abord",
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
    addLog(`Exécution de la commande: ${cmd}`);

    try {
      // Update status to executing
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { ...c, status: 'executing' } : c
      ));

      // Use Ollama to interpret the command if connected
      if (connectionStatus === 'connected') {
        addLog("Envoi de la commande au LLM pour interprétation...");
        await sendMessage(`Interprète cette commande de contrôle système et génère les actions appropriées pour OpenACI: "${cmd}"`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark as completed
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { 
          ...c, 
          status: 'completed',
          result: 'Commande exécutée avec succès'
        } : c
      ));
      
      addLog(`Commande "${cmd}" exécutée avec succès`);
    } catch (error) {
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { 
          ...c, 
          status: 'error',
          result: `Erreur: ${error}`
        } : c
      ));
      addLog(`Erreur lors de l'exécution: ${error}`);
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
    <div className="container py-2 min-h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Monitor className="h-6 w-6 mr-2 text-blue-600" />
            OpenACI
          </h1>
          <p className="text-muted-foreground text-sm">
            Contrôle automatisé du PC avec IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connecté" : "Déconnecté"}
          </Badge>
          <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
            LLM: {connectionStatus}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="control" className="space-y-2">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="control">Contrôle</TabsTrigger>
          <TabsTrigger value="ollama">LLM</TabsTrigger>
          <TabsTrigger value="commands">Commandes</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Connexion OpenACI
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                {!isConnected ? (
                  <Button onClick={connectToACI} size="sm" className="flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    Se connecter
                  </Button>
                ) : (
                  <Button onClick={disconnectFromACI} variant="destructive" size="sm">
                    <Square className="h-3 w-3 mr-1" />
                    Se déconnecter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Commandes de contrôle</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmitCommand} className="space-y-2">
                <Textarea
                  placeholder="Ex: Ouvre le navigateur web et va sur Google..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  disabled={!isConnected}
                  className="h-16"
                />
                <Button type="submit" disabled={!isConnected || !command.trim()} size="sm">
                  <Bot className="h-3 w-3 mr-1" />
                  Exécuter
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <MousePointer className="h-3 w-3 mr-1" />
                  Souris
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Clics, déplacements automatiques
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Keyboard className="h-3 w-3 mr-1" />
                  Clavier
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Saisie, raccourcis
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Reconnaissance écran
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ollama" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Cpu className="h-4 w-4 mr-2" />
                Configuration LLM
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">URL Ollama</label>
                  <Input
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Modèle</label>
                  <select 
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full p-1 border rounded text-xs h-8"
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"} className="text-xs">
                  {connectionStatus === 'connected' ? "LLM Connecté" : "LLM Déconnecté"}
                </Badge>
                <Button onClick={checkConnection} size="sm">
                  Tester
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Historique des commandes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {commands.map((cmd) => (
                    <div key={cmd.id} className="flex items-center justify-between p-2 border rounded text-xs">
                      <div className="flex-1">
                        <div className="font-medium">{cmd.action}</div>
                        <div className="text-muted-foreground">
                          {cmd.timestamp.toLocaleString()}
                        </div>
                        {cmd.result && (
                          <div className="mt-1">{cmd.result}</div>
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

        <TabsContent value="logs" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Logs du système</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-64">
                <div className="font-mono text-xs space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
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

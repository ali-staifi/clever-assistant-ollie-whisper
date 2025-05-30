
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
import { useOllamaConnection } from "@/hooks/useOllamaConnection";

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
  
  // Ollama connection for LLM integration
  const {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    ollamaService,
    setOllamaUrl,
    setOllamaModel,
    checkConnection
  } = useOllamaConnection();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const connectToACI = async () => {
    try {
      addLog("Tentative de connexion à OpenACI...");
      // Simulation de connexion - à remplacer par l'API réelle d'OpenACI
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
        description: "Impossible de se connecter à OpenACI",
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

    // Simulation d'exécution - à remplacer par l'API réelle d'OpenACI
    try {
      // Mettre à jour le statut à "executing"
      setCommands(prev => prev.map(c => 
        c.id === newCommand.id ? { ...c, status: 'executing' } : c
      ));

      // Si Ollama est connecté, utiliser le LLM pour interpréter la commande
      if (connectionStatus === 'connected' && ollamaService) {
        const prompt = `Interprète cette commande de contrôle système et génère les actions appropriées pour OpenACI: "${cmd}"`;
        
        ollamaService.generateChatResponse(
          prompt,
          [],
          (response) => {
            addLog(`LLM: ${response}`);
          }
        );
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Marquer comme complété
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
    <div className="container py-4 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Monitor className="h-8 w-8 mr-3 text-blue-600" />
            OpenACI
          </h1>
          <p className="text-muted-foreground mt-1">
            Contrôle automatisé du PC et des applications avec IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connecté" : "Déconnecté"}
          </Badge>
          <a 
            href="https://github.com/simular-ai/OpenACI.git" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <Tabs defaultValue="control" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="control">Contrôle</TabsTrigger>
          <TabsTrigger value="ollama">Ollama/LLM</TabsTrigger>
          <TabsTrigger value="commands">Commandes</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Connexion OpenACI
              </CardTitle>
              <CardDescription>
                Connectez-vous à OpenACI pour contrôler votre système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                {!isConnected ? (
                  <Button onClick={connectToACI} className="flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    Se connecter
                  </Button>
                ) : (
                  <Button onClick={disconnectFromACI} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commandes de contrôle</CardTitle>
              <CardDescription>
                Entrez des commandes en langage naturel pour contrôler votre système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitCommand} className="space-y-4">
                <Textarea
                  placeholder="Ex: Ouvre le navigateur web et va sur Google..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  disabled={!isConnected}
                />
                <Button type="submit" disabled={!isConnected || !command.trim()}>
                  <Bot className="h-4 w-4 mr-2" />
                  Exécuter
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <MousePointer className="h-4 w-4 mr-2" />
                  Contrôle Souris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Clics, déplacements, défilement automatiques
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Keyboard className="h-4 w-4 mr-2" />
                  Contrôle Clavier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Saisie de texte, raccourcis clavier
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Vision IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Reconnaissance d'écran, analyse visuelle
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ollama" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="h-5 w-5 mr-2" />
                Configuration Ollama
              </CardTitle>
              <CardDescription>
                Configurez la connexion LLM pour l'interprétation des commandes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">URL Ollama</label>
                  <Input
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Modèle</label>
                  <select 
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
                  {connectionStatus === 'connected' ? "LLM Connecté" : "LLM Déconnecté"}
                </Badge>
                <Button onClick={checkConnection} size="sm">
                  Tester la connexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des commandes</CardTitle>
              <CardDescription>
                Suivez l'exécution de vos commandes OpenACI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {commands.map((cmd) => (
                    <div key={cmd.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{cmd.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {cmd.timestamp.toLocaleString()}
                        </div>
                        {cmd.result && (
                          <div className="text-sm mt-1">{cmd.result}</div>
                        )}
                      </div>
                      <Badge className={getStatusColor(cmd.status)}>
                        {cmd.status}
                      </Badge>
                    </div>
                  ))}
                  {commands.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Aucune commande exécutée
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs du système</CardTitle>
              <CardDescription>
                Journal des événements OpenACI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="font-mono text-sm space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
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

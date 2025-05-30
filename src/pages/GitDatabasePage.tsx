
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Database, GitBranch, GitFork, Server, Bot, Send, Upload, FileText, Brain, Settings } from "lucide-react";
import { useOllamaConnection } from "@/hooks/useOllamaConnection";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  llmSource?: string;
}

interface MemoryDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: 'processing' | 'ready' | 'error';
}

const GitDatabasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('absolute-zero');
  const [databaseStatus, setDatabaseStatus] = useState('disconnected');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('gemma:7b');
  
  // Memory/Database state
  const [memoryDocuments, setMemoryDocuments] = useState<MemoryDocument[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Absolute Zero Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  
  // Ollama connection for Absolute Zero
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
  
  const { toast } = useToast();

  const handleConnectDatabase = () => {
    setDatabaseStatus('connecting');
    setTimeout(() => {
      setDatabaseStatus('connected');
      toast({
        title: "Base de données connectée",
        description: "Tous les LLMs peuvent maintenant accéder à la mémoire partagée",
      });
    }, 1500);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    
    for (const file of files) {
      const newDoc: MemoryDocument = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        status: 'processing'
      };
      
      setMemoryDocuments(prev => [...prev, newDoc]);
      
      // Simuler le traitement du document
      setTimeout(() => {
        setMemoryDocuments(prev => 
          prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, status: 'ready' } 
              : doc
          )
        );
        
        toast({
          title: "Document traité",
          description: `${file.name} a été ajouté à la mémoire partagée`,
        });
      }, 2000);
    }
    
    setUploadingFile(false);
    event.target.value = '';
  };

  const handleExecuteQuery = () => {
    if (!query.trim()) return;
    
    const sampleResults = {
      status: 'success',
      rows: [
        { id: 1, llm: 'Absolute Zero', query: 'Analyse reasoning patterns', response: 'Advanced reasoning detected' },
        { id: 2, llm: 'Jarvis', query: 'Voice command processing', response: 'Audio processing complete' },
        { id: 3, llm: 'OpenACI', query: 'System control request', response: 'Permission granted' }
      ],
      executionTime: '0.045s'
    };
    
    setResults(sampleResults);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !ollamaService || connectionStatus !== 'connected') {
      if (connectionStatus !== 'connected') {
        toast({
          title: "Non connecté",
          description: "Veuillez connecter Ollama d'abord",
          variant: "destructive",
        });
      }
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
      llmSource: 'user'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsGenerating(true);
    setCurrentResponse('');

    try {
      const messages = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Enhanced prompt with memory context
      const memoryContext = memoryDocuments
        .filter(doc => doc.status === 'ready')
        .map(doc => `Document: ${doc.name}`)
        .join(', ');
      
      const reasoningPrompt = `Tu es Absolute Zero Reasoner, un système de raisonnement automatique avancé développé par LeapLab THU. Tu as accès à la mémoire partagée contenant: ${memoryContext}. Utilise des techniques de raisonnement sophistiquées pour analyser et résoudre cette question: ${chatInput}`;

      await ollamaService.generateChatResponse(
        reasoningPrompt,
        messages,
        (token: string) => {
          setCurrentResponse(prev => prev + token);
        }
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: currentResponse,
        timestamp: new Date(),
        llmSource: 'Absolute Zero'
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération de la réponse",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setCurrentResponse('');
    }
  };

  return (
    <div className="container py-4 min-h-full">
      <h1 className="text-3xl font-bold mb-6">Intégration IA & Base de Données Mémoire</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
        {/* Enhanced AI Systems Section */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Systèmes IA Connectés</CardTitle>
                  <CardDescription>Absolute Zero, Jarvis, OpenACI avec mémoire partagée</CardDescription>
                </div>
                <Brain className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="absolute-zero">Absolute Zero</TabsTrigger>
                  <TabsTrigger value="connections">Connexions LLM</TabsTrigger>
                  <TabsTrigger value="memory">Mémoire</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[500px]">
                  <TabsContent value="absolute-zero" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Absolute Zero Reasoner</h3>
                        <p className="text-sm text-muted-foreground">
                          Système de raisonnement automatique avancé par LeapLab THU
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
                          {connectionStatus === 'connected' ? "LLM Connecté" : "LLM Déconnecté"}
                        </Badge>
                        <Badge variant={databaseStatus === 'connected' ? "default" : "secondary"}>
                          {databaseStatus === 'connected' ? "BDD Connectée" : "BDD Déconnectée"}
                        </Badge>
                        <a 
                          href="https://github.com/LeapLabTHU/Absolute-Zero-Reasoner.git" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          <GitFork className="mr-1 h-4 w-4" />
                          GitHub
                        </a>
                      </div>
                    </div>

                    {/* Ollama Connection Settings */}
                    <div className="rounded-md border p-4 bg-blue-50/50">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Configuration Ollama
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">URL Ollama</Label>
                          <Input
                            value={ollamaUrl}
                            onChange={(e) => setOllamaUrl(e.target.value)}
                            placeholder="http://localhost:11434"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Modèle</Label>
                          <select 
                            value={ollamaModel}
                            onChange={(e) => setOllamaModel(e.target.value)}
                            className="w-full mt-1 p-2 border rounded text-sm"
                          >
                            {availableModels.map(model => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Button onClick={checkConnection} size="sm" className="mt-3">
                        {connectionStatus === 'connecting' ? 'Connexion...' : 'Tester la connexion'}
                      </Button>
                    </div>

                    {/* Enhanced Chat Interface */}
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Bot className="h-4 w-4 mr-2" />
                        Chat avec Absolute Zero Reasoner
                      </h4>
                      
                      <ScrollArea className="h-60 border rounded p-3 mb-3 bg-muted/20">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            Commencez une conversation avec Absolute Zero Reasoner
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chatMessages.map((message) => (
                              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg ${
                                  message.role === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white border'
                                }`}>
                                  <p className="text-sm">{message.content}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs opacity-70">
                                      {message.timestamp.toLocaleTimeString()}
                                    </p>
                                    {message.llmSource && (
                                      <Badge variant="outline" className="text-xs">
                                        {message.llmSource}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {isGenerating && currentResponse && (
                              <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 rounded-lg bg-white border">
                                  <p className="text-sm">{currentResponse}</p>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Absolute Zero
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>
                      
                      <div className="flex gap-2">
                        <Textarea
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Posez une question complexe nécessitant un raisonnement avancé..."
                          className="flex-1"
                          rows={2}
                          disabled={connectionStatus !== 'connected' || databaseStatus !== 'connected'}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!chatInput.trim() || connectionStatus !== 'connected' || isGenerating}
                          size="sm"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-md p-4">
                      <h4 className="font-medium mb-2">Capacités Avancées</h4>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        <li>Raisonnement multi-étapes avec chaînage logique</li>
                        <li>Accès à la mémoire partagée des documents</li>
                        <li>Intégration avec Jarvis et OpenACI</li>
                        <li>Analyse contextuelle approfondie</li>
                        <li>Génération de preuves et vérification</li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="connections" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Absolute Zero Reasoner</h4>
                          <Badge variant={connectionStatus === 'connected' ? "default" : "destructive"}>
                            {connectionStatus === 'connected' ? "Connecté" : "Déconnecté"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Système de raisonnement automatique</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Jarvis</h4>
                          <Badge variant="secondary">En attente</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Assistant vocal intelligent</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">OpenACI</h4>
                          <Badge variant="secondary">En attente</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Contrôle d'interface automatisé</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50/50 rounded-md p-4">
                      <h4 className="font-medium mb-2">Synchronisation</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Tous les LLMs partagent la même base de connaissances et peuvent collaborer
                      </p>
                      <Button size="sm" variant="outline">
                        Configurer la synchronisation
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="memory" className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Upload de Documents</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.txt,.doc,.docx,.md"
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                          className="flex-1"
                        />
                        <Button disabled={uploadingFile} size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          {uploadingFile ? 'Upload...' : 'Upload'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Formats supportés: PDF, TXT, DOC, DOCX, MD
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Documents en Mémoire ({memoryDocuments.length})</h4>
                      {memoryDocuments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          Aucun document uploadé
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {memoryDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <div>
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(doc.size / 1024).toFixed(1)} KB • {doc.uploadDate.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={
                                doc.status === 'ready' ? 'default' : 
                                doc.status === 'processing' ? 'secondary' : 'destructive'
                              }>
                                {doc.status === 'ready' ? 'Prêt' : 
                                 doc.status === 'processing' ? 'Traitement...' : 'Erreur'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Database Section */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Base de Données Mémoire</CardTitle>
                  <CardDescription>Mémoire partagée pour tous les LLMs</CardDescription>
                </div>
                <Database className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Status de la Mémoire</Label>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      databaseStatus === 'connected' ? 'bg-green-500' : 
                      databaseStatus === 'connecting' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm capitalize">{databaseStatus}</span>
                  </div>
                </div>
                
                {databaseStatus !== 'connected' && (
                  <Button onClick={handleConnectDatabase} disabled={databaseStatus === 'connecting'}>
                    {databaseStatus === 'connecting' ? 'Connexion...' : 'Connecter la Mémoire'}
                  </Button>
                )}
              </div>
              
              {databaseStatus === 'connected' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="query">Requête Mémoire</Label>
                    <Textarea 
                      id="query" 
                      placeholder="SELECT * FROM llm_interactions WHERE source='Absolute Zero';" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="font-mono"
                      rows={4}
                    />
                  </div>
                  
                  <Button onClick={handleExecuteQuery} disabled={!query.trim()}>
                    Interroger la Mémoire
                  </Button>
                  
                  {results && (
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-2">Résultats</h4>
                      <div className="rounded-md border overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted/50">
                            <tr>
                              {Object.keys(results.rows[0]).map((key) => (
                                <th key={key} className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-background divide-y divide-border">
                            {results.rows.map((row: any, i: number) => (
                              <tr key={i}>
                                {Object.values(row).map((value: any, j: number) => (
                                  <td key={j} className="px-3 py-2 text-sm">
                                    {value.toString()}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Exécuté en {results.executionTime}
                      </p>
                    </div>
                  )}
                </>
              )}
              
              <div className="bg-green-50/50 rounded-md p-3 mt-4">
                <h5 className="text-sm font-medium mb-1">Statistiques Mémoire:</h5>
                <ul className="text-xs space-y-1">
                  <li>• Documents: {memoryDocuments.filter(d => d.status === 'ready').length}</li>
                  <li>• Conversations: {chatMessages.length}</li>
                  <li>• LLMs connectés: {connectionStatus === 'connected' ? 1 : 0}/3</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced LLM Integration Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hub d'Intégration IA Unifiée</CardTitle>
                  <CardDescription>Orchestration centralisée des systèmes IA avec mémoire partagée</CardDescription>
                </div>
                <Server className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="model">Système IA Actif</Label>
                  <select 
                    id="model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="absolute-zero">Absolute Zero Reasoner</option>
                    <option value="jarvis">Jarvis</option>
                    <option value="openaci">OpenACI</option>
                    <option value="unified">Mode Unifié</option>
                  </select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="prompt">Commande Multi-IA</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="prompt" 
                      placeholder="Analysez ce document avec raisonnement avancé et préparez une synthèse vocale..." 
                      className="flex-1"
                    />
                    <Button>Exécuter</Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-md p-4 min-h-[200px]">
                <h4 className="font-medium mb-2">Réponse du Hub IA</h4>
                <p className="italic text-muted-foreground text-sm mb-4">
                  Le hub d'intégration permet aux trois systèmes IA (Absolute Zero, Jarvis, OpenACI) de collaborer 
                  en utilisant la mémoire partagée pour des tâches complexes nécessitant raisonnement, vocal et contrôle système.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background/50 border rounded-md p-3">
                    <h5 className="text-sm font-medium mb-2 text-blue-600">Absolute Zero</h5>
                    <ul className="text-xs space-y-1">
                      <li>• Raisonnement logique complexe</li>
                      <li>• Analyse de documents</li>
                      <li>• Génération de preuves</li>
                    </ul>
                  </div>
                  
                  <div className="bg-background/50 border rounded-md p-3">
                    <h5 className="text-sm font-medium mb-2 text-green-600">Jarvis</h5>
                    <ul className="text-xs space-y-1">
                      <li>• Interface vocale</li>
                      <li>• Synthèse speech</li>
                      <li>• Commandes audio</li>
                    </ul>
                  </div>
                  
                  <div className="bg-background/50 border rounded-md p-3">
                    <h5 className="text-sm font-medium mb-2 text-purple-600">OpenACI</h5>
                    <ul className="text-xs space-y-1">
                      <li>• Contrôle PC</li>
                      <li>• Automation UI</li>
                      <li>• Gestion applications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-xs text-muted-foreground">
                Mémoire partagée: {memoryDocuments.filter(d => d.status === 'ready').length} documents • 
                Status: {databaseStatus}
              </div>
              <Button variant="outline" size="sm">
                Configuration Avancée
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GitDatabasePage;

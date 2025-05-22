
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, GitBranch, GitFork, Server } from "lucide-react";

const GitDatabasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bolt');
  const [databaseStatus, setDatabaseStatus] = useState('disconnected');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('gemma:7b');

  const handleConnectDatabase = () => {
    // Simulation of database connection
    setDatabaseStatus('connecting');
    setTimeout(() => {
      setDatabaseStatus('connected');
    }, 1500);
  };

  const handleExecuteQuery = () => {
    if (!query.trim()) return;
    
    // Simulate query execution
    const sampleResults = {
      status: 'success',
      rows: [
        { id: 1, name: 'Project A', status: 'Active' },
        { id: 2, name: 'Project B', status: 'Complete' },
        { id: 3, name: 'Project C', status: 'Pending' }
      ],
      executionTime: '0.023s'
    };
    
    setResults(sampleResults);
  };

  return (
    <div className="container py-4 min-h-full">
      <h1 className="text-3xl font-bold mb-6">Intégration Git & Base de Données</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
        {/* Git Repositories Section */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dépôts Git</CardTitle>
                  <CardDescription>Intégration avec les dépôts Git sélectionnés</CardDescription>
                </div>
                <GitBranch className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="bolt">Bolt.new</TabsTrigger>
                  <TabsTrigger value="zero">Absolute-Zero-Reasoner</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[400px]">
                  <TabsContent value="bolt" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Bolt.new</h3>
                        <p className="text-sm text-muted-foreground">
                          Un projet Stackblitz pour le développement web en temps réel
                        </p>
                      </div>
                      <a 
                        href="https://github.com/stackblitz/bolt.new.git" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <GitFork className="mr-1 h-4 w-4" />
                        Voir sur GitHub
                      </a>
                    </div>

                    <div className="rounded-md border p-4">
                      <div className="font-mono text-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <GitBranch className="h-4 w-4" />
                          <span className="font-semibold">main</span>
                        </div>
                        <p>Plateforme de développement web en ligne</p>
                        <p>Technologies: React, TypeScript, Vite</p>
                        <div className="mt-3 pt-3 border-t">
                          <p className="font-semibold">Intégration BDD</p>
                          <p>Status: {databaseStatus === 'connected' ? 'Connecté' : 'Non connecté'}</p>
                          {databaseStatus !== 'connected' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleConnectDatabase}
                              disabled={databaseStatus === 'connecting'}
                              className="mt-2"
                            >
                              {databaseStatus === 'connecting' ? 'Connexion...' : 'Connecter à la BDD'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Repository details for Bolt */}
                    <div className="bg-muted/50 rounded-md p-4">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm">
                        Bolt.new est un projet de Stackblitz qui permet de créer rapidement des environnements 
                        de développement web en ligne. Il s'intègre avec diverses technologies front-end et 
                        peut se connecter à des bases de données pour des projets fullstack.
                      </p>
                      
                      <h4 className="font-medium mt-4 mb-2">Fonctionnalités</h4>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        <li>Environnement de développement en ligne</li>
                        <li>Support pour React, Vue, Angular, etc.</li>
                        <li>Intégration avec GitHub</li>
                        <li>Partage de projets facilité</li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="zero" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Absolute Zero Reasoner</h3>
                        <p className="text-sm text-muted-foreground">
                          Un projet de raisonnement automatique par LeapLab THU
                        </p>
                      </div>
                      <a 
                        href="https://github.com/LeapLabTHU/Absolute-Zero-Reasoner.git" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <GitFork className="mr-1 h-4 w-4" />
                        Voir sur GitHub
                      </a>
                    </div>

                    <div className="rounded-md border p-4">
                      <div className="font-mono text-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <GitBranch className="h-4 w-4" />
                          <span className="font-semibold">main</span>
                        </div>
                        <p>Framework de raisonnement IA</p>
                        <p>Technologies: Python, PyTorch, Transformers</p>
                        <div className="mt-3 pt-3 border-t">
                          <p className="font-semibold">Intégration BDD</p>
                          <p>Status: {databaseStatus === 'connected' ? 'Connecté' : 'Non connecté'}</p>
                          {databaseStatus !== 'connected' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleConnectDatabase}
                              disabled={databaseStatus === 'connecting'}
                              className="mt-2"
                            >
                              {databaseStatus === 'connecting' ? 'Connexion...' : 'Connecter à la BDD'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Repository details for Absolute-Zero */}
                    <div className="bg-muted/50 rounded-md p-4">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm">
                        Absolute-Zero-Reasoner est un framework développé par LeapLab THU qui se concentre 
                        sur l'amélioration des capacités de raisonnement des modèles d'IA. Il implémente 
                        diverses techniques avancées pour le raisonnement automatique.
                      </p>
                      
                      <h4 className="font-medium mt-4 mb-2">Fonctionnalités</h4>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        <li>Techniques de raisonnement avancées pour LLMs</li>
                        <li>Benchmarks et évaluation de performances</li>
                        <li>Intégration avec des modèles populaires</li>
                        <li>Support pour l'entraînement et l'inférence</li>
                      </ul>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Database Section */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Base de Données</CardTitle>
                  <CardDescription>Exécuter des requêtes et visualiser les résultats</CardDescription>
                </div>
                <Database className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Status</Label>
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
                    {databaseStatus === 'connecting' ? 'Connexion...' : 'Connecter'}
                  </Button>
                )}
              </div>
              
              {databaseStatus === 'connected' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="query">Requête SQL</Label>
                    <Textarea 
                      id="query" 
                      placeholder="SELECT * FROM projects;" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="font-mono"
                      rows={4}
                    />
                  </div>
                  
                  <Button onClick={handleExecuteQuery} disabled={!query.trim()}>
                    Exécuter la requête
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
            </CardContent>
          </Card>
        </div>
        
        {/* LLM Integration Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Intégration LLM</CardTitle>
                  <CardDescription>Connectez les dépôts Git et la base de données avec des modèles d'IA</CardDescription>
                </div>
                <Server className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="model">Modèle LLM</Label>
                  <select 
                    id="model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="gemma:7b">Gemma 7B</option>
                    <option value="llama3">Llama 3</option>
                    <option value="mistral">Mistral</option>
                    <option value="phi-3:mini">Phi-3 Mini</option>
                  </select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="prompt">Commande ou Requête</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="prompt" 
                      placeholder="Analyse les données du projet et génère un rapport..." 
                      className="flex-1"
                    />
                    <Button>Envoyer</Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-md p-4 min-h-[200px]">
                <h4 className="font-medium mb-2">Réponse du LLM</h4>
                <p className="italic text-muted-foreground text-sm">
                  L'intégration avec {selectedModel} permettra d'analyser les données du projet et de générer des insights basés sur le contenu des dépôts Git et de la base de données.
                </p>
                
                <div className="bg-background/50 border rounded-md p-3 mt-4">
                  <h5 className="text-sm font-medium mb-1">Exemples d'utilisation:</h5>
                  <ul className="text-xs space-y-1 ml-5 list-disc">
                    <li>Générer de la documentation pour le code des dépôts</li>
                    <li>Analyser les tendances dans les données de la base de données</li>
                    <li>Répondre à des questions sur l'architecture du projet</li>
                    <li>Suggérer des optimisations basées sur le code et les données</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-xs text-muted-foreground">
                Référence: <a href="https://fr.python-3.com/?p=3048" target="_blank" rel="noopener noreferrer" className="underline">Python 3 Documentation</a>
              </div>
              <Button variant="outline" size="sm">
                Documentation complète
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GitDatabasePage;


import React, { useState } from 'react';
import BioMCPPanel from '../components/mcp/BioMCPPanel';
import ApifyMCPPanel from '../components/mcp/apify/ApifyMCPPanel';
import MCPAgentAssistant from '../components/mcp/MCPAgentAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, Globe, Zap } from 'lucide-react';

const MCPPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agent');
  
  return (
    <div className="container py-4 min-h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">MCP - Model Context Protocol</h1>
            <p className="text-muted-foreground">Protocole avancé pour l'interaction intelligente avec des modèles spécialisés</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Agent AI</span>
                <Badge variant="outline">Intelligence</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Assistant intelligent intégré</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                <span className="font-medium">BioMCP</span>
                <Badge variant="secondary">Actif</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Analyse biomédicale avancée</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span className="font-medium">ApifyMCP</span>
                <Badge variant="secondary">Actif</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Automatisation web intelligente</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
        <TabsList className="grid grid-cols-3 mb-4 w-full md:w-[600px]">
          <TabsTrigger value="agent">Agent AI</TabsTrigger>
          <TabsTrigger value="bio">BioMCP</TabsTrigger>
          <TabsTrigger value="apify">ApifyMCP</TabsTrigger>
        </TabsList>
        
        <div className="mb-20">
          <ScrollArea className="h-full pr-4">
            <TabsContent value="agent" className="mt-0">
              <MCPAgentAssistant />
            </TabsContent>
            
            <TabsContent value="bio" className="mt-0">
              <BioMCPPanel />
            </TabsContent>
            
            <TabsContent value="apify" className="mt-0">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      ApifyMCP - Automatisation Web Intelligente
                    </CardTitle>
                    <CardDescription>
                      Système d'automatisation web avancé utilisant le protocole MCP pour des interactions intelligentes avec les services Apify
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Capacités Avancées
                        </h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Web Scraping</Badge>
                            <span className="text-sm">Sites dynamiques et statiques</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Extraction</Badge>
                            <span className="text-sm">Données structurées intelligentes</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Automation</Badge>
                            <span className="text-sm">Workflows complexes adaptatifs</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          Intégrations IA
                        </h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Smart Analysis</Badge>
                            <span className="text-sm">Analyse contextuelle</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Auto-optimization</Badge>
                            <span className="text-sm">Optimisation adaptative</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Pattern Recognition</Badge>
                            <span className="text-sm">Reconnaissance de motifs</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <ApifyMCPPanel />
              </div>
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
};

export default MCPPage;

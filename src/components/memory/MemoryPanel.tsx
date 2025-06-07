
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Search, Trash2, BarChart3 } from 'lucide-react';
import { useMemory } from '@/contexts/MemoryContext';
import { MemorySearchResult } from '@/types/memory';

const MemoryPanel: React.FC = () => {
  const memory = useMemory();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemorySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await memory.searchMemory({
        text: searchQuery,
        limit: 10,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const stats = memory.getMemoryStats();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conversation': return 'bg-blue-100 text-blue-800';
      case 'knowledge': return 'bg-green-100 text-green-800';
      case 'context': return 'bg-gray-100 text-gray-800';
      case 'user_preference': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-600" />
          Système de Mémoire RAG
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="search" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="entries">Entrées</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Rechercher dans la mémoire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                size="sm"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div key={result.entry.id} className="p-3 border rounded-lg text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex space-x-2">
                        <Badge className={getTypeColor(result.entry.metadata.type)}>
                          {result.entry.metadata.type}
                        </Badge>
                        <Badge variant="outline">
                          {result.entry.metadata.source}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(result.similarity * 100).toFixed(1)}% similarité
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-1">
                      {result.entry.content}
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{formatDate(result.entry.metadata.timestamp)}</span>
                      <span>Importance: {result.entry.metadata.importance}/10</span>
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun résultat trouvé
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="entries" className="space-y-3">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {memory.entries.slice(0, 20).map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex space-x-2">
                        <Badge className={getTypeColor(entry.metadata.type)}>
                          {entry.metadata.type}
                        </Badge>
                        <Badge variant="outline">
                          {entry.metadata.source}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.metadata.importance}/10
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-1">
                      {entry.content}
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{formatDate(entry.metadata.timestamp)}</span>
                      <div className="flex space-x-1">
                        {entry.metadata.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{stats.totalEntries}</div>
                  <p className="text-xs text-muted-foreground">entrées</p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Par type</h4>
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center text-sm">
                    <Badge className={getTypeColor(type)}>{type}</Badge>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Par source</h4>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {Object.entries(stats.bySource).map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center text-sm">
                      <span className="truncate">{source}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button 
              onClick={memory.clearMemory} 
              variant="destructive" 
              size="sm"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vider la mémoire
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MemoryPanel;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Trash2, 
  BarChart3, 
  Zap, 
  Timer, 
  HardDrive,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { mcpCache } from '@/services/mcp/cache/MCPCacheService';
import { useToast } from "@/hooks/use-toast";

const MCPCachePanel: React.FC = () => {
  const [stats, setStats] = useState(mcpCache.getStats());
  const [entries, setEntries] = useState(mcpCache.getEntries());
  const { toast } = useToast();

  const refreshData = () => {
    setStats(mcpCache.getStats());
    setEntries(mcpCache.getEntries());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    mcpCache.clear();
    refreshData();
    toast({
      title: "Cache vidé",
      description: "Toutes les entrées du cache ont été supprimées",
    });
  };

  const handleInvalidatePattern = (pattern: string) => {
    const count = mcpCache.invalidate(pattern);
    refreshData();
    toast({
      title: "Cache invalidé",
      description: `${count} entrées supprimées pour le pattern "${pattern}"`,
    });
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getHitRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            Cache Intelligent MCP
          </CardTitle>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="stats" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="entries">Entrées</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            {/* Performance Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Taux de succès
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`text-2xl font-bold ${getHitRateColor(stats.hitRate)}`}>
                    {stats.hitRate}%
                  </div>
                  <Progress value={stats.hitRate} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalHits} hits / {stats.totalHits + stats.totalMisses} requêtes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Utilisation mémoire
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">
                    {formatBytes(stats.memoryUsage)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalEntries} entrées actives
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-700">{stats.totalHits}</div>
                <div className="text-xs text-green-600">Cache Hits</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-semibold text-red-700">{stats.totalMisses}</div>
                <div className="text-xs text-red-600">Cache Misses</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">{stats.totalEntries}</div>
                <div className="text-xs text-blue-600">Entrées</div>
              </div>
            </div>

            {/* Performance Impact */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Impact sur les performances</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Réduction temps de réponse:</span>
                  <Badge variant="secondary">
                    ~{Math.round(stats.hitRate * 0.6)}%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Économie de bande passante:</span>
                  <Badge variant="secondary">
                    ~{formatBytes(stats.totalHits * 1024)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="space-y-3">
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div key={index} className="p-3 border rounded-lg text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium truncate max-w-[200px]">
                        {entry.key.split(':')[0]}
                      </div>
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {entry.accessCount} accès
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formatBytes(entry.size)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Âge: {formatDuration(entry.age)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInvalidatePattern(entry.key.split(':')[0])}
                        className="h-6 px-2"
                      >
                        Invalider
                      </Button>
                    </div>
                  </div>
                ))}
                {entries.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune entrée dans le cache
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Button 
                    onClick={handleClearCache}
                    variant="destructive" 
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider tout le cache
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleInvalidatePattern('apify')}
                      variant="outline" 
                      size="sm"
                    >
                      Invalider Apify
                    </Button>
                    <Button 
                      onClick={() => handleInvalidatePattern('biomcp')}
                      variant="outline" 
                      size="sm"
                    >
                      Invalider BioMCP
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>TTL par défaut:</span>
                    <Badge variant="outline">5 minutes</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taille max cache:</span>
                    <Badge variant="outline">1000 entrées</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Stratégie d'éviction:</span>
                    <Badge variant="outline">LRU</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MCPCachePanel;
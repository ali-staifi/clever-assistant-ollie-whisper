
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Send, Cpu, Brain, Settings } from 'lucide-react';
import { useMemoryContext } from '@/hooks/useMemoryContext';

interface CommandMessage {
  id: string;
  type: 'user' | 'system' | 'azr' | 'agents';
  content: string;
  timestamp: Date;
  status?: 'success' | 'error' | 'processing';
}

interface AdvancedCommandChatProps {
  onAZRCommand: (command: string) => void;
  onAgentSCommand: (command: string) => void;
  onSystemCommand: (command: string) => void;
  systemStatus: {
    azrActive: boolean;
    agentSActive: boolean;
    processCount: number;
  };
}

const AdvancedCommandChat: React.FC<AdvancedCommandChatProps> = ({
  onAZRCommand,
  onAgentSCommand,
  onSystemCommand,
  systemStatus
}) => {
  const [messages, setMessages] = useState<CommandMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Système de commande AZR + Agent S initialisé. Tapez "help" pour voir les commandes disponibles.',
      timestamp: new Date(),
      status: 'success'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const memoryContext = useMemoryContext('AdvancedCommandChat');

  const commands = {
    // Commandes AZR
    'azr:start': 'Démarre le système AZR',
    'azr:stop': 'Arrête le système AZR',
    'azr:generate': 'Génère une nouvelle tâche',
    'azr:optimize': 'Lance l\'auto-optimisation',
    'azr:status': 'Affiche le statut d\'AZR',
    
    // Commandes Agent S
    'agents:start': 'Active l\'orchestrateur Agent S',
    'agents:stop': 'Désactive Agent S',
    'agents:optimize': 'Optimise la distribution des moteurs',
    'agents:status': 'Affiche les métriques des moteurs',
    'agents:switch': 'Change de moteur d\'exécution',
    
    // Commandes système
    'system:status': 'Affiche l\'état global du système',
    'system:memory': 'Affiche les statistiques mémoire',
    'system:reset': 'Remet à zéro tous les systèmes',
    'help': 'Affiche cette aide'
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (type: CommandMessage['type'], content: string, status?: CommandMessage['status']) => {
    const newMessage: CommandMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      status
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processCommand = async (command: string) => {
    const trimmedCommand = command.trim().toLowerCase();
    
    // Ajouter à l'historique
    setCommandHistory(prev => [...prev, command]);
    
    // Log dans la mémoire contextuelle
    await memoryContext.addContextualMemory(
      `Commande exécutée: ${command}`,
      'context',
      6,
      ['command', 'chat', 'user-interaction']
    );

    addMessage('user', command);

    // Traitement des commandes
    if (trimmedCommand === 'help') {
      const helpText = Object.entries(commands)
        .map(([cmd, desc]) => `${cmd}: ${desc}`)
        .join('\n');
      addMessage('system', helpText, 'success');
      return;
    }

    if (trimmedCommand.startsWith('azr:')) {
      addMessage('azr', `Exécution de la commande AZR: ${trimmedCommand}`, 'processing');
      onAZRCommand(trimmedCommand);
      
      setTimeout(() => {
        addMessage('azr', `Commande ${trimmedCommand} exécutée avec succès`, 'success');
      }, 1000);
      return;
    }

    if (trimmedCommand.startsWith('agents:')) {
      addMessage('agents', `Exécution de la commande Agent S: ${trimmedCommand}`, 'processing');
      onAgentSCommand(trimmedCommand);
      
      setTimeout(() => {
        addMessage('agents', `Commande ${trimmedCommand} exécutée avec succès`, 'success');
      }, 1000);
      return;
    }

    if (trimmedCommand.startsWith('system:')) {
      addMessage('system', `Exécution de la commande système: ${trimmedCommand}`, 'processing');
      onSystemCommand(trimmedCommand);
      
      if (trimmedCommand === 'system:status') {
        const statusText = `
AZR: ${systemStatus.azrActive ? 'Actif' : 'Inactif'}
Agent S: ${systemStatus.agentSActive ? 'Actif' : 'Inactif'}
Processus en cours: ${systemStatus.processCount}
        `;
        setTimeout(() => {
          addMessage('system', statusText, 'success');
        }, 500);
      }
      return;
    }

    // Commande non reconnue
    addMessage('system', `Commande non reconnue: ${command}. Tapez "help" pour voir les commandes disponibles.`, 'error');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      processCommand(inputValue);
      setInputValue('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const getMessageIcon = (type: CommandMessage['type']) => {
    switch (type) {
      case 'user': return <Terminal className="h-4 w-4" />;
      case 'azr': return <Brain className="h-4 w-4" />;
      case 'agents': return <Cpu className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
    }
  };

  const getMessageColor = (type: CommandMessage['type']) => {
    switch (type) {
      case 'user': return 'text-blue-400';
      case 'azr': return 'text-purple-400';
      case 'agents': return 'text-green-400';
      case 'system': return 'text-yellow-400';
    }
  };

  const getStatusBadge = (status?: CommandMessage['status']) => {
    if (!status) return null;
    
    const colors = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800'
    };
    
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Terminal className="h-5 w-5 mr-2 text-green-600" />
          Chat de Commande Avancé - AZR + Agent S
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Zone de messages */}
        <ScrollArea className="h-64 border rounded-lg bg-black/90 text-green-400 font-mono text-sm">
          <div ref={scrollRef} className="p-3 space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-2">
                <span className={getMessageColor(message.type)}>
                  {getMessageIcon(message.type)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">
                      [{message.timestamp.toLocaleTimeString()}]
                    </span>
                    <span className={`text-xs ${getMessageColor(message.type)}`}>
                      {message.type.toUpperCase()}
                    </span>
                    {getStatusBadge(message.status)}
                  </div>
                  <div className="text-green-300 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Zone de saisie */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez une commande... (ex: azr:start, agents:status, help)"
            className="flex-1 font-mono bg-black/90 text-green-400 border-green-600"
          />
          <Button type="submit" size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Indicateurs de statut */}
        <div className="flex gap-2 text-xs">
          <Badge variant={systemStatus.azrActive ? "default" : "secondary"}>
            AZR: {systemStatus.azrActive ? "Actif" : "Inactif"}
          </Badge>
          <Badge variant={systemStatus.agentSActive ? "default" : "secondary"}>
            Agent S: {systemStatus.agentSActive ? "Actif" : "Inactif"}
          </Badge>
          <Badge variant="outline">
            Processus: {systemStatus.processCount}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCommandChat;

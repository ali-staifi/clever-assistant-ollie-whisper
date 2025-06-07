
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { MemoryService } from '@/services/memory/MemoryService';
import { MemoryContext as IMemoryContext, MemoryEntry } from '@/types/memory';

const MemoryContext = createContext<IMemoryContext | null>(null);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const memoryServiceRef = useRef<MemoryService | null>(null);

  useEffect(() => {
    if (!memoryServiceRef.current) {
      memoryServiceRef.current = new MemoryService();
    }
  }, []);

  const addMemory = async (content: string, metadata: Partial<MemoryEntry['metadata']>) => {
    if (memoryServiceRef.current) {
      await memoryServiceRef.current.addMemory(content, metadata);
    }
  };

  const searchMemory = async (query: Parameters<MemoryService['searchMemory']>[0]) => {
    if (memoryServiceRef.current) {
      return await memoryServiceRef.current.searchMemory(query);
    }
    return [];
  };

  const getRelevantContext = async (query: string, source?: string) => {
    if (memoryServiceRef.current) {
      return await memoryServiceRef.current.getRelevantContext(query, source);
    }
    return "Service de mémoire non disponible.";
  };

  const clearMemory = () => {
    if (memoryServiceRef.current) {
      memoryServiceRef.current.clearMemory();
    }
  };

  const getMemoryStats = () => {
    if (memoryServiceRef.current) {
      return memoryServiceRef.current.getMemoryStats();
    }
    return { totalEntries: 0, byType: {}, bySource: {} };
  };

  const value: IMemoryContext = {
    entries: memoryServiceRef.current?.getEntries() || [],
    addMemory,
    searchMemory,
    getRelevantContext,
    clearMemory,
    getMemoryStats,
  };

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = (): IMemoryContext => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};


import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMemory } from '@/contexts/MemoryContext';

export const useMemoryContext = (pageName: string) => {
  const memory = useMemory();
  const location = useLocation();

  // Auto-track page visits
  useEffect(() => {
    memory.addMemory(`Utilisateur a visité la page ${pageName}`, {
      type: 'context',
      source: pageName,
      tags: ['navigation', 'page-visit'],
      importance: 3,
    });
  }, [location.pathname, pageName, memory]);

  // Helper to add contextual memory with page source
  const addContextualMemory = async (
    content: string, 
    type: 'conversation' | 'knowledge' | 'context' | 'user_preference' = 'context',
    importance: number = 5,
    tags: string[] = []
  ) => {
    await memory.addMemory(content, {
      type,
      source: pageName,
      importance,
      tags: [...tags, pageName],
    });
  };

  // Helper to get relevant context for current page
  const getPageContext = async (query: string) => {
    return await memory.getRelevantContext(query, pageName);
  };

  // Helper to search memory specific to current page
  const searchPageMemory = async (query: string, limit: number = 5) => {
    return await memory.searchMemory({
      text: query,
      source: pageName,
      limit,
    });
  };

  return {
    ...memory,
    addContextualMemory,
    getPageContext,
    searchPageMemory,
  };
};

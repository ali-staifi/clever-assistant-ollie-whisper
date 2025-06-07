
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LumenSession, KnowledgeEntry } from '../types';

interface AnalyticsPanelProps {
  sessions: LumenSession[];
  knowledgeBase: KnowledgeEntry[];
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ sessions, knowledgeBase }) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sessions totales</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Concepts appris</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{knowledgeBase.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Répartition des sessions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {['reasoning', 'analysis', 'learning', 'planning'].map(type => {
              const count = sessions.filter(s => s.type === type).length;
              const percentage = sessions.length > 0 ? (count / sessions.length * 100).toFixed(1) : 0;
              return (
                <div key={type} className="flex justify-between text-xs">
                  <span className="capitalize">{type}</span>
                  <span>{count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;

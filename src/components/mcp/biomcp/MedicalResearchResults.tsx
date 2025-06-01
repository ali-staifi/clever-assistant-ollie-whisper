
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Activity, Pill, BookOpen, Clock, Target, AlertTriangle } from 'lucide-react';

interface MedicalResearchResultsProps {
  result: any;
}

const MedicalResearchResults: React.FC<MedicalResearchResultsProps> = ({ result }) => {
  if (!result) return null;

  if (result.error) {
    return (
      <Card className="mt-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{result.error}</p>
        </CardContent>
      </Card>
    );
  }

  const { protocols = [], medications = [], guidelines = [], pathology, researchType, query } = result;

  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            Résultats de recherche médicale
          </CardTitle>
          <CardDescription>
            <div className="space-y-1">
              <div><span className="font-medium">Pathologie:</span> {pathology}</div>
              <div><span className="font-medium">Type de recherche:</span> {researchType}</div>
              <div><span className="font-medium">Requête:</span> {query}</div>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      {protocols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              Protocoles de soins ({protocols.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {protocols.map((protocol: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{protocol.name}</h4>
                    {protocol.phase && (
                      <Badge variant="outline">{protocol.phase}</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {protocol.indication && (
                      <div>
                        <span className="font-medium text-gray-600">Indication:</span>
                        <p>{protocol.indication}</p>
                      </div>
                    )}
                    
                    {protocol.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="font-medium text-gray-600">Durée:</span>
                        <span className="ml-1">{protocol.duration}</span>
                      </div>
                    )}
                    
                    {protocol.treatment && (
                      <div>
                        <span className="font-medium text-gray-600">Traitement:</span>
                        <p>{protocol.treatment}</p>
                      </div>
                    )}
                    
                    {protocol.efficacy && (
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1 text-green-500" />
                        <span className="font-medium text-gray-600">Efficacité:</span>
                        <span className="ml-1">{protocol.efficacy}</span>
                      </div>
                    )}
                    
                    {protocol.target && (
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="font-medium text-gray-600">Objectif:</span>
                        <span className="ml-1">{protocol.target}</span>
                      </div>
                    )}
                  </div>
                  
                  {protocol.sideEffects && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-orange-600">Effets secondaires:</span>
                      <p className="text-sm text-orange-700">{protocol.sideEffects}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2 text-purple-500" />
              Médicaments et traitements ({medications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.map((medication: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-purple-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{medication.name}</h4>
                    {medication.class && (
                      <Badge variant="secondary">{medication.class}</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {medication.indication && (
                      <div>
                        <span className="font-medium text-gray-600">Indication:</span>
                        <p>{medication.indication}</p>
                      </div>
                    )}
                    
                    {medication.dosage && (
                      <div>
                        <span className="font-medium text-gray-600">Posologie:</span>
                        <p>{medication.dosage}</p>
                      </div>
                    )}
                    
                    {medication.contraindications && (
                      <div>
                        <span className="font-medium text-red-600">Contre-indications:</span>
                        <p className="text-red-700">{medication.contraindications}</p>
                      </div>
                    )}
                    
                    {medication.monitoring && (
                      <div>
                        <span className="font-medium text-blue-600">Surveillance:</span>
                        <p className="text-blue-700">{medication.monitoring}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {guidelines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
              Guidelines cliniques ({guidelines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guidelines.map((guideline: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{guideline.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{guideline.organization} - {guideline.year}</p>
                      {guideline.focus && (
                        <p className="text-sm text-orange-700 mt-1">{guideline.focus}</p>
                      )}
                    </div>
                    {guideline.url && (
                      <a 
                        href={guideline.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm ml-2"
                      >
                        Consulter
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {protocols.length === 0 && medications.length === 0 && guidelines.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-700 text-center">
              Aucun résultat trouvé pour cette recherche. Essayez de modifier votre requête ou le type de recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalResearchResults;

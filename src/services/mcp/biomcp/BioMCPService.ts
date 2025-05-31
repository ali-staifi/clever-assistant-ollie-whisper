
import { MCPRequest, MCPResponse } from '../MCPClient';
import { v4 as uuidv4 } from 'uuid';
import { GenomicAnalysisHandler } from './handlers/GenomicAnalysisHandler';
import { VariantAnnotationHandler } from './handlers/VariantAnnotationHandler';
import { PathwayAnalysisHandler } from './handlers/PathwayAnalysisHandler';
import { MedicalResearchHandler } from './handlers/MedicalResearchHandler';

/**
 * BioMCP Service - Implementation du protocole MCP pour les applications génomiques
 * Spécialisé pour la recherche en cancérologie et pneumologie
 */
export class BioMCPService {
  private genomicAnalysisHandler: GenomicAnalysisHandler;
  private variantAnnotationHandler: VariantAnnotationHandler;
  private pathwayAnalysisHandler: PathwayAnalysisHandler;
  private medicalResearchHandler: MedicalResearchHandler;

  constructor() {
    console.log('BioMCP Service initialized');
    
    // Initialize handlers
    this.genomicAnalysisHandler = new GenomicAnalysisHandler();
    this.variantAnnotationHandler = new VariantAnnotationHandler();
    this.pathwayAnalysisHandler = new PathwayAnalysisHandler();
    this.medicalResearchHandler = new MedicalResearchHandler();
  }
  
  /**
   * Traite une requête BioMCP
   */
  public async processRequest(request: MCPRequest): Promise<MCPResponse> {
    console.log('Processing BioMCP request:', request);
    
    try {
      switch (request.type) {
        case 'genomic_sequence_analysis':
          return await this.genomicAnalysisHandler.handleGenomicSequenceAnalysis(request);
        case 'variant_annotation':
          return await this.variantAnnotationHandler.handleVariantAnnotation(request);
        case 'pathway_analysis':
          return await this.pathwayAnalysisHandler.handlePathwayAnalysis(request);
        case 'medical_research':
          return await this.medicalResearchHandler.handleMedicalResearch(request);
        default:
          return this.createErrorResponse(request.id, `Unsupported BioMCP request type: ${request.type}`);
      }
    } catch (error) {
      console.error('Error processing BioMCP request:', error);
      return this.createErrorResponse(
        request.id, 
        error instanceof Error ? error.message : 'Unknown error in BioMCP service'
      );
    }
  }
  
  private createErrorResponse(requestId: string, errorMessage: string): MCPResponse {
    return {
      id: uuidv4(),
      requestId,
      status: 'error',
      content: {
        error: errorMessage
      },
      metadata: {
        timestamp: new Date().toISOString(),
        service: 'BioMCP'
      }
    };
  }
}

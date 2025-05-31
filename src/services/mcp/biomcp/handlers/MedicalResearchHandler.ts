
import { MCPRequest, MCPResponse } from '../../MCPClient';
import { v4 as uuidv4 } from 'uuid';
import { MedicalProtocolsProvider } from '../data/MedicalProtocolsProvider';
import { MedicationsProvider } from '../data/MedicationsProvider';
import { ClinicalGuidelinesProvider } from '../data/ClinicalGuidelinesProvider';

export class MedicalResearchHandler {
  private protocolsProvider: MedicalProtocolsProvider;
  private medicationsProvider: MedicationsProvider;
  private guidelinesProvider: ClinicalGuidelinesProvider;

  constructor() {
    this.protocolsProvider = new MedicalProtocolsProvider();
    this.medicationsProvider = new MedicationsProvider();
    this.guidelinesProvider = new ClinicalGuidelinesProvider();
  }

  public async handleMedicalResearch(request: MCPRequest): Promise<MCPResponse> {
    const { pathologyType, searchQuery, researchType } = request.content;
    
    if (!searchQuery) {
      throw new Error('Search query is required for medical research');
    }
    
    const result = {
      pathology: pathologyType,
      researchType,
      query: searchQuery,
      protocols: this.protocolsProvider.getMedicalProtocols(pathologyType, researchType, searchQuery),
      medications: this.medicationsProvider.getMedications(pathologyType, researchType, searchQuery),
      guidelines: this.guidelinesProvider.getClinicalGuidelines(pathologyType, searchQuery),
      timestamp: new Date().toISOString()
    };
    
    return this.createSuccessResponse(request.id, result);
  }

  private createSuccessResponse(requestId: string, content: any): MCPResponse {
    return {
      id: uuidv4(),
      requestId,
      status: 'success',
      content,
      metadata: {
        timestamp: new Date().toISOString(),
        service: 'BioMCP'
      }
    };
  }
}

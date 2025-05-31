
export class MedicalContextUtils {
  public getMedicalContext(diseaseType: string, cancerType?: string, pulmonaryCondition?: string): any {
    if (diseaseType === 'cancer' && cancerType) {
      return {
        domain: 'Oncology',
        diseaseType: 'Cancer',
        specificCondition: this.getCancerName(cancerType),
        relevantBiomarkers: this.getCancerBiomarkers(cancerType)
      };
    } else if (diseaseType === 'pulmonology' && pulmonaryCondition) {
      return {
        domain: 'Pulmonology',
        diseaseType: 'Respiratory',
        specificCondition: this.getPulmonaryConditionName(pulmonaryCondition),
        relevantBiomarkers: this.getPulmonaryBiomarkers(pulmonaryCondition)
      };
    }
    
    return {
      domain: 'General Genomics',
      diseaseType: 'Not specified',
      specificCondition: 'General analysis',
      relevantBiomarkers: []
    };
  }

  private getCancerName(cancerType: string): string {
    switch (cancerType) {
      case 'lung': return 'Cancer du poumon';
      case 'breast': return 'Cancer du sein';
      case 'colorectal': return 'Cancer colorectal';
      case 'prostate': return 'Cancer de la prostate';
      case 'melanoma': return 'Mélanome';
      default: return 'Cancer non spécifié';
    }
  }
  
  private getPulmonaryConditionName(pulmonaryCondition: string): string {
    switch (pulmonaryCondition) {
      case 'copd': return 'Bronchopneumopathie chronique obstructive (BPCO)';
      case 'asthma': return 'Asthme';
      case 'fibrosis': return 'Fibrose pulmonaire';
      case 'pneumonia': return 'Pneumonie';
      case 'tuberculosis': return 'Tuberculose';
      default: return 'Condition respiratoire non spécifiée';
    }
  }
  
  private getCancerBiomarkers(cancerType: string): string[] {
    switch (cancerType) {
      case 'lung': return ['EGFR', 'ALK', 'ROS1', 'PD-L1', 'KRAS'];
      case 'breast': return ['ER', 'PR', 'HER2', 'BRCA1/2', 'Ki-67'];
      case 'colorectal': return ['KRAS', 'NRAS', 'BRAF', 'MSI', 'MMR'];
      case 'prostate': return ['PSA', 'PSMA', 'AR-V7', 'PTEN'];
      case 'melanoma': return ['BRAF', 'NRAS', 'c-KIT', 'PD-L1'];
      default: return ['TP53', 'Ki-67', 'CEA'];
    }
  }
  
  private getPulmonaryBiomarkers(pulmonaryCondition: string): string[] {
    switch (pulmonaryCondition) {
      case 'copd': return ['Alpha-1 antitrypsin', 'Fibrinogen', 'CRP', 'TNF-alpha'];
      case 'asthma': return ['IgE', 'IL-4', 'IL-13', 'FeNO', 'Eosinophils'];
      case 'fibrosis': return ['KL-6', 'SP-A', 'SP-D', 'MMP-7', 'CCL18'];
      case 'pneumonia': return ['Procalcitonin', 'CRP', 'IL-6', 'Blood culture'];
      case 'tuberculosis': return ['IFN-gamma', 'LAM', 'TB antigen', 'Mycobacterial culture'];
      default: return ['CRP', 'ESR', 'LDH'];
    }
  }
}

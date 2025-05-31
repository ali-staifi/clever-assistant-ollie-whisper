
export class ClinicalGuidelinesProvider {
  public getClinicalGuidelines(pathologyType: string, query: string): any[] {
    const guidelines = {
      cancer: [
        {
          organization: "ESMO",
          title: "European Society for Medical Oncology Guidelines",
          year: "2023",
          url: "https://www.esmo.org/guidelines",
          focus: "Traitement des cancers solides"
        },
        {
          organization: "NCCN",
          title: "National Comprehensive Cancer Network",
          year: "2023",
          url: "https://www.nccn.org/guidelines",
          focus: "Lignes directrices thérapeutiques"
        },
        {
          organization: "INCa",
          title: "Institut National du Cancer",
          year: "2023",
          url: "https://www.e-cancer.fr",
          focus: "Recommandations françaises"
        }
      ],
      pneumology: [
        {
          organization: "GOLD",
          title: "Global Initiative for Chronic Obstructive Lung Disease",
          year: "2023",
          url: "https://goldcopd.org",
          focus: "Prise en charge BPCO"
        },
        {
          organization: "GINA",
          title: "Global Initiative for Asthma",
          year: "2023",
          url: "https://ginasthma.org",
          focus: "Gestion de l'asthme"
        },
        {
          organization: "SPLF",
          title: "Société de Pneumologie de Langue Française",
          year: "2023",
          url: "https://splf.fr",
          focus: "Recommandations françaises"
        }
      ],
      diabetes: [
        {
          organization: "ADA",
          title: "American Diabetes Association",
          year: "2023",
          url: "https://diabetes.org",
          focus: "Standards of Medical Care"
        },
        {
          organization: "EASD",
          title: "European Association for the Study of Diabetes",
          year: "2023",
          url: "https://easd.org",
          focus: "Consensus européen"
        },
        {
          organization: "SFD",
          title: "Société Francophone du Diabète",
          year: "2023",
          url: "https://sfdiabete.org",
          focus: "Recommandations françaises"
        }
      ]
    };
    
    return guidelines[pathologyType as keyof typeof guidelines] || [];
  }
}

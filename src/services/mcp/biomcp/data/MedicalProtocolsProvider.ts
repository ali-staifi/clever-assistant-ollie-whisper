
export class MedicalProtocolsProvider {
  public getMedicalProtocols(pathologyType: string, researchType: string, query: string): any[] {
    const baseProtocols = {
      cancer: [
        {
          name: "Protocole FOLFOX",
          indication: "Cancer colorectal métastatique",
          phase: "Première ligne",
          duration: "12 cycles (6 mois)",
          efficacy: "Taux de réponse: 50-60%",
          sideEffects: "Neuropathie périphérique, neutropénie"
        },
        {
          name: "Protocole AC-T",
          indication: "Cancer du sein adjuvant",
          phase: "Post-chirurgie",
          duration: "8 cycles (24 semaines)",
          efficacy: "Réduction du risque de récidive: 35%",
          sideEffects: "Alopécie, fatigue, cardiotoxicité"
        },
        {
          name: "Immunothérapie anti-PD1",
          indication: "Cancer du poumon non à petites cellules",
          phase: "Première ligne (PD-L1 >50%)",
          duration: "Jusqu'à progression",
          efficacy: "Survie globale médiane: 30 mois",
          sideEffects: "Pneumonite, colite, thyroïdite"
        }
      ],
      pneumology: [
        {
          name: "Protocole BPCO exacerbation",
          indication: "Exacerbation aiguë BPCO",
          phase: "Hospitalisation",
          duration: "5-7 jours",
          treatment: "Corticoïdes + bronchodilatateurs + O2",
          efficacy: "Amélioration symptômes: 80%"
        },
        {
          name: "Réhabilitation respiratoire",
          indication: "BPCO stable",
          phase: "Ambulatoire",
          duration: "8-12 semaines",
          treatment: "Exercice + éducation + nutrition",
          efficacy: "Amélioration qualité de vie: 70%"
        },
        {
          name: "Traitement asthme sévère",
          indication: "Asthme non contrôlé",
          phase: "Étape 5",
          duration: "Traitement continu",
          treatment: "Biothérapie anti-IgE/IL5",
          efficacy: "Réduction exacerbations: 50%"
        }
      ],
      diabetes: [
        {
          name: "Protocole diabète type 2 débutant",
          indication: "Diabète type 2 nouvellement diagnostiqué",
          phase: "Première intention",
          duration: "Traitement à vie",
          treatment: "Metformine + règles hygiéno-diététiques",
          target: "HbA1c < 7%"
        },
        {
          name: "Protocole complications diabétiques",
          indication: "Diabète avec complications",
          phase: "Traitement intensifié",
          duration: "Suivi rapproché",
          treatment: "Insuline + inhibiteurs SGLT2 + statine",
          target: "HbA1c < 6.5%, LDL < 0.7g/L"
        }
      ]
    };
    
    return baseProtocols[pathologyType as keyof typeof baseProtocols] || [];
  }
}

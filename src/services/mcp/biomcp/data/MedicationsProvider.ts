
export class MedicationsProvider {
  public getMedications(pathologyType: string, researchType: string, query: string): any[] {
    const baseMedications = {
      cancer: [
        {
          name: "Bevacizumab (Avastin)",
          class: "Anticorps monoclonal anti-VEGF",
          indication: "Cancer colorectal, poumon, rein",
          dosage: "5-15 mg/kg toutes les 2-3 semaines",
          contraindications: "Hémorragie active, chirurgie récente",
          monitoring: "TA, protéinurie, cicatrisation"
        },
        {
          name: "Pembrolizumab (Keytruda)",
          class: "Inhibiteur de checkpoint PD-1",
          indication: "Mélanome, cancer poumon, vessie",
          dosage: "200 mg toutes les 3 semaines",
          contraindications: "Maladie auto-immune active",
          monitoring: "Fonction thyroïdienne, hépatique"
        },
        {
          name: "Trastuzumab (Herceptin)",
          class: "Anticorps monoclonal anti-HER2",
          indication: "Cancer du sein HER2+",
          dosage: "6 mg/kg toutes les 3 semaines",
          contraindications: "Dysfonction cardiaque",
          monitoring: "FEVG, fonction cardiaque"
        }
      ],
      pneumology: [
        {
          name: "Tiotropium (Spiriva)",
          class: "Bronchodilatateur anticholinergique",
          indication: "BPCO",
          dosage: "18 μg/jour inhalation",
          contraindications: "Glaucome, rétention urinaire",
          monitoring: "Fonction respiratoire"
        },
        {
          name: "Fluticasone/Salmétérol (Seretide)",
          class: "Corticoïde + β2-agoniste",
          indication: "Asthme, BPCO",
          dosage: "25/250 μg 2 fois/jour",
          contraindications: "Infection respiratoire non traitée",
          monitoring: "Croissance (enfant), densité osseuse"
        },
        {
          name: "Omalizumab (Xolair)",
          class: "Anticorps monoclonal anti-IgE",
          indication: "Asthme allergique sévère",
          dosage: "Selon IgE et poids corporel",
          contraindications: "Hypersensibilité",
          monitoring: "Réaction anaphylactique"
        }
      ],
      diabetes: [
        {
          name: "Metformine",
          class: "Biguanide",
          indication: "Diabète type 2",
          dosage: "500-2000 mg/jour",
          contraindications: "Insuffisance rénale sévère",
          monitoring: "Fonction rénale, vitamine B12"
        },
        {
          name: "Empagliflozine (Jardiance)",
          class: "Inhibiteur SGLT2",
          indication: "Diabète type 2",
          dosage: "10-25 mg/jour",
          contraindications: "Acidocétose, déshydratation",
          monitoring: "Fonction rénale, infections génitales"
        },
        {
          name: "Liraglutide (Victoza)",
          class: "Agoniste GLP-1",
          indication: "Diabète type 2",
          dosage: "0.6-1.8 mg/jour SC",
          contraindications: "Pancréatite, cancer thyroïde",
          monitoring: "Poids, glycémie, lipase"
        }
      ]
    };
    
    return baseMedications[pathologyType as keyof typeof baseMedications] || [];
  }
}

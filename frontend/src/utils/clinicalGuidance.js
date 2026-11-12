export const CLINICAL_GUIDELINES = {
  "normal cases": {
    name: "Normal Cases (No Malignancy)",
    category: "Healthy Lung Parenchyma",
    riskLevel: "Low Risk",
    severity: "normal",
    color: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accent: "#10b981",
      border: "border-emerald-500",
    },
    summary:
      "No focal pulmonary nodules, ground-glass opacities, or consolidations identified. Bronchial airways, pleural surfaces, and vascular markings appear within normal limits.",
    precautions: [
      {
        title: "Avoid Active & Passive Tobacco Smoke",
        description:
          "Continued smoke-free lifestyle is the single most vital factor in maintaining long-term alveolar integrity.",
      },
      {
        title: "Minimize Environmental & Radon Exposure",
        description:
          "Test home radon levels and use protective N95 respirators in dusty or industrial occupational environments.",
      },
      {
        title: "Routine Preventative Screening",
        description:
          "Maintain standard annual physical check-ups and follow age-appropriate lung cancer screening recommendations.",
      },
      {
        title: "Maintain Aerobic Fitness",
        description:
          "Engage in regular aerobic exercises (e.g. brisk walking, cycling) to preserve cardiopulmonary reserve and vital capacity.",
      },
    ],
    nextSteps: [
      "No urgent clinical intervention needed.",
      "Schedule standard annual physical checkup.",
      "Promptly consult a physician if unexpected chronic cough, shortness of breath, or hemoptysis develops.",
    ],
  },

  "benign cases": {
    name: "Benign Pulmonary Cases",
    category: "Non-Malignant Pulmonary Lesion",
    riskLevel: "Moderate (Surveillance)",
    severity: "warning",
    color: {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      accent: "#f59e0b",
      border: "border-amber-500",
    },
    summary:
      "Focal pulmonary lesion or nodule detected exhibiting radiologic features characteristic of benign etiologies (e.g. hamartoma, calcified granuloma, or post-infectious scar tissue). No invasive architectural distortion.",
    precautions: [
      {
        title: "Surveillance Low-Dose CT Follow-up",
        description:
          "Schedule a follow-up low-dose chest CT in 6 to 12 months as per Fleischner Society guidelines to verify nodule dimensional stability.",
      },
      {
        title: "Compare with Historical Prior Scans",
        description:
          "Obtain and compare any previous chest radiographs or CT studies to calculate nodule volume doubling time.",
      },
      {
        title: "Immediate Smoking Cessation",
        description:
          "Strictly avoid all combustible and vaping products to prevent nodular inflammation and secondary oncogenic transformation.",
      },
      {
        title: "Monitor for Respiratory Infections",
        description:
          "Report persistent fevers, chest congestion, hemoptysis, or unresolving bronchial symptoms promptly.",
      },
    ],
    nextSteps: [
      "Consult a board-certified pulmonologist or thoracic specialist for nodule surveillance planning.",
      "Repeat chest imaging in 6-12 months to confirm volumetric stability.",
      "Avoid invasive biopsy unless recommended by a multidisciplinary nodule review board.",
    ],
  },

  adenocarcinoma: {
    name: "Adenocarcinoma (NSCLC)",
    category: "Malignant Neoplasm (Non-Small Cell)",
    riskLevel: "High Risk (Urgent Action)",
    severity: "danger",
    color: {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      accent: "#e11d48",
      border: "border-rose-500",
    },
    summary:
      "Radiologic findings demonstrate features indicative of pulmonary adenocarcinoma, usually originating in the peripheral glandular tissue of the lung. May manifest as ground-glass opacities, part-solid, or solid nodules with spiculation.",
    precautions: [
      {
        title: "Urgent Thoracic Oncology Evaluation",
        description:
          "Immediate referral to a dedicated thoracic oncology and surgical team for formal staging and clinical workup.",
      },
      {
        title: "Full-Body PET-CT & Brain MRI Staging",
        description:
          "Undergo 18F-FDG PET-CT and contrast brain MRI to assess anatomical TNM staging and rule out distant metastasis.",
      },
      {
        title: "Histopathological Biopsy & Biomarker Testing",
        description:
          "Obtain tissue via CT-guided core biopsy or bronchoscopy for comprehensive molecular profiling (EGFR, ALK, ROS1, KRAS, PD-L1).",
      },
      {
        title: "Strict Pulmonary Protection & Prehabilitation",
        description:
          "Eliminate all environmental irritants and begin gentle pulmonary prehabilitation to optimize baseline lung function.",
      },
    ],
    nextSteps: [
      "Expedited consultation with thoracic oncology and thoracic surgery within 5–7 days.",
      "Perform contrast PET-CT and histological tissue biopsy.",
      "Discuss personalized targeted therapy, immunotherapy, or surgical resection options with multidisciplinary tumor board.",
    ],
  },

  "large cell carcinoma": {
    name: "Large Cell Carcinoma",
    category: "Undifferentiated / Aggressive NSCLC",
    riskLevel: "Critical Risk (Immediate Workup)",
    severity: "danger",
    color: {
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      accent: "#9333ea",
      border: "border-purple-500",
    },
    summary:
      "CT features indicate a rapidly expanding, large peripheral pulmonary mass lacking specific squamous or glandular architecture. High propensity for central necrosis, vascular invasion, and early dissemination.",
    precautions: [
      {
        title: "Emergency Oncology Consultation (48-72h)",
        description:
          "Given the aggressive kinetic doubling time of large cell carcinoma, urgent multidisciplinary review is critical.",
      },
      {
        title: "Comprehensive Metastatic Survey",
        description:
          "Immediate contrast-enhanced CT of chest, abdomen, pelvis, and brain MRI to detect early occult dissemination.",
      },
      {
        title: "Core Needle Biopsy & Immunohistochemistry",
        description:
          "Expedited biopsy with immunohistochemical stains to rule out large cell neuroendocrine carcinoma (LCNEC) or lymphoma.",
      },
      {
        title: "Urgent Symptom Vigilance",
        description:
          "Seek emergency care immediately if experiencing hemoptysis (coughing up blood), sudden pleuritic chest pain, or acute dyspnea.",
      },
    ],
    nextSteps: [
      "Schedule emergency thoracic multidisciplinary oncology appointment.",
      "Conduct full systemic imaging and core biopsy.",
      "Formulate rapid systemic therapy (chemo-immunotherapy) or aggressive surgical plan.",
    ],
  },

  "squamous cell carcinoma": {
    name: "Squamous Cell Carcinoma",
    category: "Central Airway Bronchial Carcinoma",
    riskLevel: "High Risk (Airway Involvement)",
    severity: "danger",
    color: {
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      accent: "#ea580c",
      border: "border-orange-500",
    },
    summary:
      "Radiologic findings suggest centrally situated malignancy closely associated with major proximal bronchi or pulmonary hilum. Characterized by bronchial thickening, atelectasis, central cavitation, and airway luminal narrowing.",
    precautions: [
      {
        title: "Urgent Flexible Bronchoscopy & EBUS",
        description:
          "Undergo bronchoscopy with endobronchial ultrasound (EBUS) for direct airway lumen inspection and mediastinal lymph node aspiration.",
      },
      {
        title: "Mandatory Smoking Cessation",
        description:
          "Immediate cessation of all tobacco products; active smoking significantly impairs chemotherapy efficacy and increases radiation pneumonitis risk.",
      },
      {
        title: "Monitor for Airway Obstruction & Hemoptysis",
        description:
          "Close clinical observation for bronchial obstruction, stridor, post-obstructive pneumonia, or airway bleeding.",
      },
      {
        title: "Pulmonary Function Testing (PFTs)",
        description:
          "Measure FEV1 and DLCO to evaluate respiratory reserve for prospective sleeve resection or definitive chemoradiotherapy.",
      },
    ],
    nextSteps: [
      "Immediate bronchoscopy and tissue biopsy for diagnosis and mediastinal staging.",
      "Consultation with interventional pulmonology and thoracic surgical oncology.",
      "Multidisciplinary tumor board review for definitive chemoradiotherapy or airway-preserving resection.",
    ],
  },
};

export function getClinicalGuidance(prediction) {
  if (!prediction) {
    return CLINICAL_GUIDELINES["normal cases"];
  }
  const key = prediction.trim().toLowerCase();
  for (const [candidateKey, info] of Object.entries(CLINICAL_GUIDELINES)) {
    if (key.includes(candidateKey) || candidateKey.includes(key)) {
      return info;
    }
  }
  return {
    name: prediction,
    category: "Pulmonary CT Classification",
    riskLevel: "Clinical Review Required",
    severity: "warning",
    color: {
      badge: "bg-slate-50 text-slate-700 border-slate-200",
      accent: "#64748b",
      border: "border-slate-400",
    },
    summary:
      "The scan has been processed by the deep learning classifier. Please correlate the findings with patient clinical history and diagnostic laboratory studies.",
    precautions: [
      {
        title: "Qualified Radiologist Review",
        description:
          "Submit all volumetric CT slices to a licensed radiologist for comprehensive diagnostic reporting.",
      },
      {
        title: "Symptom Correlation",
        description:
          "Correlate radiological output with patient respiratory symptoms, smoking history, and prior screenings.",
      },
    ],
    nextSteps: [
      "Consult your healthcare provider or pulmonary specialist for formal interpretation.",
    ],
  };
}


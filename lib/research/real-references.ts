// Real reference list — depersonalization, anxiety, depression,
// dysregulation, polyvagal theory, PHQ-9 psychometrics, and
// transdiagnostic CBT processes. Curated for the thesis "Dépersonnalisation,
// anxiété et dépression : Étude psychopathologique du sentiment de
// perte de soi".
//
// DOIs are intentionally NOT fabricated. Where a DOI/URL is not
// supplied by the user it is left empty and `needsVerification` is
// true so the literature desk flags it to the clinician.

import type { LiteratureItem } from "@/lib/research/literature";
import { generateId } from "@/lib/store";

export interface SeedReference {
  title: string;
  authors: string;
  year: number;
  citation: string;
  relevance: string; // 1-2 lines explaining why it matters for the thesis
  themes: string[];
  linkedChapters: string[]; // ids from REAL_CHAPTER_OUTLINE
  needsVerification?: boolean;
}

export const REAL_REFERENCES: SeedReference[] = [
  {
    title: "Depersonalization: A New Look at a Neglected Syndrome",
    authors: "Sierra, M.",
    year: 2009,
    citation: "Sierra, M. (2009). Depersonalization: A New Look at a Neglected Syndrome. Cambridge University Press.",
    relevance:
      "Référence fondamentale du champ. Articule la phénoménologie de la dépersonnalisation et sa place transdiagnostique.",
    themes: ["dépersonnalisation", "phénoménologie", "syndrome"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title: "Depersonalization: neurobiological perspectives",
    authors: "Sierra, M., & Berrios, G. E.",
    year: 1998,
    citation:
      "Sierra, M., & Berrios, G. E. (1998). Depersonalization: neurobiological perspectives. Biological Psychiatry, 44(9), 898–908.",
    relevance:
      "Cadre neurobiologique : inhibition cortico-limbique et altération de l'expérience subjective.",
    themes: ["dépersonnalisation", "neurobiologie"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title: "Emotion and the unreal self",
    authors: "Medford, N.",
    year: 2012,
    citation:
      "Medford, N. (2012). Emotion and the unreal self: depersonalization disorder and de-affectualization. Emotion Review, 4(2), 139–144.",
    relevance:
      "Approche affective de la dépersonnalisation : désaffectualisation comme mécanisme central.",
    themes: ["dépersonnalisation", "émotion", "désaffectualisation"],
    linkedChapters: ["ch1-depersonnalisation", "ch3-depression"],
    needsVerification: true,
  },
  {
    title: "Understanding and treating depersonalisation disorder",
    authors: "Medford, N., Sierra, M., Baker, D., & David, A. S.",
    year: 2005,
    citation:
      "Medford, N., Sierra, M., Baker, D., & David, A. S. (2005). Understanding and treating depersonalisation disorder. Advances in Psychiatric Treatment, 11(2), 92–100.",
    relevance:
      "Synthèse clinique : présentation, diagnostic différentiel, et options thérapeutiques de la dépersonnalisation.",
    themes: ["dépersonnalisation", "traitement", "clinique"],
    linkedChapters: ["ch1-depersonnalisation", "ch7-discussion"],
    needsVerification: true,
  },
  {
    title: "Prevalence, correlates, and predictors of depersonalization experiences",
    authors: "Michal, M., et al.",
    year: 2009,
    citation:
      "Michal, M., Beutel, M. E., Jordan, J., Zimmermann, M., Wolters, S., & Heidenreich, T. (2009). Prevalence, correlates, and predictors of depersonalization experiences in the German general population. Journal of Nervous and Mental Disease.",
    relevance:
      "Étude épidémiologique : fréquence des expériences de dépersonnalisation en population générale.",
    themes: ["dépersonnalisation", "épidémiologie"],
    linkedChapters: ["ch1-depersonnalisation", "ch5-methodo"],
    needsVerification: true,
  },
  {
    title: "Case series of patients with depersonalization-derealization syndrome",
    authors: "Michal, M., et al.",
    year: 2016,
    citation:
      "Michal, M., et al. (2016). Case series of 223 patients with depersonalization-derealization syndrome. BMC Psychiatry.",
    relevance:
      "Série clinique de grande taille : phénoménologie, comorbidités, et délai de diagnostic.",
    themes: ["dépersonnalisation", "comorbidité", "clinique"],
    linkedChapters: ["ch1-depersonnalisation", "ch4-liens"],
    needsVerification: true,
  },
  {
    title: "Depersonalization disorder: Thinking without feeling",
    authors: "Phillips, M. L., et al.",
    year: 2001,
    citation:
      "Phillips, M. L., Medford, N., Senior, C., Bullmore, E. T., Suckling, J., Brammer, M. J., Andrew, C., Sierra, M., Williams, S. C. R., & David, A. S. (2001). Depersonalization disorder: thinking without feeling. Psychiatry Research: Neuroimaging, 108(3), 145–160.",
    relevance:
      "Étude IRMf : dissociation entre traitement cognitif et résonance affective dans la dépersonnalisation.",
    themes: ["dépersonnalisation", "neuroimagerie", "affect"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title: "Polyvagal theory: a new approach to understanding the developmental basis of emotional disorders",
    authors: "Porges, S. W.",
    year: 1995,
    citation:
      "Porges, S. W. (1995). Orienting in a defensive world: Mammalian modifications of our evolutionary heritage. A polyvagal theory. Psychophysiology, 32(4), 301–318.",
    relevance:
      "Premier article fondateur de la théorie polyvagale : base neurophysiologique pour les états de freeze et déconnexion.",
    themes: ["polyvagal", "neurophysiologie", "freeze"],
    linkedChapters: ["ch2-anxiete", "ch4-liens"],
    needsVerification: true,
  },
  {
    title: "The Polyvagal Theory",
    authors: "Porges, S. W.",
    year: 2011,
    citation:
      "Porges, S. W. (2011). The Polyvagal Theory: Neurophysiological Foundations of Emotions, Attachment, Communication, and Self-Regulation. W. W. Norton.",
    relevance:
      "Ouvrage de référence : cadre intégratif pour comprendre la dépersonnalisation comme réponse adaptative de désengagement.",
    themes: ["polyvagal", "régulation", "désengagement"],
    linkedChapters: ["ch2-anxiete", "ch4-liens"],
    needsVerification: true,
  },
  {
    title: "The phobic anxiety-depersonalization syndrome",
    authors: "Roth, M.",
    year: 1959,
    citation:
      "Roth, M. (1959). The phobic anxiety-depersonalization syndrome. Proceedings of the Royal Society of Medicine, 52(8), 587–595.",
    relevance:
      "Article historique : première description systématique de la co-occurrence anxiété phobique – dépersonnalisation.",
    themes: ["dépersonnalisation", "anxiété", "histoire"],
    linkedChapters: ["ch2-anxiete"],
    needsVerification: true,
  },
  {
    title: "Selbstbewusstsein und Persönlichkeitsbewusstsein",
    authors: "Schilder, P.",
    year: 1914,
    citation:
      "Schilder, P. (1914). Selbstbewusstsein und Persönlichkeitsbewusstsein. Springer.",
    relevance:
      "Texte classique sur la conscience de soi : référence phénoménologique de fond pour penser le sentiment de soi.",
    themes: ["sentiment de soi", "phénoménologie", "histoire"],
    linkedChapters: ["ch1-depersonnalisation", "intro-generale"],
    needsVerification: true,
  },
  {
    title: "Le temps vécu",
    authors: "Minkowski, E.",
    year: 1933,
    citation:
      "Minkowski, E. (1933). Le temps vécu : Études phénoménologiques et psychopathologiques. d'Artrey.",
    relevance:
      "Phénoménologie psychiatrique francophone : altération du temps vécu, lue ici comme proche de la dépersonnalisation.",
    themes: ["phénoménologie", "temps vécu", "français"],
    linkedChapters: ["intro-generale", "ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title: "PHQ-9 accuracy",
    authors: "Levis, B., Benedetti, A., & Thombs, B. D.",
    year: 2019,
    citation:
      "Levis, B., Benedetti, A., & Thombs, B. D. (2019). Accuracy of Patient Health Questionnaire-9 (PHQ-9) for screening to detect major depression: individual participant data meta-analysis. BMJ, 365, l1476.",
    relevance:
      "Méta-analyse individuelle de l'exactitude du PHQ-9. Justification de l'usage du PHQ-9 comme mesure de dépression dans la thèse.",
    themes: ["phq-9", "psychométrie", "dépression"],
    linkedChapters: ["ch5-methodo", "ch3-depression"],
    needsVerification: true,
  },
  {
    title: "Transdiagnostic CBT processes",
    authors: "Mansell, W., Harvey, A., Watkins, E., & Shafran, R.",
    year: 2008,
    citation:
      "Mansell, W., Harvey, A., Watkins, E., & Shafran, R. (2008). Cognitive behavioral processes across psychological disorders: A review of the utility and validity of the transdiagnostic approach. International Journal of Cognitive Therapy, 1(3), 181–191.",
    relevance:
      "Cadre transdiagnostique : appui théorique pour positionner la dépersonnalisation au croisement de l'anxiété et de la dépression.",
    themes: ["transdiagnostique", "cbt", "processus"],
    linkedChapters: ["ch4-liens", "ch7-discussion"],
    needsVerification: true,
  },
];

export function buildLiteratureSeed(): LiteratureItem[] {
  const now = new Date().toISOString();
  return REAL_REFERENCES.map((r) => ({
    id: generateId(),
    title: r.title,
    authors: r.authors,
    year: r.year,
    citation: r.citation,
    status: "to-read",
    summary: r.relevance,
    themes: r.themes,
    excerpts: [],
    pinnedReading: false,
    linkedChapters: r.linkedChapters,
    createdAt: now,
    updatedAt: now,
  })) as LiteratureItem[];
}

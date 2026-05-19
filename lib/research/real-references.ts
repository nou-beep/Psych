// Real reference list — 78 entries extracted verbatim from the PFE
// bibliography (Mrini, 2026). DOIs are sourced from the bibliography
// itself, not fabricated. Each entry is mapped to the chapter(s)
// where it is cited so the literature desk can group by chapter.

import type { LiteratureItem } from "@/lib/research/literature";
import { generateId } from "@/lib/store";

export interface SeedReference {
  /** APA-style display title. */
  title: string;
  authors: string;
  year: number;
  /** Full APA citation string as it appears in the bibliography. */
  citation: string;
  /** 1-2 sentence relevance note for the thesis. */
  relevance: string;
  themes: string[];
  /** ids from REAL_CHAPTER_OUTLINE that cite this reference. */
  linkedChapters: string[];
  /** DOI without the https://doi.org/ prefix. */
  doi?: string;
  /** Full URL (DOI link, publisher URL, or book ISBN page). */
  url?: string;
  /**
   * Flag for references the author still wants to double-check
   * (mostly classical books without DOIs). Defaults to false when
   * a DOI is present and confirmed in the PFE bibliography.
   */
  needsVerification?: boolean;
}

export const REAL_REFERENCES: SeedReference[] = [
  {
    title:
      "Emotion-regulation strategies across psychopathology: A meta-analytic review",
    authors: "Aldao, A., Nolen-Hoeksema, S., & Schweizer, S.",
    year: 2010,
    citation:
      "Aldao, A., Nolen-Hoeksema, S., & Schweizer, S. (2010). Emotion-regulation strategies across psychopathology: A meta-analytic review. Clinical Psychology Review, 30(2), 217–237.",
    relevance:
      "Méta-analyse fondatrice sur la dysrégulation émotionnelle comme mécanisme transdiagnostique. Pilier du chapitre 4.",
    themes: ["dysrégulation émotionnelle", "transdiagnostique", "méta-analyse"],
    linkedChapters: ["ch1-depersonnalisation", "ch4-liens"],
    doi: "10.1016/j.cpr.2009.11.004",
    url: "https://doi.org/10.1016/j.cpr.2009.11.004",
  },
  {
    title: "Diagnostic and Statistical Manual of Mental Disorders (5th ed.)",
    authors: "American Psychiatric Association",
    year: 2013,
    citation:
      "American Psychiatric Association. (2013). Diagnostic and statistical manual of mental disorders (5th ed.). American Psychiatric Publishing.",
    relevance:
      "Référence nosographique de base pour la définition du trouble dépersonnalisation-déréalisation et des troubles anxieux et dépressifs.",
    themes: ["DSM-5", "nosographie", "classification"],
    linkedChapters: [
      "ch1-depersonnalisation",
      "ch2-anxiete",
      "ch3-depression",
    ],
    needsVerification: true,
  },
  {
    title: "Depersonalisation disorder: Clinical features of 204 cases",
    authors:
      "Baker, D., Hunter, E., Lawrence, E., Medford, N., Patel, M., Senior, C., Sierra, M., Lambert, M. V., Phillips, M. L., & David, A. S.",
    year: 2003,
    citation:
      "Baker, D., Hunter, E., Lawrence, E., Medford, N., Patel, M., Senior, C., Sierra, M., Lambert, M. V., Phillips, M. L., & David, A. S. (2003). Depersonalisation disorder: Clinical features of 204 cases. British Journal of Psychiatry, 182(5), 428–433.",
    relevance:
      "Plus grande série clinique du trouble dépersonnalisation. Données de comorbidité anxieuse et dépressive citées aux chapitres 2 et 3.",
    themes: ["dépersonnalisation", "comorbidité", "épidémiologie clinique"],
    linkedChapters: [
      "ch1-depersonnalisation",
      "ch2-anxiete",
      "ch3-depression",
    ],
    doi: "10.1192/bjp.182.5.428",
    url: "https://doi.org/10.1192/bjp.182.5.428",
  },
  {
    title: "Dissociative symptoms in panic disorder",
    authors: "Ball, S. G., Robinson, A., Shekhar, A., & Walsh, K.",
    year: 1997,
    citation:
      "Ball, S. G., Robinson, A., Shekhar, A., & Walsh, K. (1997). Dissociative symptoms in panic disorder. Journal of Nervous and Mental Disease, 185(12), 755–760.",
    relevance:
      "Sensibilité intéroceptive et interprétations catastrophisantes dans la dépersonnalisation péri-panique (chapitre 2).",
    themes: ["trouble panique", "dépersonnalisation", "intéroception"],
    linkedChapters: ["ch2-anxiete"],
    doi: "10.1097/00005053-199712000-00007",
    url: "https://doi.org/10.1097/00005053-199712000-00007",
  },
  {
    title: "Depression: Clinical, experimental, and theoretical aspects",
    authors: "Beck, A. T.",
    year: 1967,
    citation:
      "Beck, A. T. (1967). Depression: Clinical, experimental, and theoretical aspects. Harper & Row.",
    relevance:
      "Texte fondateur du modèle cognitif de la dépression. Triade cognitive négative reprise au chapitre 3.",
    themes: ["dépression", "modèle cognitif", "triade cognitive"],
    linkedChapters: ["ch3-depression"],
    needsVerification: true,
  },
  {
    title: "Anxiety disorders and phobias: A cognitive perspective",
    authors: "Beck, A. T., Emery, G., & Greenberg, R. L.",
    year: 1985,
    citation:
      "Beck, A. T., Emery, G., & Greenberg, R. L. (1985). Anxiety disorders and phobias: A cognitive perspective. Basic Books.",
    relevance:
      "Modèle cognitif des troubles anxieux. Schémas de menace et biais cognitifs (§2.1.2).",
    themes: ["anxiété", "modèle cognitif", "schémas"],
    linkedChapters: ["ch2-anxiete"],
    needsVerification: true,
  },
  {
    title: "Full-body illusions and minimal phenomenal selfhood",
    authors: "Blanke, O., & Metzinger, T.",
    year: 2009,
    citation:
      "Blanke, O., & Metzinger, T. (2009). Full-body illusions and minimal phenomenal selfhood. Trends in Cognitive Sciences, 13(1), 7–13.",
    relevance:
      "Intégration multisensorielle et soi minimal incarné. Cité §1.3.2 pour la neuro-phénoménologie du sentiment de soi.",
    themes: ["sentiment de soi", "neurosciences", "phénoménologie"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1016/j.tics.2008.10.003",
    url: "https://doi.org/10.1016/j.tics.2008.10.003",
  },
  {
    title:
      "Adaptation française de l'Inventaire d'anxiété Trait-État (STAI-Y) de Spielberger",
    authors: "Bruchon-Schweitzer, M., & Paulhan, I.",
    year: 1993,
    citation:
      "Bruchon-Schweitzer, M., & Paulhan, I. (1993). Adaptation française de l'Inventaire d'anxiété Trait-État (STAI-Y) de Spielberger. ECPA.",
    relevance:
      "Version française validée du STAI-Y utilisée dans le protocole empirique (§5.3.2).",
    themes: ["STAI-Y", "validation française", "instrument"],
    linkedChapters: ["ch5-methodo"],
    needsVerification: true,
  },
  {
    title:
      "The touched self: Psychological and philosophical perspectives on proximal intersubjectivity and the self",
    authors: "Ciaunica, A., Fotopoulou, A., Prentner, R., & Quadt, L.",
    year: 2021,
    citation:
      "Ciaunica, A., Fotopoulou, A., Prentner, R., & Quadt, L. (2021). The touched self: Psychological and philosophical perspectives on proximal intersubjectivity and the self. Phenomenology and the Cognitive Sciences, 20(3), 513–535.",
    relevance:
      "Hypo-intéroception active et dépersonnalisation. Marqueur différentiel anxieux / dépressif (§4.2.1).",
    themes: ["intéroception", "phénoménologie", "sentiment de soi"],
    linkedChapters: ["ch1-depersonnalisation", "ch4-liens"],
    doi: "10.1007/s11097-020-09671-9",
    url: "https://doi.org/10.1007/s11097-020-09671-9",
  },
  {
    title: "A cognitive approach to panic",
    authors: "Clark, D. M.",
    year: 1986,
    citation:
      "Clark, D. M. (1986). A cognitive approach to panic. Behaviour Research and Therapy, 24(4), 461–470.",
    relevance:
      "Modèle cognitif du trouble panique. Étendu à la dépersonnalisation péri-panique (§2.1.2).",
    themes: ["trouble panique", "modèle cognitif"],
    linkedChapters: ["ch2-anxiete"],
    doi: "10.1016/0005-7967(86)90011-2",
    url: "https://doi.org/10.1016/0005-7967(86)90011-2",
  },
  {
    title: "Cognitive therapy of anxiety disorders: Science and practice",
    authors: "Clark, D. A., & Beck, A. T.",
    year: 2010,
    citation:
      "Clark, D. A., & Beck, A. T. (2010). Cognitive therapy of anxiety disorders: Science and practice. Guilford Press.",
    relevance:
      "Mode de traitement dépressogène et schémas autoréférentiels (§3.1.2).",
    themes: ["thérapie cognitive", "anxiété", "dépression"],
    linkedChapters: ["ch2-anxiete", "ch3-depression"],
    needsVerification: true,
  },
  {
    title: "Statistical power analysis for the behavioral sciences (2nd ed.)",
    authors: "Cohen, J.",
    year: 1988,
    citation:
      "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
    relevance:
      "Conventions d'interprétation de la taille d'effet utilisées au §5.5.2 (r = 0,10 / 0,30 / 0,50).",
    themes: ["statistiques", "taille d'effet"],
    linkedChapters: ["ch5-methodo"],
    needsVerification: true,
  },
  {
    title: "Validation française du PHQ-9",
    authors: "Cohidon, C., Luc, M., & Santin, G.",
    year: 2012,
    citation:
      "Cohidon, C., Luc, M., & Santin, G. (2012). Validation française du PHQ-9. Revue d'Épidémiologie et de Santé Publique, 60(1), 1–9.",
    relevance:
      "Validation française du PHQ-9 utilisée dans le protocole empirique (§5.3.3).",
    themes: ["PHQ-9", "validation française", "instrument"],
    linkedChapters: ["ch5-methodo"],
    needsVerification: true,
  },
  {
    title:
      "How do you feel — now? The anterior insula and human awareness",
    authors: "Craig, A. D.",
    year: 2009,
    citation:
      "Craig, A. D. (2009). How do you feel — now? The anterior insula and human awareness. Nature Reviews Neuroscience, 10(1), 59–70.",
    relevance:
      "Modèle de l'insula et de la conscience intéroceptive. Cité §1.3.3.",
    themes: ["insula", "intéroception", "conscience"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1038/nrn2555",
    url: "https://doi.org/10.1038/nrn2555",
  },
  {
    title:
      "Human cingulate cortex and autonomic control: Converging neuroimaging and clinical evidence",
    authors:
      "Critchley, H. D., Mathias, C. J., Josephs, O., O'Doherty, J., Zanini, S., Dewar, B.-K., Cipolotti, L., Shallice, T., & Dolan, R. J.",
    year: 2004,
    citation:
      "Critchley, H. D., Mathias, C. J., Josephs, O., O'Doherty, J., Zanini, S., Dewar, B.-K., Cipolotti, L., Shallice, T., & Dolan, R. J. (2004). Human cingulate cortex and autonomic control: Converging neuroimaging and clinical evidence. Brain, 127(10), 2139–2152.",
    relevance:
      "Activation de l'insula antérieure droite et conscience cardiaque chez les sujets dépersonnalisés (§1.3.3, §2.3.1).",
    themes: ["intéroception", "neuroimagerie", "insula"],
    linkedChapters: ["ch1-depersonnalisation", "ch2-anxiete"],
    doi: "10.1093/brain/awh229",
    url: "https://doi.org/10.1093/brain/awh229",
  },
  {
    title: "The amygdala: Vigilance and emotion",
    authors: "Davis, M., & Whalen, P. J.",
    year: 2001,
    citation:
      "Davis, M., & Whalen, P. J. (2001). The amygdala: Vigilance and emotion. Molecular Psychiatry, 6(1), 13–34.",
    relevance:
      "Lit de la strie terminale et anxiété anticipatoire chronique (§2.1.3).",
    themes: ["amygdale", "anxiété", "neurobiologie"],
    linkedChapters: ["ch2-anxiete"],
    doi: "10.1038/sj.mp.4000812",
    url: "https://doi.org/10.1038/sj.mp.4000812",
  },
  {
    title: "Anxiety and cognitive performance: Attentional control theory",
    authors:
      "Eysenck, M. W., Derakshan, N., Santos, R., & Calvo, M. G.",
    year: 2007,
    citation:
      "Eysenck, M. W., Derakshan, N., Santos, R., & Calvo, M. G. (2007). Anxiety and cognitive performance: Attentional control theory. Emotion, 7(2), 336–353.",
    relevance:
      "Hypervigilance attentionnelle et difficulté de désengagement. Cité §2.3.3.",
    themes: ["anxiété", "attention", "hypervigilance"],
    linkedChapters: ["ch2-anxiete"],
    doi: "10.1037/1528-3542.7.2.336",
    url: "https://doi.org/10.1037/1528-3542.7.2.336",
  },
  {
    title:
      "The role of trauma and dissociation in adult attachment patterns",
    authors: "Farber, B. A., Khurgin-Bott, R., & Feldman, S.",
    year: 2003,
    citation:
      "Farber, B. A., Khurgin-Bott, R., & Feldman, S. (2003). The role of trauma and dissociation in adult attachment patterns. Journal of Trauma & Dissociation, 4(3), 51–72.",
    relevance:
      "Lien trauma précoce / attachement insécure / vulnérabilité dissociative (§4.3.2).",
    themes: ["trauma", "attachement", "dissociation"],
    linkedChapters: ["ch4-liens"],
    doi: "10.1300/J229v04n03_04",
    url: "https://doi.org/10.1300/J229v04n03_04",
  },
  {
    title:
      "G*Power 3: A flexible statistical power analysis program for the social, behavioral, and biomedical sciences",
    authors: "Faul, F., Erdfelder, E., Lang, A.-G., & Buchner, A.",
    year: 2007,
    citation:
      "Faul, F., Erdfelder, E., Lang, A.-G., & Buchner, A. (2007). G*Power 3: A flexible statistical power analysis program for the social, behavioral, and biomedical sciences. Behavior Research Methods, 39(2), 175–191.",
    relevance:
      "Logiciel d'analyse de puissance statistique pour l'estimation de la taille d'effet et du N nécessaire (§5.6.4).",
    themes: ["puissance statistique", "G*Power", "méthodologie"],
    linkedChapters: ["ch5-methodo"],
    doi: "10.3758/BF03193146",
    url: "https://doi.org/10.3758/BF03193146",
  },
  {
    title: "A disturbance of memory on the Acropolis",
    authors: "Freud, S.",
    year: 1936,
    citation:
      "Freud, S. (1936). A disturbance of memory on the Acropolis. International Journal of Psycho-Analysis, 22, 93–101.",
    relevance:
      "Texte fondateur sur la déréalisation comme défense face à la culpabilité (§1.2.4).",
    themes: ["psychodynamique", "dépersonnalisation", "défense"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title: "The free-energy principle: A unified brain theory?",
    authors: "Friston, K.",
    year: 2010,
    citation:
      "Friston, K. (2010). The free-energy principle: A unified brain theory? Nature Reviews Neuroscience, 11(2), 127–138.",
    relevance:
      "Théorie du cerveau bayésien et modèles prédictifs intéroceptifs (§1.3.3).",
    themes: ["modèles prédictifs", "intéroception", "neurosciences"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1038/nrn2787",
    url: "https://doi.org/10.1038/nrn2787",
  },
  {
    title:
      "Simulation of dissociative symptoms: Psychopathological status and memory performance",
    authors: "Giesbrecht, T., Smeets, T., & Merckelbach, H.",
    year: 2004,
    citation:
      "Giesbrecht, T., Smeets, T., & Merckelbach, H. (2004). Simulation of dissociative symptoms: Psychopathological status and memory performance. Clinical Neuropsychiatry, 1(1), 61–67.",
    relevance:
      "Induction d'anxiété par hyperventilation et symptômes dépersonnalisation transitoires (§2.3.4).",
    themes: ["dissociation", "expérimental", "hyperventilation"],
    linkedChapters: ["ch1-depersonnalisation", "ch2-anxiete"],
    needsVerification: true,
  },
  {
    title:
      "Cognitive processes in dissociation: An analysis of core theoretical assumptions",
    authors:
      "Giesbrecht, T., Lynn, S. J., Lilienfeld, S. O., & Merckelbach, H.",
    year: 2010,
    citation:
      "Giesbrecht, T., Lynn, S. J., Lilienfeld, S. O., & Merckelbach, H. (2010). Cognitive processes in dissociation: An analysis of core theoretical assumptions. Psychological Bulletin, 136(4), 617–647.",
    relevance:
      "Anxiété-trait comme prédicteur des expériences dissociatives (§2.2.1).",
    themes: ["dissociation", "anxiété-trait", "revue"],
    linkedChapters: ["ch2-anxiete"],
    doi: "10.1037/a0020221",
    url: "https://doi.org/10.1037/a0020221",
  },
  {
    title:
      "The neural bases of emotion regulation: Reappraisal and suppression of negative emotion",
    authors: "Goldin, P. R., McRae, K., Ramel, W., & Gross, J. J.",
    year: 2008,
    citation:
      "Goldin, P. R., McRae, K., Ramel, W., & Gross, J. J. (2008). The neural bases of emotion regulation: Reappraisal and suppression of negative emotion. Biological Psychiatry, 63(6), 577–586.",
    relevance:
      "Bases neurales de la suppression émotionnelle et de la réévaluation. Cité §4.1.3.",
    themes: ["régulation émotionnelle", "neuroimagerie"],
    linkedChapters: ["ch4-liens"],
    doi: "10.1016/j.biopsych.2007.05.031",
    url: "https://doi.org/10.1016/j.biopsych.2007.05.031",
  },
  {
    title:
      "Neuroimaging and depression: Current status and unresolved issues",
    authors: "Gotlib, I. H., & Hamilton, J. P.",
    year: 2008,
    citation:
      "Gotlib, I. H., & Hamilton, J. P. (2008). Neuroimaging and depression: Current status and unresolved issues. Current Directions in Psychological Science, 17(2), 159–163.",
    relevance:
      "Synthèse neuroimagerie de la dépression mélancolique. Cité §4.1.3.",
    themes: ["dépression", "neuroimagerie"],
    linkedChapters: ["ch3-depression", "ch4-liens"],
    doi: "10.1111/j.1467-8721.2008.00567.x",
    url: "https://doi.org/10.1111/j.1467-8721.2008.00567.x",
  },
  {
    title: "Emotion regulation: Current status and future prospects",
    authors: "Gross, J. J.",
    year: 2015,
    citation:
      "Gross, J. J. (2015). Emotion regulation: Current status and future prospects. Psychological Inquiry, 26(1), 1–26.",
    relevance:
      "Cadre conceptuel de la régulation émotionnelle. Familles de stratégies (§1.3.1).",
    themes: ["régulation émotionnelle", "modèle théorique"],
    linkedChapters: ["ch1-depersonnalisation", "ch4-liens"],
    doi: "10.1080/1047840X.2014.940781",
    url: "https://doi.org/10.1080/1047840X.2014.940781",
  },
  {
    title: "Emotion regulation: Conceptual foundations",
    authors: "Gross, J. J., & Thompson, R. A.",
    year: 2007,
    citation:
      "Gross, J. J., & Thompson, R. A. (2007). Emotion regulation: Conceptual foundations. In J. J. Gross (Ed.), Handbook of emotion regulation (pp. 3–24). Guilford Press.",
    relevance:
      "Définition canonique de la régulation et de la dysrégulation émotionnelles (§1.3.1).",
    themes: ["régulation émotionnelle", "fondations conceptuelles"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title:
      "Default-mode and task-positive network activity in major depressive disorder: Implications for adaptive and maladaptive rumination",
    authors:
      "Hamilton, J. P., Furman, D. J., Chang, C., Thomason, M. E., Dennis, E., & Gotlib, I. H.",
    year: 2011,
    citation:
      "Hamilton, J. P., Furman, D. J., Chang, C., Thomason, M. E., Dennis, E., & Gotlib, I. H. (2011). Default-mode and task-positive network activity in major depressive disorder: Implications for adaptive and maladaptive rumination. Biological Psychiatry, 70(4), 327–333.",
    relevance:
      "Hyperactivité du DMN et rumination dans la dépression (§3.3.2).",
    themes: ["DMN", "dépression", "rumination"],
    linkedChapters: ["ch3-depression"],
    doi: "10.1016/j.biopsych.2011.02.003",
    url: "https://doi.org/10.1016/j.biopsych.2011.02.003",
  },
  {
    title:
      "Cognitive behavioural processes across psychological disorders: A transdiagnostic approach to research and treatment",
    authors: "Harvey, A., Watkins, E., Mansell, W., & Shafran, R.",
    year: 2004,
    citation:
      "Harvey, A., Watkins, E., Mansell, W., & Shafran, R. (2004). Cognitive behavioural processes across psychological disorders: A transdiagnostic approach to research and treatment. Oxford University Press.",
    relevance:
      "Texte fondateur de l'approche transdiagnostique. Cadre central du chapitre 4.",
    themes: ["transdiagnostique", "TCC", "mécanismes communs"],
    linkedChapters: ["ch4-liens"],
    needsVerification: true,
  },
  {
    title:
      "Are there two qualitatively distinct forms of dissociation? A review and some clinical implications",
    authors:
      "Holmes, E. A., Brown, R. J., Mansell, W., Fearon, R. P., Hunter, E. C. M., Frasquilho, F., & Oakley, D. A.",
    year: 2005,
    citation:
      "Holmes, E. A., Brown, R. J., Mansell, W., Fearon, R. P., Hunter, E. C. M., Frasquilho, F., & Oakley, D. A. (2005). Are there two qualitatively distinct forms of dissociation? A review and some clinical implications. Clinical Psychology Review, 25(1), 1–23.",
    relevance:
      "Distinction détachement / compartimentalisation. Cadre conceptuel central pour positionner la dépersonnalisation (§1.1.2, §2.2.3).",
    themes: ["dissociation", "détachement", "compartimentalisation"],
    linkedChapters: ["ch1-depersonnalisation", "ch2-anxiete"],
    doi: "10.1016/j.cpr.2004.08.006",
    url: "https://doi.org/10.1016/j.cpr.2004.08.006",
  },
  {
    title:
      "Depersonalisation disorder: A cognitive-behavioural conceptualisation",
    authors:
      "Hunter, E. C. M., Phillips, M. L., Chalder, T., Sierra, M., & David, A. S.",
    year: 2003,
    citation:
      "Hunter, E. C. M., Phillips, M. L., Chalder, T., Sierra, M., & David, A. S. (2003). Depersonalisation disorder: A cognitive-behavioural conceptualisation. Behaviour Research and Therapy, 41(12), 1451–1467.",
    relevance:
      "Modèle cognitivo-comportemental de la dépersonnalisation chronique (§1.2.1).",
    themes: ["dépersonnalisation", "TCC", "modèle cognitif"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1016/S0005-7967(03)00066-4",
    url: "https://doi.org/10.1016/S0005-7967(03)00066-4",
  },
  {
    title:
      "The epidemiology of depersonalisation and derealisation: A systematic review",
    authors: "Hunter, E. C. M., Sierra, M., & David, A. S.",
    year: 2004,
    citation:
      "Hunter, E. C. M., Sierra, M., & David, A. S. (2004). The epidemiology of depersonalisation and derealisation: A systematic review. Social Psychiatry and Psychiatric Epidemiology, 39(1), 9–18.",
    relevance:
      "Revue systématique de l'épidémiologie. Données de prévalence vie entière (§1.1.3).",
    themes: ["épidémiologie", "dépersonnalisation", "revue systématique"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1007/s00127-004-0701-4",
    url: "https://doi.org/10.1007/s00127-004-0701-4",
  },
  {
    title:
      "Research domain criteria (RDoC): Toward a new classification framework for research on mental disorders",
    authors:
      "Insel, T., Cuthbert, B., Garvey, M., Heinssen, R., Pine, D. S., Quinn, K., Sanislow, C., & Wang, P.",
    year: 2010,
    citation:
      "Insel, T., Cuthbert, B., Garvey, M., Heinssen, R., Pine, D. S., Quinn, K., Sanislow, C., & Wang, P. (2010). Research domain criteria (RDoC): Toward a new classification framework for research on mental disorders. American Journal of Psychiatry, 167(7), 748–751.",
    relevance:
      "Cadre RDoC. Justifie l'approche dimensionnelle / transdiagnostique du mémoire (§4.2.3).",
    themes: ["RDoC", "dimensionnel", "transdiagnostique"],
    linkedChapters: ["ch4-liens"],
    doi: "10.1176/appi.ajp.2010.09091379",
    url: "https://doi.org/10.1176/appi.ajp.2010.09091379",
  },
  {
    title: "L'automatisme psychologique",
    authors: "Janet, P.",
    year: 1889,
    citation: "Janet, P. (1889). L'automatisme psychologique. Alcan.",
    relevance:
      "Notion historique de désagrégation psychologique (§1.2.4).",
    themes: ["psychodynamique", "désagrégation", "historique"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title:
      "Dissociative disorders among adults in the community, impaired functioning, and axis I and II comorbidity",
    authors: "Johnson, J. G., Cohen, P., Kasen, S., & Brook, J. S.",
    year: 2006,
    citation:
      "Johnson, J. G., Cohen, P., Kasen, S., & Brook, J. S. (2006). Dissociative disorders among adults in the community, impaired functioning, and axis I and II comorbidity. Journal of Psychiatric Research, 40(2), 131–140.",
    relevance:
      "Données de prévalence du trouble dépersonnalisation-déréalisation en population générale (§1.1.3).",
    themes: ["épidémiologie", "comorbidité", "dissociation"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1016/j.jpsychires.2005.03.003",
    url: "https://doi.org/10.1016/j.jpsychires.2005.03.003",
  },
  {
    title: "Why people die by suicide",
    authors: "Joiner, T.",
    year: 2005,
    citation:
      "Joiner, T. (2005). Why people die by suicide. Harvard University Press.",
    relevance:
      "Théorie interpersonnelle du suicide. Capacité acquise à se faire du mal (§3.2.3).",
    themes: ["suicide", "théorie", "capacité acquise"],
    linkedChapters: ["ch3-depression"],
    needsVerification: true,
  },
  {
    title:
      "Endogenomorphic depression: A conceptual and terminological revision",
    authors: "Klein, D. F.",
    year: 1974,
    citation:
      "Klein, D. F. (1974). Endogenomorphic depression: A conceptual and terminological revision. Archives of General Psychiatry, 31(4), 447–454.",
    relevance:
      "Conceptualisation de l'anhédonie endogénomorphe (§3.2.2).",
    themes: ["dépression", "anhédonie", "nosographie"],
    linkedChapters: ["ch3-depression"],
    doi: "10.1001/archpsyc.1974.01760160005001",
    url: "https://doi.org/10.1001/archpsyc.1974.01760160005001",
  },
  {
    title: "Meaning and void: Inner experience and the incentives in people's lives",
    authors: "Klinger, E.",
    year: 1977,
    citation:
      "Klinger, E. (1977). Meaning and void: Inner experience and the incentives in people's lives. University of Minnesota Press.",
    relevance:
      "Modèle de l'anhédonie comme déconnexion du système de récompense (§3.2.2).",
    themes: ["anhédonie", "récompense", "motivation"],
    linkedChapters: ["ch3-depression"],
    needsVerification: true,
  },
  {
    title:
      "The Hierarchical Taxonomy of Psychopathology (HiTOP): A dimensional alternative to traditional nosologies",
    authors:
      "Kotov, R., Krueger, R. F., Watson, D., Achenbach, T. M., Althoff, R. R., Bagby, R. M., Brown, T. A., Carpenter, W. T., Caspi, A., Clark, L. A., Eaton, N. R., Forbes, M. K., Forbush, K. T., Goldberg, D., Hasin, D., Hyman, S. E., Ivanova, M. Y., Lynam, D. R., Markon, K., … Zimmerman, M.",
    year: 2017,
    citation:
      "Kotov, R., Krueger, R. F., Watson, D., Achenbach, T. M., Althoff, R. R., Bagby, R. M., Brown, T. A., Carpenter, W. T., Caspi, A., Clark, L. A., Eaton, N. R., Forbes, M. K., Forbush, K. T., Goldberg, D., Hasin, D., Hyman, S. E., Ivanova, M. Y., Lynam, D. R., Markon, K., … Zimmerman, M. (2017). The Hierarchical Taxonomy of Psychopathology (HiTOP): A dimensional alternative to traditional nosologies. Journal of Abnormal Psychology, 126(4), 454–477.",
    relevance:
      "HiTOP. Alternative dimensionnelle aux nosographies catégorielles, citée pour soutenir le cadre transdiagnostique.",
    themes: ["HiTOP", "dimensionnel", "nosographie"],
    linkedChapters: ["ch4-liens"],
    doi: "10.1037/abn0000258",
    url: "https://doi.org/10.1037/abn0000258",
  },
  {
    title: "Körperbau und Charakter (5th ed.)",
    authors: "Kretschmer, E.",
    year: 1927,
    citation: "Kretschmer, E. (1927). Körperbau und Charakter (5th ed.). Springer.",
    relevance:
      "Description classique de l'anesthésie affective dans la mélancolie (§3.2.1).",
    themes: ["historique", "mélancolie", "phénoménologie"],
    linkedChapters: ["ch3-depression"],
    needsVerification: true,
  },
  {
    title: "The PHQ-9: Validity of a brief depression severity measure",
    authors: "Kroenke, K., Spitzer, R. L., & Williams, J. B. W.",
    year: 2001,
    citation:
      "Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613.",
    relevance:
      "Validation originale du PHQ-9, instrument central du protocole (§5.3.3).",
    themes: ["PHQ-9", "validation", "instrument"],
    linkedChapters: ["ch3-depression", "ch5-methodo"],
    doi: "10.1046/j.1525-1497.2001.016009606.x",
    url: "https://doi.org/10.1046/j.1525-1497.2001.016009606.x",
  },
  {
    title: "The divided self",
    authors: "Laing, R. D.",
    year: 1960,
    citation: "Laing, R. D. (1960). The divided self. Tavistock.",
    relevance:
      "Insécurité ontologique et altération du soi (§4.1.2).",
    themes: ["sentiment de soi", "phénoménologie", "psychiatrie"],
    linkedChapters: ["ch4-liens"],
    needsVerification: true,
  },
  {
    title:
      "Dissociable brain correlates for depression, anxiety, dissociation, and somatization in depersonalization-derealization disorder",
    authors:
      "Lemche, E., Surguladze, S. A., Brammer, M. J., Phillips, M. L., Sierra, M., David, A. S., & Giampietro, V. P.",
    year: 2007,
    citation:
      "Lemche, E., Surguladze, S. A., Brammer, M. J., Phillips, M. L., Sierra, M., David, A. S., & Giampietro, V. P. (2007). Dissociable brain correlates for depression, anxiety, dissociation, and somatization in depersonalization-derealization disorder. CNS Spectrums, 12(4), 286–291.",
    relevance:
      "Données neuroimagerie chez les patients dépersonnalisés : amygdale, préfrontal dorsolatéral (§1.2.2).",
    themes: ["neuroimagerie", "dépersonnalisation", "corrélats cérébraux"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1017/S1092852900021039",
    url: "https://doi.org/10.1017/S1092852900021039",
  },
  {
    title:
      "Suicide-related outcomes among individuals with depersonalization: Findings from a nationally representative sample",
    authors: "Lev-Ran, S., Le Foll, B., McKenzie, K., & Rehm, J.",
    year: 2013,
    citation:
      "Lev-Ran, S., Le Foll, B., McKenzie, K., & Rehm, J. (2013). Suicide-related outcomes among individuals with depersonalization: Findings from a nationally representative sample. Journal of Nervous and Mental Disease, 201(5), 447–449.",
    relevance:
      "Données NESARC : risque suicidaire majoré en présence de dépersonnalisation (§3.2.3).",
    themes: ["dépersonnalisation", "suicide", "épidémiologie"],
    linkedChapters: ["ch3-depression"],
    doi: "10.1097/NMD.0b013e31828e6f4e",
    url: "https://doi.org/10.1097/NMD.0b013e31828e6f4e",
  },
  {
    title:
      "Accuracy of Patient Health Questionnaire-9 (PHQ-9) for screening to detect major depression: Individual participant data meta-analysis",
    authors: "Levis, B., Benedetti, A., & Thombs, B. D.",
    year: 2019,
    citation:
      "Levis, B., Benedetti, A., & Thombs, B. D. (2019). Accuracy of Patient Health Questionnaire-9 (PHQ-9) for screening to detect major depression: Individual participant data meta-analysis. BMJ, 365, l1476.",
    relevance:
      "Sensibilité et spécificité du PHQ-9 ; appui psychométrique pour le §5.3.3.",
    themes: ["PHQ-9", "psychométrie", "méta-analyse"],
    linkedChapters: ["ch5-methodo"],
    doi: "10.1136/bmj.l1476",
    url: "https://doi.org/10.1136/bmj.l1476",
  },
  {
    title: "Anhedonia and dissociation in normal subjects",
    authors:
      "Loas, G., Dhee-Perot, P., Defachelles, M. H., & Pierson, A.",
    year: 1994,
    citation:
      "Loas, G., Dhee-Perot, P., Defachelles, M. H., & Pierson, A. (1994). Anhedonia and dissociation in normal subjects. Journal of Nervous and Mental Disease, 182(6), 362–363.",
    relevance:
      "Corrélation entre anhédonie et dépersonnalisation en population non clinique (§3.2.2).",
    themes: ["anhédonie", "dissociation", "population générale"],
    linkedChapters: ["ch3-depression"],
    needsVerification: true,
  },
  {
    title:
      "Cognitive behavioral processes across psychological disorders: A review of the utility and validity of the transdiagnostic approach",
    authors:
      "Mansell, W., Harvey, A., Watkins, E. R., & Shafran, R.",
    year: 2008,
    citation:
      "Mansell, W., Harvey, A., Watkins, E. R., & Shafran, R. (2008). Cognitive behavioral processes across psychological disorders: A review of the utility and validity of the transdiagnostic approach. International Journal of Cognitive Therapy, 1(3), 181–191.",
    relevance:
      "Article-pilier de la justification du cadre transdiagnostique (introduction + chapitre 4).",
    themes: ["transdiagnostique", "TCC", "revue"],
    linkedChapters: ["intro-generale", "ch4-liens"],
    doi: "10.1521/ijct.2008.1.3.181",
    url: "https://doi.org/10.1521/ijct.2008.1.3.181",
  },
  {
    title: "Limbic-cortical dysregulation: A proposed model of depression",
    authors: "Mayberg, H. S.",
    year: 1997,
    citation:
      "Mayberg, H. S. (1997). Limbic-cortical dysregulation: A proposed model of depression. Journal of Neuropsychiatry and Clinical Neurosciences, 9(3), 471–481.",
    relevance:
      "Modèle limbico-cortical de la dépression. Cingulaire sous-génual (§3.1.3).",
    themes: ["dépression", "neuroimagerie", "BA25"],
    linkedChapters: ["ch3-depression"],
    doi: "10.1176/jnp.9.3.471",
    url: "https://doi.org/10.1176/jnp.9.3.471",
  },
  {
    title:
      "Emotion and the unreal self: Depersonalization disorder and de-affectualization",
    authors: "Medford, N.",
    year: 2012,
    citation:
      "Medford, N. (2012). Emotion and the unreal self: Depersonalization disorder and de-affectualization. Emotion Review, 4(2), 139–144.",
    relevance:
      "Réseau par défaut, réseau de saillance et dépersonnalisation (§1.2.2, §3.3.2).",
    themes: ["DMN", "réseau de saillance", "dépersonnalisation"],
    linkedChapters: ["ch1-depersonnalisation", "ch3-depression"],
    doi: "10.1177/1754073911430134",
    url: "https://doi.org/10.1177/1754073911430134",
  },
  {
    title: "Understanding and treating depersonalisation disorder",
    authors: "Medford, N., Sierra, M., Baker, D., & David, A. S.",
    year: 2005,
    citation:
      "Medford, N., Sierra, M., Baker, D., & David, A. S. (2005). Understanding and treating depersonalisation disorder. Advances in Psychiatric Treatment, 11(2), 92–100.",
    relevance:
      "Affinement du modèle d'inhibition frontale-limbique de Sierra & Berrios (§1.2.2).",
    themes: ["dépersonnalisation", "neurobiologie", "traitement"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1192/apt.11.2.92",
    url: "https://doi.org/10.1192/apt.11.2.92",
  },
  {
    title:
      "Prevalence, correlates, and predictors of depersonalization experiences in the German general population",
    authors:
      "Michal, M., Wiltink, J., Subic-Wrana, C., Zwerenz, R., Tuin, I., Lichy, M., Beutel, M. E., & Brähler, E.",
    year: 2009,
    citation:
      "Michal, M., Wiltink, J., Subic-Wrana, C., Zwerenz, R., Tuin, I., Lichy, M., Beutel, M. E., & Brähler, E. (2009). Prevalence, correlates, and predictors of depersonalization experiences in the German general population. Journal of Nervous and Mental Disease, 197(7), 499–506.",
    relevance:
      "Données de prévalence en population générale (§1.1.3).",
    themes: ["épidémiologie", "dépersonnalisation"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1097/NMD.0b013e3181abe8d8",
    url: "https://doi.org/10.1097/NMD.0b013e3181abe8d8",
  },
  {
    title:
      "Le temps vécu : études phénoménologiques et psychopathologiques",
    authors: "Minkowski, E.",
    year: 1933,
    citation:
      "Minkowski, E. (1933). Le temps vécu : études phénoménologiques et psychopathologiques. Artrey. (Rééd. : PUF, 1995.)",
    relevance:
      "Texte fondateur sur la temporalité vécue, l'élan vital et la dépression mélancolique (§1.2.3, §3.3.4).",
    themes: ["phénoménologie", "temporalité", "mélancolie"],
    linkedChapters: ["ch1-depersonnalisation", "ch3-depression"],
    needsVerification: true,
  },
  {
    title:
      "Depersonalization and derealization in panic disorder: Psychopathological features and pharmacological treatment",
    authors: "Mula, M., Pini, S., & Cassano, G. B.",
    year: 2008,
    citation:
      "Mula, M., Pini, S., & Cassano, G. B. (2008). Depersonalization and derealization in panic disorder: Psychopathological features and pharmacological treatment. European Archives of Psychiatry and Clinical Neuroscience, 258(4), 193–199.",
    relevance:
      "Prévalence de la dépersonnalisation dans le trouble dépressif majeur (§3.2.1).",
    themes: ["dépersonnalisation", "trouble panique", "pharmacologie"],
    linkedChapters: ["ch2-anxiete", "ch3-depression"],
    needsVerification: true,
  },
  {
    title:
      "Trauma-related structural dissociation of the personality",
    authors: "Nijenhuis, E. R. S., van der Hart, O., & Steele, K.",
    year: 2004,
    citation:
      "Nijenhuis, E. R. S., van der Hart, O., & Steele, K. (2004). Trauma-related structural dissociation of the personality. Activitas Nervosa Superior, 46, 23–29.",
    relevance:
      "Théorie de la dissociation structurelle. Cité §1.1.2.",
    themes: ["dissociation", "trauma", "théorie"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title:
      "CIM-11 : Classification internationale des maladies, 11e révision",
    authors: "Organisation mondiale de la santé",
    year: 2019,
    citation:
      "Organisation mondiale de la santé. (2019). CIM-11 : Classification internationale des maladies, 11e révision. OMS.",
    relevance:
      "Classification 6B66 du trouble dépersonnalisation-déréalisation (§1.1.1).",
    themes: ["CIM-11", "nosographie", "OMS"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title: "Depersonalization disorder: Thinking without feeling",
    authors:
      "Phillips, M. L., Medford, N., Senior, C., Bullmore, E. T., Suckling, J., Brammer, M. J., Andrew, C., Sierra, M., Williams, S. C., & David, A. S.",
    year: 2001,
    citation:
      "Phillips, M. L., Medford, N., Senior, C., Bullmore, E. T., Suckling, J., Brammer, M. J., Andrew, C., Sierra, M., Williams, S. C., & David, A. S. (2001). Depersonalization disorder: Thinking without feeling. Psychiatry Research: Neuroimaging, 108(3), 145–160.",
    relevance:
      "Activation amygdalienne réduite et absence de réponse cutanée galvanique chez les patients dépersonnalisés (§1.2.2).",
    themes: ["dépersonnalisation", "neuroimagerie", "amygdale"],
    linkedChapters: ["ch1-depersonnalisation", "ch4-liens"],
    doi: "10.1016/S0925-4927(01)00119-6",
    url: "https://doi.org/10.1016/S0925-4927(01)00119-6",
  },
  {
    title:
      "Reduced caudate and nucleus accumbens response to rewards in unmedicated individuals with major depressive disorder",
    authors:
      "Pizzagalli, D. A., Holmes, A. J., Dillon, D. G., Goetz, E. L., Birk, J. L., Bogdan, R., Dougherty, D. D., Iosifescu, D. V., Rauch, S. L., & Fava, M.",
    year: 2009,
    citation:
      "Pizzagalli, D. A., Holmes, A. J., Dillon, D. G., Goetz, E. L., Birk, J. L., Bogdan, R., Dougherty, D. D., Iosifescu, D. V., Rauch, S. L., & Fava, M. (2009). Reduced caudate and nucleus accumbens response to rewards in unmedicated individuals with major depressive disorder. American Journal of Psychiatry, 166(6), 702–710.",
    relevance:
      "Hypoactivité des circuits dopaminergiques méso-striataux dans la dépression (§3.1.3).",
    themes: ["dépression", "récompense", "dopamine"],
    linkedChapters: ["ch3-depression"],
    doi: "10.1176/appi.ajp.2008.08081201",
    url: "https://doi.org/10.1176/appi.ajp.2008.08081201",
  },
  {
    title:
      "Common method biases in behavioral research: A critical review of the literature and recommended remedies",
    authors:
      "Podsakoff, P. M., MacKenzie, S. B., Lee, J.-Y., & Podsakoff, N. P.",
    year: 2003,
    citation:
      "Podsakoff, P. M., MacKenzie, S. B., Lee, J.-Y., & Podsakoff, N. P. (2003). Common method biases in behavioral research: A critical review of the literature and recommended remedies. Journal of Applied Psychology, 88(5), 879–903.",
    relevance:
      "Référence méthodologique pour le test du facteur unique de Harman (§5.6.2).",
    themes: ["méthodologie", "biais", "auto-évaluation"],
    linkedChapters: ["ch5-methodo"],
    doi: "10.1037/0021-9010.88.5.879",
    url: "https://doi.org/10.1037/0021-9010.88.5.879",
  },
  {
    title: "Schizophrenia, consciousness, and the self",
    authors: "Sass, L. A., & Parnas, J.",
    year: 2003,
    citation:
      "Sass, L. A., & Parnas, J. (2003). Schizophrenia, consciousness, and the self. Schizophrenia Bulletin, 29(3), 427–444.",
    relevance:
      "Ipséité et hiérarchie phénoménologique de l'altération du soi (§4.1.2).",
    themes: ["ipséité", "phénoménologie", "schizophrénie"],
    linkedChapters: ["ch4-liens"],
    doi: "10.1093/oxfordjournals.schbul.a007017",
    url: "https://doi.org/10.1093/oxfordjournals.schbul.a007017",
  },
  {
    title: "Klinische Psychopathologie",
    authors: "Schneider, K.",
    year: 1950,
    citation: "Schneider, K. (1950). Klinische Psychopathologie. Thieme.",
    relevance:
      "Description classique de l'anesthésie psychique douloureuse dans la mélancolie (§3.2.1).",
    themes: ["psychopathologie", "mélancolie", "historique"],
    linkedChapters: ["ch3-depression"],
    needsVerification: true,
  },
  {
    title: "Depersonalization: Neurobiological perspectives",
    authors: "Sierra, M., & Berrios, G. E.",
    year: 1998,
    citation:
      "Sierra, M., & Berrios, G. E. (1998). Depersonalization: Neurobiological perspectives. Biological Psychiatry, 44(9), 898–908.",
    relevance:
      "Modèle neurobiologique fondateur (inhibition cortico-limbique). Cadre central du chapitre 1 et de la voie hyperactivation (chapitre 4).",
    themes: ["dépersonnalisation", "neurobiologie", "modèle fondateur"],
    linkedChapters: [
      "ch1-depersonnalisation",
      "ch2-anxiete",
      "ch3-depression",
      "ch4-liens",
    ],
    doi: "10.1016/S0006-3223(98)00015-8",
    url: "https://doi.org/10.1016/S0006-3223(98)00015-8",
  },
  {
    title:
      "The Cambridge Depersonalisation Scale: A new instrument for the measurement of depersonalisation",
    authors: "Sierra, M., & Berrios, G. E.",
    year: 2000,
    citation:
      "Sierra, M., & Berrios, G. E. (2000). The Cambridge Depersonalisation Scale: A new instrument for the measurement of depersonalisation. Psychiatry Research, 93(2), 153–164.",
    relevance:
      "Article original de validation de la CDS. Instrument central du protocole (§5.3.1).",
    themes: ["CDS", "psychométrie", "instrument"],
    linkedChapters: ["ch5-methodo"],
    doi: "10.1016/S0165-1781(00)00100-1",
    url: "https://doi.org/10.1016/S0165-1781(00)00100-1",
  },
  {
    title:
      "A placebo-controlled, cross-over trial of lamotrigine in depersonalization disorder",
    authors:
      "Sierra, M., Phillips, M. L., Ivin, G., Krystal, J., David, A. S., & Nutt, D. J.",
    year: 2003,
    citation:
      "Sierra, M., Phillips, M. L., Ivin, G., Krystal, J., David, A. S., & Nutt, D. J. (2003). A placebo-controlled, cross-over trial of lamotrigine in depersonalization disorder. Journal of Psychopharmacology, 17(1), 103–105.",
    relevance:
      "Approche pharmacologique de la dépersonnalisation (§4.3.3).",
    themes: ["pharmacologie", "lamotrigine", "essai contrôlé"],
    linkedChapters: ["ch4-liens"],
    needsVerification: true,
  },
  {
    title:
      "The prevalence of 'alexithymic' characteristics in psychosomatic patients",
    authors: "Sifneos, P. E.",
    year: 1973,
    citation:
      "Sifneos, P. E. (1973). The prevalence of 'alexithymic' characteristics in psychosomatic patients. Psychotherapy and Psychosomatics, 22(2–6), 255–262.",
    relevance:
      "Définition originale de l'alexithymie (§3.3.3).",
    themes: ["alexithymie", "psychosomatique"],
    linkedChapters: ["ch3-depression"],
    doi: "10.1159/000286529",
    url: "https://doi.org/10.1159/000286529",
  },
  {
    title:
      "The role of childhood interpersonal trauma in depersonalization disorder",
    authors:
      "Simeon, D., Guralnik, O., Schmeidler, J., Sirof, B., & Knutelska, M.",
    year: 2001,
    citation:
      "Simeon, D., Guralnik, O., Schmeidler, J., Sirof, B., & Knutelska, M. (2001). The role of childhood interpersonal trauma in depersonalization disorder. American Journal of Psychiatry, 158(7), 1027–1033.",
    relevance:
      "Trauma interpersonnel précoce comme facteur de vulnérabilité (§1.2.4, §4.3.2).",
    themes: ["trauma", "dépersonnalisation", "facteur de risque"],
    linkedChapters: ["ch1-depersonnalisation", "ch4-liens"],
    doi: "10.1176/appi.ajp.158.7.1027",
    url: "https://doi.org/10.1176/appi.ajp.158.7.1027",
  },
  {
    title: "Alexithymia in depersonalisation disorder",
    authors:
      "Simeon, D., Guralnik, O., Schmeidler, J., & Knutelska, M.",
    year: 2004,
    citation:
      "Simeon, D., Guralnik, O., Schmeidler, J., & Knutelska, M. (2004). Alexithymia in depersonalisation disorder. Journal of Nervous and Mental Disease, 192(10), 714–718.",
    relevance:
      "Alexithymie élevée chez les patients dépersonnalisés (§3.3.3).",
    themes: ["alexithymie", "dépersonnalisation"],
    linkedChapters: ["ch3-depression"],
    doi: "10.1097/01.nmd.0000142027.42873.9d",
    url: "https://doi.org/10.1097/01.nmd.0000142027.42873.9d",
  },
  {
    title:
      "An open trial of naltrexone in the treatment of depersonalization disorder",
    authors: "Simeon, D., & Knutelska, M.",
    year: 2005,
    citation:
      "Simeon, D., & Knutelska, M. (2005). An open trial of naltrexone in the treatment of depersonalization disorder. Journal of Clinical Psychopharmacology, 25(3), 267–270.",
    relevance:
      "Système opioïde endogène et dépersonnalisation (§4.3.3).",
    themes: ["naltrexone", "opioïdes", "pharmacologie"],
    linkedChapters: ["ch4-liens"],
    doi: "10.1097/01.jcp.0000162802.61933.1b",
    url: "https://doi.org/10.1097/01.jcp.0000162802.61933.1b",
  },
  {
    title:
      "Feeling unreal: A depersonalization disorder update of 117 cases",
    authors:
      "Simeon, D., Knutelska, M., Nelson, D., & Guralnik, O.",
    year: 2003,
    citation:
      "Simeon, D., Knutelska, M., Nelson, D., & Guralnik, O. (2003). Feeling unreal: A depersonalization disorder update of 117 cases. Journal of Clinical Psychiatry, 64(9), 990–997.",
    relevance:
      "Comorbidités anxieuses, dépressives et de personnalité dans la dépersonnalisation chronique (§1.1.3, §2.2.1, §3.2.1).",
    themes: ["dépersonnalisation", "comorbidité", "cohorte clinique"],
    linkedChapters: [
      "ch1-depersonnalisation",
      "ch2-anxiete",
      "ch3-depression",
    ],
    doi: "10.4088/JCP.v64n0903",
    url: "https://doi.org/10.4088/JCP.v64n0903",
  },
  {
    title: "Factors associated with resilience in healthy adults",
    authors:
      "Simeon, D., Yehuda, R., Cunill, R., Knutelska, M., Putnam, F. W., & Smith, L. M.",
    year: 2007,
    citation:
      "Simeon, D., Yehuda, R., Cunill, R., Knutelska, M., Putnam, F. W., & Smith, L. M. (2007). Factors associated with resilience in healthy adults. Psychoneuroendocrinology, 32(8–10), 1149–1152.",
    relevance:
      "Dysfonctionnement de l'axe HPA chez des patients dépersonnalisés (§2.3.2).",
    themes: ["HPA", "cortisol", "résilience"],
    linkedChapters: ["ch2-anxiete"],
    needsVerification: true,
  },
  {
    title:
      "Manual for the State-Trait Anxiety Inventory: STAI (Form Y)",
    authors: "Spielberger, C. D.",
    year: 1983,
    citation:
      "Spielberger, C. D. (1983). Manual for the State-Trait Anxiety Inventory: STAI (Form Y). Consulting Psychologists Press.",
    relevance:
      "Manuel original du STAI-Y. Distinction état/trait fondamentale pour le protocole (§5.3.2).",
    themes: ["STAI-Y", "anxiété-trait", "instrument"],
    linkedChapters: ["ch2-anxiete", "ch5-methodo"],
    needsVerification: true,
  },
  {
    title:
      "Depersonalization disorder and borderline personality disorder",
    authors: "Stein, M. B., & Hollander, E.",
    year: 1992,
    citation:
      "Stein, M. B., & Hollander, E. (1992). Depersonalization disorder and borderline personality disorder. Journal of Clinical Psychiatry, 53(8), 290–291.",
    relevance:
      "10 à 30 % de symptômes dépersonnalisation dans le trouble panique (§2.2.1).",
    themes: ["dépersonnalisation", "trouble panique", "borderline"],
    linkedChapters: ["ch2-anxiete"],
    needsVerification: true,
  },
  {
    title: "Phénoménologie des psychoses",
    authors: "Tatossian, A.",
    year: 1979,
    citation:
      "Tatossian, A. (1979). Phénoménologie des psychoses. Masson.",
    relevance:
      "Tradition phénoménologique européenne. Ipséité (Selbst / Leib) et dépersonnalisation (§1.2.3).",
    themes: ["phénoménologie", "ipséité", "psychose"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title: "La phénoménologie des psychoses",
    authors: "Tatossian, A.",
    year: 1997,
    citation:
      "Tatossian, A. (1997). La phénoménologie des psychoses. L'Art du Comprendre.",
    relevance:
      "Reprise et approfondissement de l'analyse phénoménologique de l'ipséité (§1.2.3).",
    themes: ["phénoménologie", "ipséité"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title: "Ironic processes of mental control",
    authors: "Wegner, D. M.",
    year: 1994,
    citation:
      "Wegner, D. M. (1994). Ironic processes of mental control. Psychological Review, 101(1), 34–52.",
    relevance:
      "Suppression mentale et amplification paradoxale (§1.1.2).",
    themes: ["régulation", "suppression", "contrôle mental"],
    linkedChapters: ["ch1-depersonnalisation"],
    doi: "10.1037/0033-295X.101.1.34",
    url: "https://doi.org/10.1037/0033-295X.101.1.34",
  },
  {
    title:
      "Emotional disorders and metacognition: Innovative cognitive therapy",
    authors: "Wells, A.",
    year: 2000,
    citation:
      "Wells, A. (2000). Emotional disorders and metacognition: Innovative cognitive therapy. Wiley.",
    relevance:
      "Modèle métacognitif de l'anxiété. Hypervigilance auto-réflexive (§2.3.3).",
    themes: ["métacognition", "anxiété", "hypervigilance"],
    linkedChapters: ["ch2-anxiete"],
    needsVerification: true,
  },
  {
    title: "Ego distortion in terms of true and false self",
    authors: "Winnicott, D. W.",
    year: 1960,
    citation:
      "Winnicott, D. W. (1960). Ego distortion in terms of true and false self. In D. W. Winnicott, The maturational process and the facilitating environment (pp. 140–152). Hogarth Press, 1965.",
    relevance:
      "Personnalisation, holding et défaillance précoce dans la prédisposition dissociative (§1.2.4).",
    themes: ["psychodynamique", "Winnicott", "vrai-faux soi"],
    linkedChapters: ["ch1-depersonnalisation"],
    needsVerification: true,
  },
  {
    title:
      "Subjectivity and selfhood: Investigating the first-person perspective",
    authors: "Zahavi, D.",
    year: 2005,
    citation:
      "Zahavi, D. (2005). Subjectivity and selfhood: Investigating the first-person perspective. MIT Press.",
    relevance:
      "Distinction soi minimal / soi narratif. Cadre conceptuel central de l'analyse phénoménologique (§1.3.2, §4.1.2).",
    themes: ["phénoménologie", "soi minimal", "ipséité"],
    linkedChapters: ["ch1-depersonnalisation", "ch4-liens"],
    needsVerification: true,
  },
  {
    title:
      "A randomized trial of an N-methyl-D-aspartate antagonist in treatment-resistant major depression",
    authors:
      "Zarate, C. A., Singh, J. B., Carlson, P. J., Brutsche, N. E., Ameli, R., Luckenbaugh, D. A., Charney, D. S., & Manji, H. K.",
    year: 2006,
    citation:
      "Zarate, C. A., Singh, J. B., Carlson, P. J., Brutsche, N. E., Ameli, R., Luckenbaugh, D. A., Charney, D. S., & Manji, H. K. (2006). A randomized trial of an N-methyl-D-aspartate antagonist in treatment-resistant major depression. Archives of General Psychiatry, 63(8), 856–864.",
    relevance:
      "Glutamate et antidépresseurs à action rapide type kétamine (§3.1.3).",
    themes: ["kétamine", "glutamate", "dépression résistante"],
    linkedChapters: ["ch3-depression"],
    doi: "10.1001/archpsyc.63.8.856",
    url: "https://doi.org/10.1001/archpsyc.63.8.856",
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
    doi: r.doi,
    url: r.url,
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

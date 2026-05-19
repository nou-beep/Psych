// Extracted chapter prose from the PFE draft (Mrini, 2026). Each entry
// holds the author's own writing — the introduction, synthesis paragraphs
// and section openers — so the Formation thesis dashboard and writer can
// display real content rather than placeholder text.
//
// IMPORTANT: only the author's authored prose is reproduced here. The
// 78 references with DOIs live in `lib/research/real-references.ts`;
// quoted phrases from cited authors stay inside the author's running
// commentary as the PFE itself presents them.

export interface ChapterSectionProse {
  /** Section anchor from the PFE table of contents (e.g. "1.1.1"). */
  anchor: string;
  /** Human-readable title (matches PFE table of contents). */
  title: string;
  /** Substantive prose from the PFE, light-formatted for the UI. */
  body: string;
}

export interface ChapterProse {
  /** Matches REAL_CHAPTER_OUTLINE.id */
  chapterId: string;
  /** Opening prose introducing the chapter. */
  opener: string;
  /** Per-section author prose. */
  sections: ChapterSectionProse[];
  /** Closing synthesis paragraph. */
  synthesis?: string;
}

export const PFE_INTRODUCTION_GENERALE = `La dépersonnalisation désigne un état subjectif dans lequel l'individu se perçoit comme étranger à lui-même, observant ses propres pensées, émotions ou actions depuis une position d'extériorité. Cette expérience, bien que souvent fugace dans la population générale, peut prendre une forme chronique et invalidante, constituant alors un tableau clinique à part entière — le trouble dissociatif de dépersonnalisation-déréalisation — ou s'intégrant comme symptôme secondaire au sein d'un large spectre de pathologies.

Les données épidémiologiques disponibles indiquent que des expériences transitoires de dépersonnalisation toucheraient entre 26 et 74 % de la population générale au cours de la vie (Hunter, Sierra, & David, 2004), tandis que la forme syndromique chronique présenterait une prévalence estimée entre 1 et 2 % (American Psychiatric Association, 2013).

La question de la dépersonnalisation occupe, au sein de la psychopathologie contemporaine, une position conceptuelle délicate. D'une part, elle est classifiée parmi les troubles dissociatifs dans le DSM-5 et la CIM-11, ce qui la rattache à une tradition nosographique privilégiant le clivage ou la compartimentation des processus mentaux. D'autre part, sa fréquente comorbidité avec les troubles anxieux et dépressifs — relevée de manière constante dans la littérature empirique — suggère qu'elle ne saurait être réduite à une simple dissociation, mais qu'elle engage des mécanismes partagés avec d'autres dimensions psychopathologiques majeures.

C'est précisément cette position interstitielle qui motive la problématique du présent travail. La notion de transdiagnostic, développée notamment par Harvey et al. (2004) et Mansell et al. (2008), offre un cadre interprétatif permettant de dépasser les frontières nosographiques classiques pour identifier des mécanismes psychologiques transversaux à plusieurs entités cliniques.

Le cadre théorique retenu pour ce travail repose sur une articulation de quatre traditions explicatives complémentaires : le modèle cognitif (Salkovskis ; Clark ; Beck), le modèle neurobiologique (Sierra & Berrios, 1998 ; Medford et al., 2005), la tradition phénoménologique (Minkowski ; Tatossian) et la perspective psychodynamique (Freud ; Janet ; Winnicott). Ces quatre perspectives ne sont pas concurrentes mais complémentaires : elles éclairent des niveaux différents d'un même phénomène — cognitif, neurobiologique, expérientiel et dynamique — et leur articulation constitue précisément l'enjeu théorique central du présent travail.`;

export const PFE_CHAPTER_SYNTHESES = {
  ch1: `Ce premier ensemble d'analyses a permis de situer la dépersonnalisation à l'intersection de plusieurs cadres conceptuels, en montrant qu'elle ne peut être réduite ni à un simple phénomène dissociatif, ni à un symptôme secondaire isolé. Les données issues des modèles cognitifs, neurobiologiques, phénoménologiques et psychodynamiques convergent vers l'idée d'un trouble complexe, impliquant à la fois une altération du traitement émotionnel et une perturbation du sentiment minimal de soi.

Au plan mécanistique, trois processus apparaissent particulièrement centraux : la dysrégulation émotionnelle, l'altération de l'ipséité et les perturbations du traitement intéroceptif. Toutefois, ces mécanismes, bien que largement documentés, ne permettent pas à eux seuls de rendre compte de l'hétérogénéité des manifestations cliniques observées, ni des différences de trajectoires entre les patients.

Cette limite invite à dépasser une lecture strictement catégorielle de la dépersonnalisation pour l'inscrire dans une perspective transdiagnostique, où elle pourrait constituer non pas une entité isolée, mais un mode particulier de réponse à des états affectifs extrêmes ou dysrégulés.`,

  ch2: `Ce deuxième chapitre a examiné les liens empiriques et mécanistiques entre anxiété et dépersonnalisation. Les données convergent vers l'existence d'une relation bidirectionnelle entre ces deux dimensions cliniques : l'anxiété, qu'elle soit chronique ou paroxystique, peut engendrer la dépersonnalisation par des voies cognitives (interprétations catastrophisantes, hypervigilance métacognitive), neurobiologiques (inhibition préfrontale de l'amygdale, dysfonction de l'insula, altération de l'axe HPA) et comportementales (suppression émotionnelle, évitement).

Réciproquement, la dépersonnalisation est susceptible de générer ou d'amplifier l'anxiété, notamment à travers l'interprétation catastrophisante des expériences dissociatives, contribuant ainsi à l'entretien d'un cercle vicieux entre activation anxieuse et détachement subjectif.

Dans ce cadre, l'hypothèse d'un rôle régulateur de la dépersonnalisation — adaptatif à court terme, mais potentiellement désadaptatif à long terme — apparaît comme une clé de lecture intégrative des interactions entre ces deux dimensions.`,

  ch3: `Ce troisième chapitre a examiné les liens entre dépression et dépersonnalisation sous leurs dimensions nosographique, empirique, mécanistique et phénoménologique. Les analyses mettent en évidence une voie dépressive vers la dépersonnalisation reposant sur des mécanismes distincts de ceux observés dans l'anxiété, notamment une hypoactivation émotionnelle primaire, l'anhédonie, les altérations du réseau par défaut, l'alexithymie ainsi que la perturbation de la temporalité vécue.

La relation entre ces deux dimensions cliniques apparaît également bidirectionnelle et amplificatrice, la dépersonnalisation étant susceptible d'aggraver l'évolution dépressive, en particulier par son association avec une majoration du risque suicidaire.

Dans ce contexte, la dépersonnalisation peut être envisagée non seulement comme une conséquence des états dépressifs, mais aussi comme un facteur participant à leur chronicisation et à leur sévérité.`,

  ch4: `Ce quatrième chapitre a proposé une analyse comparative des mécanismes par lesquels l'anxiété et la dépression conduisent à la dépersonnalisation, en mettant en évidence à la fois des convergences — dysrégulation émotionnelle, altération du sentiment de soi, corrélats neurobiologiques partagés — et des divergences, notamment entre une voie d'hyperactivation et une voie d'hypoactivation, ainsi que des profils intéroceptifs distincts.

Sur cette base, un modèle transdiagnostique en double voie a été élaboré, articulant les facteurs de vulnérabilité communs, les mécanismes spécifiques à chaque trajectoire et les facteurs de maintien partagés. Ce modèle permet de dépasser une lecture strictement catégorielle en proposant une compréhension dynamique des interactions entre anxiété, dépression et dépersonnalisation.`,

  bibliographique: `L'analyse des travaux portant sur la dépersonnalisation, l'anxiété et la dépression met en évidence des liens conceptuels et cliniques étroits entre ces trois dimensions psychopathologiques. Les modèles existants suggèrent que la dépersonnalisation peut apparaître à la fois comme une réponse à une hyperactivation émotionnelle, notamment dans les troubles anxieux, et comme une forme de désengagement émotionnel observée dans les états dépressifs.

Cependant, malgré la richesse des approches théoriques, les résultats demeurent parfois hétérogènes et les mécanismes précis reliant ces phénomènes ne font pas l'objet d'un consensus clair. En particulier, la place de la dépersonnalisation en tant que mécanisme transdiagnostique reste encore insuffisamment explorée dans les recherches empiriques.`,
} as const;

export const PFE_CHAPTER_PROSE: ChapterProse[] = [
  {
    chapterId: "intro-generale",
    opener: PFE_INTRODUCTION_GENERALE,
    sections: [],
  },
  {
    chapterId: "ch1-depersonnalisation",
    opener:
      "Ce chapitre situe la dépersonnalisation au sein de la psychopathologie contemporaine, en articulant ses définitions cliniques, les quatre modèles théoriques qui en rendent compte, et les mécanismes psychopathologiques centraux qui en sous-tendent l'expérience.",
    sections: [
      {
        anchor: "1.1.1",
        title: "Définition clinique de la dépersonnalisation",
        body:
          "La dépersonnalisation est définie, dans le DSM-5, comme la présence d'expériences persistantes ou récurrentes de sentiment de détachement de ses propres processus mentaux ou de son propre corps, s'accompagnant d'un sens de la réalité intact — ce dernier critère distinguant la dépersonnalisation de la psychose. Concrètement, le sujet rapporte se sentir comme un observateur extérieur de ses propres pensées, sentiments, sensations corporelles, actions ou paroles. La réalité externe, quant à elle, peut être perçue comme irréelle, distante ou artificielle — ce que le DSM-5 appelle la déréalisation, phénomène souvent associé mais conceptuellement distinct. Sur le plan séméiologique, la dépersonnalisation se manifeste à travers quatre dimensions : affective (émoussement émotionnel), cognitive (automatisme des pensées), somatique (dépossession corporelle) et temporelle (altération du sentiment de continuité).",
      },
      {
        anchor: "1.2.2",
        title: "Modèle neurobiologique",
        body:
          "Le modèle neurobiologique de la dépersonnalisation, proposé initialement par Sierra et Berrios (1998) et affiné par Medford et ses collaborateurs (2005), postule l'existence d'un mécanisme d'inhibition frontale des réponses limbiques conduisant à une déconnexion fonctionnelle entre les systèmes de traitement émotionnel et les systèmes de représentation de soi. Dans ce cadre, la dépersonnalisation résulterait d'une hyperactivation préfrontale — plus précisément du cortex préfrontal ventromédian et du cortex cingulaire antérieur — qui exerce une inhibition descendante sur l'amygdale, réduisant ainsi les réponses émotionnelles autonomes et créant l'expérience subjective d'anesthésie affective.",
      },
      {
        anchor: "1.3.1",
        title: "Dysrégulation émotionnelle",
        body:
          "Gross et Thompson (2007) définissent la régulation émotionnelle comme l'ensemble des processus par lesquels les individus influencent quelles émotions ils ont, quand ils les ont et comment ils les ressentent et les expriment. Dans le contexte de la dépersonnalisation, la dysrégulation peut opérer selon deux dynamiques distinctes. D'une part, lorsque l'intensité émotionnelle atteint un niveau intolérable (panique, anxiété intense), une réponse dissociative-détachement peut s'enclencher comme mécanisme de protection. D'autre part, dans les états dépressifs caractérisés par un émoussement affectif primaire, la dysrégulation prend la forme d'une hypoactivation chronique. Ces deux dynamiques — hyperactivation et hypoactivation — convergent vers un phénotype symptomatique commun, justifiant l'hypothèse d'une fonction transdiagnostique de la dépersonnalisation.",
      },
    ],
    synthesis: PFE_CHAPTER_SYNTHESES.ch1,
  },
  {
    chapterId: "ch2-anxiete",
    opener:
      "Ce chapitre examine les liens empiriques, cliniques et mécanistiques entre anxiété et dépersonnalisation. Il développe en particulier l'hypothèse de l'hyperactivation émotionnelle comme voie principale par laquelle l'anxiété peut engendrer ou entretenir des expériences de dépersonnalisation.",
    sections: [
      {
        anchor: "2.2.1",
        title: "Comorbidités et données cliniques",
        body:
          "Dans les études cliniques portant sur des patients présentant un trouble dépersonnalisation-déréalisation, la prévalence des troubles anxieux comorbides est systématiquement élevée. Baker et al. (2003) ont rapporté que 34 % des patients présentant une dépersonnalisation chronique avaient également un trouble panique, 24 % une phobie sociale et 11 % un trouble obsessionnel-compulsif. Plusieurs études transversales ont mis en évidence une corrélation positive entre les scores d'anxiété-trait (mesurée par le STAI-Y) et les scores de dépersonnalisation. Giesbrecht et al. (2010) ont montré que l'anxiété-trait constitue un prédicteur significatif des expériences dissociatives, au-delà de la contribution de l'anxiété-état.",
      },
      {
        anchor: "2.3.3",
        title: "Hypervigilance et boucle anxiété-dépersonnalisation",
        body:
          "L'hypervigilance — état d'attention exacerbée aux signaux de menace, interne ou externe — constitue une caractéristique centrale de l'anxiété chronique. Appliqué aux processus autoréflexifs, cet état se traduit par une surveillance accrue des états mentaux et corporels — ce que l'on peut désigner comme une métacognition hypervigilante — susceptible de produire une expérience d'étrangeté à soi-même. Lorsqu'un individu anxieux dirige une attention soutenue et analytique sur ses propres processus mentaux, il peut en venir à percevoir ces processus comme mécaniques, automatiques ou étrangers, précisément parce que la réflexivité analytique sature et perturbe les automatismes qui rendent l'expérience subjective naturelle et transparente.",
      },
    ],
    synthesis: PFE_CHAPTER_SYNTHESES.ch2,
  },
  {
    chapterId: "ch3-depression",
    opener:
      "Ce chapitre porte sur les relations entre dépression et dépersonnalisation. La voie par laquelle la dépression conduit à la dépersonnalisation diffère fondamentalement de la voie anxieuse : il s'agit d'une hypoactivation primaire — un affaiblissement de la réactivité affective de base qui prive le sujet de la texture émotionnelle à travers laquelle l'expérience est normalement vécue comme réelle et appartenant à soi.",
    sections: [
      {
        anchor: "3.2.2",
        title: "Rôle de l'anhédonie",
        body:
          "L'anhédonie — incapacité à ressentir du plaisir ou de l'intérêt — constitue l'un des symptômes cardinaux de la dépression et représente un point de convergence majeur avec la dépersonnalisation. Klinger (1977) et Klein (1974) ont proposé que l'anhédonie résulte d'une déconnexion entre le système de récompense dopaminergique et les systèmes de représentation émotionnelle consciente. Loas et al. (1994) ont montré que l'anhédonie est positivement corrélée aux expériences de dépersonnalisation dans des échantillons non cliniques, suggérant que ces deux dimensions partagent un substrat commun lié à l'émoussement de la réactivité affective.",
      },
      {
        anchor: "3.2.3",
        title: "Dépersonnalisation et idéation suicidaire",
        body:
          "Lev-Ran et al. (2013), dans une étude portant sur un large échantillon de l'enquête NESARC, ont observé que les individus présentant des expériences de dépersonnalisation avaient des taux de tentatives de suicide significativement plus élevés que ceux sans dépersonnalisation, même après contrôle des variables de comorbidité. Une hypothèse explicative repose sur le fait que la dépersonnalisation — en atténuant l'expérience subjective de la douleur émotionnelle et en affaiblissant le sentiment d'appartenance à soi-même — peut réduire l'inhibition naturelle contre le passage à l'acte suicidaire.",
      },
    ],
    synthesis: PFE_CHAPTER_SYNTHESES.ch3,
  },
  {
    chapterId: "ch4-liens",
    opener:
      "Ce chapitre propose une analyse comparative des mécanismes par lesquels l'anxiété et la dépression conduisent à la dépersonnalisation, et développe un modèle transdiagnostique intégratif en double voie articulant les facteurs de vulnérabilité communs, les mécanismes spécifiques à chaque trajectoire et les facteurs de maintien partagés.",
    sections: [
      {
        anchor: "4.3.1",
        title: "Proposition d'un modèle en double voie",
        body:
          "Le modèle postule l'existence de deux voies principales vers la dépersonnalisation — la voie hyperactivation et la voie hypoactivation — convergeant vers un état fonctionnel commun caractérisé par un découplage entre processus affectifs automatiques et représentation consciente de soi.\n\nLa voie hyperactivation (voie anxieuse) : vulnérabilité constitutionnelle à l'anxiété-trait + schémas cognitifs de menace → activation soutenue du système amygdalien → recrutement de mécanismes d'inhibition préfrontale descendante → réduction de la réponse émotionnelle autonome et de la représentation intéroceptive → expérience de détachement → interprétations catastrophisantes → anxiété secondaire → boucle symptomatique.\n\nLa voie hypoactivation (voie dépressive) : activation insuffisante des circuits dopaminergiques méso-striataux + hyperactivité des circuits de traitement négatif autoréférentiel (cingulaire sous-génual, réseau par défaut) → réduction de la réactivité affective + perturbation de la représentation temporelle de soi → anhédonie + alexithymie → appauvrissement de l'expérience affective → sentiment de détachement avec coloration de vide chronique.",
      },
    ],
    synthesis: PFE_CHAPTER_SYNTHESES.ch4,
  },
  {
    chapterId: "ch5-methodo",
    opener:
      "Ce chapitre présente le protocole méthodologique de l'étude empirique conçue pour soumettre à vérification les hypothèses dérivées du modèle transdiagnostique en double voie. L'étude est une enquête quantitative transversale corrélationnelle réalisée auprès de 50 jeunes adultes.",
    sections: [
      {
        anchor: "5.1",
        title: "Objectifs et hypothèses",
        body:
          "Objectif principal : tester les relations entre les niveaux de dépersonnalisation, d'anxiété-trait et de symptomatologie dépressive dans un échantillon de jeunes adultes universitaires.\n\nObjectifs spécifiques :\n— Évaluer la force et la direction de la corrélation entre dépersonnalisation et anxiété-trait.\n— Évaluer la force et la direction de la corrélation entre dépersonnalisation et symptomatologie dépressive.\n— Déterminer si l'anxiété-trait et la symptomatologie dépressive constituent des prédicteurs significatifs et indépendants de la dépersonnalisation.",
      },
      {
        anchor: "5.3",
        title: "Instruments de mesure",
        body:
          "Trois instruments standardisés sont utilisés :\n\n— Cambridge Depersonalization Scale (Sierra & Berrios, 2000) : 29 items, score 0–1044, mesure de la fréquence × durée des expériences de dépersonnalisation sur 6 mois. Seuil clinique indicatif : 70 points. α de Cronbach = 0,89.\n\n— STAI-Y2, sous-échelle trait (Spielberger, 1983 ; version française Bruchon-Schweitzer & Paulhan, 1993) : 20 items, score 20–80. α > 0,85. Mesure de la disposition stable à l'anxiété.\n\n— PHQ-9 (Kroenke, Spitzer & Williams, 2001 ; version française Cohidon et al., 2012) : 9 items, score 0–27. α = 0,85. Sensibilité 88 %, spécificité 88 % au seuil de 10.",
      },
      {
        anchor: "5.5",
        title: "Plan d'analyse statistique",
        body:
          "Trois étapes successives :\n\n1. Statistiques descriptives : moyennes, écarts-types, médianes, min/max, indices d'asymétrie et d'aplatissement. Tests de normalité (Shapiro-Wilk).\n\n2. Analyses corrélationnelles : corrélations de Pearson (Spearman en cas de non-normalité) entre CDS, STAI-Y2 et PHQ-9. Seuil α = 0,05 avec correction de Bonferroni. Interprétation Cohen (1988) : r = 0,10 / 0,30 / 0,50.\n\n3. Régression linéaire multiple : variable dépendante = CDS, prédicteurs = STAI-Y2 + PHQ-9 (méthode simultanée). Covariables : âge, genre. Vérification des postulats : normalité des résidus, homoscédasticité, absence de multicolinéarité (VIF), indépendance des résidus (Durbin-Watson).",
      },
      {
        anchor: "5.6",
        title: "Biais méthodologiques",
        body:
          "Quatre familles de biais discutées :\n\n— Biais de sélection : recrutement de volontaires sensibles aux thématiques psychologiques, risque de surestimation des niveaux et des corrélations. Généralisation limitée à des populations similaires.\n\n— Biais de mesure : variance commune (auto-évaluation), structure multiplicative de la CDS produisant des distributions asymétriques en population non clinique.\n\n— Biais de confusion : variables non contrôlées — antécédents traumatiques, privation de sommeil, consommation de caféine / alcool, médicaments psychotropes.\n\n— Puissance statistique (§5.6.4) : à finaliser via G*Power (Faul et al., 2007).",
      },
    ],
  },
];

// Helper to look up chapter prose by id.
export function chapterProseById(
  id: string
): ChapterProse | undefined {
  return PFE_CHAPTER_PROSE.find((c) => c.chapterId === id);
}

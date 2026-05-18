// Scorable internship grid templates.
//
// Ships the first real template — "Grille clinique d'évaluation des
// capacités" — with 14 items across 3 domains. Each item carries
// the optional summary phrases the text generator uses when the
// item lands on EC / NA / A. The 12 follow-up templates the
// suggestion logic references are intentionally not yet built —
// the suggestion surface tells the user "next: <key>" and they can
// add the template later. That keeps this PR honest about what's
// shipped vs scaffolded.

import type { ScorableGridTemplate } from "./scorable-grids";

const LICENSING_NOTE =
  "Structured shell only. Use official materials and the published manual when administering copyrighted instruments.";

export const GRILLE_CAPACITES: ScorableGridTemplate = {
  id: "grille-capacites-v1",
  name: "Grille clinique d'évaluation des capacités",
  description:
    "Évaluation clinique structurée des capacités attentionnelles, mnésiques et perceptives. Cotation par item : A (acquis) · EC (en cours) · NA (non acquis) · N/O (non observé).",
  observationsHeading: "Observations cliniques générales",
  licensingNote: LICENSING_NOTE,
  advancedFollowUpKeys: [
    "grille-taches-structurees-avancees",
    "grille-generalisation",
    "grille-autonomie-tache",
  ],
  domains: [
    {
      id: "attention-disponibilite",
      label: "Attention et disponibilité",
      followUpGridKeys: [
        "grille-attention-soutenue",
        "grille-engagement-tache",
        "grille-tolerance-attente",
        "grille-distractibilite",
      ],
      items: [
        {
          id: "attention-position-assise",
          label: "Maintient la position assise pendant l'activité",
          ecOrNaPhrase:
            "Le maintien de la position assise reste difficile à soutenir et doit être progressivement renforcé.",
        },
        {
          id: "attention-prenom",
          label: "S'oriente à l'appel de son prénom",
          ecOrNaPhrase:
            "L'orientation à l'appel du prénom reste fragile et doit être travaillée dans différents contextes.",
          aPhrase:
            "L'orientation à l'appel du prénom est mobilisable de manière fiable.",
        },
        {
          id: "attention-conjointe",
          label: "Maintient une attention conjointe avec l'adulte",
          ecOrNaPhrase:
            "L'attention conjointe avec l'adulte demeure fluctuante, ce qui peut limiter les opportunités d'apprentissage relationnel.",
          aPhrase:
            "L'attention conjointe avec l'adulte est disponible et soutient les échanges.",
        },
        {
          id: "attention-engagement",
          label: "Reste engagé sur une tâche structurée pendant quelques minutes",
          ecOrNaPhrase:
            "L'engagement sur une tâche structurée reste court et nécessite un étayage soutenu.",
          aPhrase:
            "L'engagement sur une tâche structurée est mobilisé sur des durées exploitables.",
        },
        {
          id: "attention-tolerance",
          label: "Tolère l'attente de courte durée",
          ecOrNaPhrase:
            "La tolérance à l'attente est encore limitée et constitue un objectif de travail.",
        },
        {
          id: "attention-distracteurs",
          label: "Résiste aux distracteurs de l'environnement",
          ecOrNaPhrase:
            "La résistance aux distracteurs environnementaux demeure limitée, ce qui peut impacter la disponibilité attentionnelle.",
          aPhrase:
            "La résistance aux distracteurs est suffisante pour soutenir le travail en séance.",
        },
      ],
    },
    {
      id: "memoire-evocation",
      label: "Mémoire et évocation",
      followUpGridKeys: [
        "grille-memoire-visuelle-courte",
        "grille-reconnaissance-rappel",
      ],
      items: [
        {
          id: "memoire-objet-cache",
          label: "Retient l'emplacement d'un objet caché",
          ecOrNaPhrase:
            "Le maintien en mémoire de l'emplacement d'un objet caché est inconstant.",
          aPhrase:
            "Le maintien en mémoire de l'emplacement d'un objet caché est mobilisable.",
        },
        {
          id: "memoire-rappel-delai",
          label: "Rappelle une image ou un item après un délai bref",
          ecOrNaPhrase:
            "Le rappel d'image ou d'item après un délai bref reste fragile.",
          aPhrase:
            "Le rappel d'image ou d'item après un délai bref est mobilisable.",
        },
        {
          id: "memoire-reconnaissance",
          label: "Reconnaît un matériel déjà présenté",
          ecOrNaPhrase:
            "La reconnaissance d'un matériel déjà présenté n'est pas systématique et gagnera à être consolidée par des reprises régulières.",
          aPhrase:
            "La reconnaissance d'un matériel déjà présenté est fiable.",
        },
      ],
    },
    {
      id: "perception-discrimination",
      label: "Perception visuelle et discrimination",
      followUpGridKeys: [
        "grille-discrimination-visuelle",
        "grille-appariement-image-objet",
        "grille-tri-couleur-forme-taille",
      ],
      items: [
        {
          id: "perception-sequence-visuelle",
          label: "Restitue une petite séquence visuelle",
          ecOrNaPhrase:
            "La restitution d'une petite séquence visuelle n'est pas encore stabilisée.",
        },
        {
          id: "perception-assoc-objet-objet",
          label: "Associe objet / objet",
          ecOrNaPhrase:
            "L'association objet / objet reste à consolider.",
          aPhrase:
            "L'association objet / objet est maîtrisée.",
        },
        {
          id: "perception-assoc-image-image",
          label: "Associe image / image",
          ecOrNaPhrase:
            "L'association image / image reste à consolider.",
          aPhrase:
            "L'association image / image est maîtrisée.",
        },
        {
          id: "perception-assoc-objet-image",
          label: "Associe objet / image",
          ecOrNaPhrase:
            "L'association objet / image (compétence symbolique) reste à étayer.",
          aPhrase:
            "L'association objet / image est mobilisable, signe d'une compétence symbolique disponible.",
        },
        {
          id: "perception-tri",
          label: "Trie par couleur, forme ou taille",
          ecOrNaPhrase:
            "Les capacités de tri selon des critères simples sont encore en construction.",
          aPhrase:
            "Les capacités de discrimination visuelle sont mobilisables, notamment dans les tâches de tri selon des critères simples.",
        },
      ],
    },
  ],
};

// ─── Additional click-based grid templates ─────────────────────
//
// Each template is a self-contained scoring sheet on the same
// A / EC / NA / N/O scale, with optional EC/NA and A phrases per
// item so the clinical-text generator can compose paragraphs
// automatically. Domain follow-up keys reference labels in
// FOLLOW_UP_GRID_LABELS below.

export const GRILLE_ATTENTION_DISPONIBILITE: ScorableGridTemplate = {
  id: "grille-attention-soutenue",
  name: "Grille d'attention et disponibilité",
  description:
    "Attention soutenue, engagement dans la tâche, tolérance à l'attente, résistance aux distracteurs.",
  observationsHeading: "Observations cliniques sur l'attention",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "attention-soutenue",
      label: "Attention soutenue",
      followUpGridKeys: [
        "grille-tolerance-attente",
        "grille-distractibilite",
      ],
      items: [
        {
          id: "att-2min",
          label: "Maintient l'attention sur une tâche pendant 2 minutes",
          ecOrNaPhrase:
            "L'attention soutenue sur une courte tâche reste limitée et doit être renforcée progressivement.",
          aPhrase:
            "L'attention sur 2 minutes est mobilisable sur des tâches motivantes.",
        },
        {
          id: "att-5min",
          label: "Maintient l'attention sur une tâche pendant 5 minutes",
          ecOrNaPhrase:
            "L'attention sur 5 minutes n'est pas encore stabilisée.",
          aPhrase:
            "L'attention sur 5 minutes est disponible et soutient le travail clinique.",
        },
        {
          id: "att-recentrage",
          label: "Se recentre sur la tâche après une distraction",
          ecOrNaPhrase:
            "Le recentrage après distraction nécessite une guidance verbale ou gestuelle.",
        },
        {
          id: "att-changement-consigne",
          label: "Maintient l'attention malgré un changement de consigne",
          ecOrNaPhrase:
            "Le maintien de l'attention lors d'un changement de consigne est fragile.",
        },
      ],
    },
    {
      id: "engagement-tache",
      label: "Engagement dans la tâche",
      followUpGridKeys: ["grille-engagement-tache"],
      items: [
        {
          id: "eng-initiation",
          label: "Initie la tâche sans incitation",
          ecOrNaPhrase:
            "L'initiation autonome de la tâche n'est pas encore acquise.",
          aPhrase:
            "L'initiation autonome de la tâche est mobilisable.",
        },
        {
          id: "eng-persistance",
          label: "Persiste face à une difficulté",
          ecOrNaPhrase:
            "La persistance face à la difficulté est limitée et l'abandon est rapide.",
        },
        {
          id: "eng-finalisation",
          label: "Finalise une tâche entamée",
          ecOrNaPhrase:
            "La finalisation d'une tâche entamée n'est pas systématique.",
          aPhrase:
            "La finalisation d'une tâche entamée est mobilisable.",
        },
      ],
    },
    {
      id: "tolerance-attente",
      label: "Tolérance à l'attente",
      followUpGridKeys: ["grille-tolerance-attente"],
      items: [
        {
          id: "att-tour",
          label: "Attend son tour dans une activité partagée",
          ecOrNaPhrase:
            "L'attente de son tour reste difficile à soutenir.",
        },
        {
          id: "att-fin-activite",
          label: "Attend la fin d'une activité de l'adulte",
          ecOrNaPhrase:
            "L'attente que l'adulte termine son action n'est pas encore stabilisée.",
        },
      ],
    },
  ],
};

export const GRILLE_COMMUNICATION_EXPRESSIVE: ScorableGridTemplate = {
  id: "grille-communication-expressive",
  name: "Grille de communication expressive",
  description:
    "Modalités expressives : demandes, refus, désignation, commentaires, combinaisons.",
  observationsHeading: "Observations cliniques sur l'expression",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "demandes-refus",
      label: "Demandes et refus",
      followUpGridKeys: ["grille-appariement-image-objet"],
      items: [
        {
          id: "exp-demande-objet",
          label: "Demande un objet présent (geste, mot ou pictogramme)",
          aPhrase:
            "La demande d'objet présent est mobilisable et fonctionnelle.",
          ecOrNaPhrase:
            "La demande d'un objet présent est en émergence et nécessite encore un étayage.",
        },
        {
          id: "exp-refus-fonctionnel",
          label: "Exprime un refus de manière fonctionnelle",
          ecOrNaPhrase:
            "L'expression fonctionnelle du refus n'est pas stabilisée et passe parfois par un comportement-écho.",
          aPhrase:
            "Le refus est exprimé de manière fonctionnelle, sans recours à un comportement-écho.",
        },
        {
          id: "exp-aide",
          label: "Demande de l'aide en cas de difficulté",
          ecOrNaPhrase:
            "La demande d'aide en cas de difficulté n'est pas encore systématique.",
          aPhrase:
            "La demande d'aide est mobilisable face à une difficulté.",
        },
      ],
    },
    {
      id: "designation-commentaire",
      label: "Désignation et commentaire",
      items: [
        {
          id: "exp-pointage",
          label: "Pointe pour désigner un objet ou un événement",
          ecOrNaPhrase:
            "Le pointage de désignation n'est pas encore acquis comme outil de partage.",
          aPhrase:
            "Le pointage de désignation est mobilisable pour partager.",
        },
        {
          id: "exp-nommer",
          label: "Nomme un objet ou une image",
          ecOrNaPhrase:
            "La désignation par le nom est en cours d'acquisition.",
          aPhrase:
            "La désignation par le nom est mobilisable sur un vocabulaire fonctionnel.",
        },
        {
          id: "exp-commenter",
          label: "Commente spontanément ce qu'il voit/fait",
          ecOrNaPhrase:
            "Le commentaire spontané est rare ; les énoncés sont essentiellement instrumentaux.",
          aPhrase:
            "Le commentaire spontané est présent et soutient l'échange.",
        },
      ],
    },
    {
      id: "combinaisons-syntaxe",
      label: "Combinaisons et syntaxe",
      followUpGridKeys: ["grille-discrimination-visuelle"],
      items: [
        {
          id: "exp-2-mots",
          label: "Combine deux mots ou pictogrammes",
          ecOrNaPhrase:
            "La combinaison de deux unités est en cours et reste contextuelle.",
          aPhrase:
            "La combinaison de deux unités est disponible.",
        },
        {
          id: "exp-3-mots",
          label: "Combine trois mots ou pictogrammes",
          ecOrNaPhrase:
            "Les combinaisons à trois unités ne sont pas encore disponibles.",
        },
      ],
    },
  ],
};

export const GRILLE_COMMUNICATION_RECEPTIVE: ScorableGridTemplate = {
  id: "grille-communication-receptive",
  name: "Grille de communication réceptive",
  description:
    "Compréhension verbale, consignes simples et complexes, désignation sur demande.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "reception-consignes",
      label: "Compréhension des consignes",
      followUpGridKeys: ["grille-discrimination-visuelle"],
      items: [
        {
          id: "rec-consigne-simple",
          label: "Exécute une consigne simple (« assieds-toi », « viens »)",
          aPhrase:
            "Les consignes simples sont comprises et exécutées sans étayage.",
          ecOrNaPhrase:
            "Les consignes simples sont parfois comprises, mais nécessitent encore un étayage gestuel ou contextuel.",
        },
        {
          id: "rec-consigne-double",
          label: "Exécute une consigne double (« prends X et donne-le à Y »)",
          ecOrNaPhrase:
            "Les consignes doubles ne sont pas encore traitées de manière fiable.",
          aPhrase:
            "Les consignes doubles sont comprises et exécutées.",
        },
      ],
    },
    {
      id: "reception-designation",
      label: "Désignation et reconnaissance",
      items: [
        {
          id: "rec-designe-objet",
          label: "Désigne un objet sur demande",
          ecOrNaPhrase:
            "La désignation d'objet sur demande reste fragile.",
          aPhrase:
            "La désignation d'objet sur demande est mobilisable.",
        },
        {
          id: "rec-designe-image",
          label: "Désigne une image sur demande",
          ecOrNaPhrase:
            "La désignation d'image sur demande n'est pas encore stabilisée.",
          aPhrase:
            "La désignation d'image sur demande est mobilisable.",
        },
        {
          id: "rec-categorie",
          label: "Reconnaît un objet par sa catégorie (« montre quelque chose à manger »)",
          ecOrNaPhrase:
            "La reconnaissance par catégorie reste à consolider.",
        },
      ],
    },
  ],
};

export const GRILLE_INTERACTION_SOCIALE: ScorableGridTemplate = {
  id: "grille-interaction-sociale",
  name: "Grille d'interaction sociale",
  description:
    "Approche sociale, réponse à l'autre, tour de rôle, partage d'intérêt, jeu interactif.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "approche-reponse",
      label: "Approche et réponse",
      followUpGridKeys: [
        "grille-interaction-sociale",
        "grille-attention-conjointe",
      ],
      items: [
        {
          id: "soc-approche-adulte",
          label: "S'approche de l'adulte pour solliciter une interaction",
          ecOrNaPhrase:
            "L'approche spontanée de l'adulte est rare et davantage instrumentale.",
          aPhrase:
            "L'approche spontanée de l'adulte pour interagir est mobilisable.",
        },
        {
          id: "soc-approche-pair",
          label: "S'approche d'un pair pour interagir",
          ecOrNaPhrase:
            "L'approche d'un pair est rare ; le jeu reste majoritairement parallèle.",
        },
        {
          id: "soc-reponse-sollicitation",
          label: "Répond à une sollicitation sociale de l'adulte",
          ecOrNaPhrase:
            "La réponse à une sollicitation sociale est inconstante.",
          aPhrase:
            "La réponse aux sollicitations sociales est disponible.",
        },
      ],
    },
    {
      id: "tour-de-role",
      label: "Tour de rôle et partage",
      followUpGridKeys: ["grille-interaction-sociale"],
      items: [
        {
          id: "soc-tour-role",
          label: "Respecte le tour de rôle dans une activité partagée",
          ecOrNaPhrase:
            "Le tour de rôle reste à étayer ; l'attente du tour est difficile.",
          aPhrase:
            "Le tour de rôle est respecté dans une activité partagée.",
        },
        {
          id: "soc-partage-interet",
          label: "Partage un intérêt avec l'adulte",
          ecOrNaPhrase:
            "Le partage d'intérêt avec l'adulte est rare.",
          aPhrase:
            "Le partage d'intérêt avec l'adulte est mobilisable.",
        },
        {
          id: "soc-jeu-interactif",
          label: "Participe à un jeu interactif simple",
          ecOrNaPhrase:
            "Le jeu interactif reste à construire.",
        },
      ],
    },
  ],
};

export const GRILLE_ATTENTION_CONJOINTE: ScorableGridTemplate = {
  id: "grille-attention-conjointe",
  name: "Grille d'attention conjointe",
  description:
    "Initiation et réponse à des bids d'attention conjointe, suivi du regard et du pointage.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "ac-reponse",
      label: "Réponse à l'attention conjointe",
      items: [
        {
          id: "ac-suivi-regard",
          label: "Suit le regard de l'adulte vers un objet",
          ecOrNaPhrase:
            "Le suivi du regard de l'adulte vers un objet n'est pas encore acquis.",
          aPhrase:
            "Le suivi du regard de l'adulte est disponible.",
        },
        {
          id: "ac-suivi-pointage",
          label: "Suit le pointage de l'adulte vers un objet",
          ecOrNaPhrase:
            "La réponse au pointage de l'adulte reste fragile.",
          aPhrase:
            "La réponse au pointage de l'adulte est disponible.",
        },
      ],
    },
    {
      id: "ac-initiation",
      label: "Initiation de l'attention conjointe",
      items: [
        {
          id: "ac-pointage-partage",
          label: "Pointe pour partager (et non pour demander)",
          ecOrNaPhrase:
            "Le pointage de partage n'est pas encore disponible ; le pointage observé est essentiellement instrumental.",
          aPhrase:
            "Le pointage de partage est mobilisable.",
        },
        {
          id: "ac-regard-alternance",
          label: "Alterne son regard entre un objet et l'adulte",
          ecOrNaPhrase:
            "L'alternance du regard entre objet et adulte est rare.",
          aPhrase:
            "L'alternance du regard entre objet et adulte soutient le partage.",
        },
      ],
    },
  ],
};

export const GRILLE_REGULATION_EMOTIONNELLE: ScorableGridTemplate = {
  id: "grille-regulation-emotionnelle",
  name: "Grille de régulation émotionnelle",
  description:
    "Repérage des émotions, modalités de régulation, tolérance à la frustration et au changement.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "reg-reperage",
      label: "Repérage et expression",
      items: [
        {
          id: "reg-reperage-emotion",
          label: "Repère une émotion chez lui",
          ecOrNaPhrase:
            "Le repérage d'une émotion vécue n'est pas encore stabilisé.",
        },
        {
          id: "reg-expression-fonctionnelle",
          label: "Exprime son émotion de manière fonctionnelle",
          ecOrNaPhrase:
            "L'expression fonctionnelle de l'émotion reste à étayer.",
          aPhrase:
            "L'expression de l'émotion est fonctionnelle.",
        },
      ],
    },
    {
      id: "reg-coregulation",
      label: "Co-régulation et apaisement",
      items: [
        {
          id: "reg-acceptation-apaisement",
          label: "Accepte une stratégie d'apaisement proposée",
          ecOrNaPhrase:
            "L'acceptation d'une stratégie d'apaisement proposée n'est pas systématique.",
          aPhrase:
            "L'acceptation d'une stratégie d'apaisement proposée est mobilisable.",
        },
        {
          id: "reg-strategie-spontanee",
          label: "Utilise spontanément une stratégie de régulation",
          ecOrNaPhrase:
            "L'utilisation spontanée d'une stratégie de régulation est rare.",
          aPhrase:
            "Une stratégie de régulation est utilisée de manière spontanée.",
        },
      ],
    },
    {
      id: "reg-tolerance",
      label: "Tolérance à la frustration",
      items: [
        {
          id: "reg-tol-attente",
          label: "Tolère une attente courte sans désorganisation",
          ecOrNaPhrase:
            "La tolérance à une attente courte est limitée.",
        },
        {
          id: "reg-tol-refus",
          label: "Tolère un refus / un changement sans désorganisation",
          ecOrNaPhrase:
            "La tolérance à un refus ou un changement reste à construire.",
        },
      ],
    },
  ],
};

export const GRILLE_TRAITEMENT_SENSORIEL: ScorableGridTemplate = {
  id: "grille-traitement-sensoriel",
  name: "Grille de traitement sensoriel",
  description:
    "Observation des modalités sensorielles : auditif, visuel, tactile, proprioceptif, vestibulaire, oral.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "sens-hyper",
      label: "Hyperréactivité",
      items: [
        {
          id: "sens-auditif",
          label: "Hyperréactivité aux stimulations auditives",
          ecOrNaPhrase:
            "Une hyperréactivité aux stimulations auditives semble influencer la disponibilité attentionnelle.",
        },
        {
          id: "sens-tactile",
          label: "Hyperréactivité aux stimulations tactiles",
          ecOrNaPhrase:
            "Une hyperréactivité tactile est observée et peut entraver certaines activités.",
        },
        {
          id: "sens-visuel",
          label: "Hyperréactivité aux stimulations visuelles",
          ecOrNaPhrase:
            "Une hyperréactivité aux stimulations visuelles est observée.",
        },
      ],
    },
    {
      id: "sens-hypo",
      label: "Hyporéactivité et recherche sensorielle",
      items: [
        {
          id: "sens-prop",
          label: "Recherche d'inputs proprioceptifs (pressions, poussées)",
          ecOrNaPhrase:
            "Une recherche d'inputs proprioceptifs est observée comme stratégie de régulation.",
        },
        {
          id: "sens-vest",
          label: "Recherche d'inputs vestibulaires (balancement, tournis)",
          ecOrNaPhrase:
            "Une recherche d'inputs vestibulaires est observée.",
        },
        {
          id: "sens-oral",
          label: "Comportements de recherche orale",
          ecOrNaPhrase:
            "Des comportements de recherche orale sont observés en moments de stress.",
        },
      ],
    },
  ],
};

export const GRILLE_AUTONOMIE_ADAPTATION: ScorableGridTemplate = {
  id: "grille-autonomie-adaptation",
  name: "Grille d'autonomie et adaptation",
  description:
    "Autonomie de base (repas, habillage, hygiène), participation aux routines, sécurité.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "auto-base",
      label: "Autonomie de base",
      followUpGridKeys: [
        "grille-autonomie",
        "grille-daily-living-skills-grid",
      ],
      items: [
        {
          id: "auto-repas",
          label: "Mange seul à la cuillère / à la fourchette",
          aPhrase:
            "L'autonomie au repas est mobilisable.",
          ecOrNaPhrase:
            "L'autonomie au repas reste partielle et nécessite un soutien adulte.",
        },
        {
          id: "auto-habillage",
          label: "Enlève / met seul une partie du vêtement",
          ecOrNaPhrase:
            "L'habillage autonome reste à étayer.",
          aPhrase:
            "L'habillage autonome est mobilisable sur les pièces simples.",
        },
        {
          id: "auto-hygiene",
          label: "Se lave les mains de manière autonome",
          ecOrNaPhrase:
            "Le lavage des mains autonome n'est pas encore stabilisé.",
        },
      ],
    },
    {
      id: "auto-routines",
      label: "Routines et participation",
      followUpGridKeys: ["grille-routine-participation"],
      items: [
        {
          id: "auto-rangement",
          label: "Participe au rangement de la séance",
          ecOrNaPhrase:
            "La participation au rangement reste à étayer.",
        },
        {
          id: "auto-transition",
          label: "Suit la transition entre deux activités",
          ecOrNaPhrase:
            "Les transitions entre activités demeurent difficiles et nécessitent un support visuel.",
          aPhrase:
            "Les transitions entre activités sont gérées de manière fluide.",
        },
      ],
    },
  ],
};

export const GRILLE_IMITATION_MOTRICE: ScorableGridTemplate = {
  id: "grille-imitation-motrice",
  name: "Grille d'imitation motrice",
  description:
    "Imitation gestuelle simple, séquentielle et symbolique.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "imit-simple",
      label: "Imitation simple",
      items: [
        {
          id: "imit-gestes-simples",
          label: "Imite un geste simple sur démonstration",
          ecOrNaPhrase:
            "L'imitation d'un geste simple est en cours.",
          aPhrase:
            "L'imitation d'un geste simple sur démonstration est mobilisable.",
        },
        {
          id: "imit-action-objet",
          label: "Imite une action avec un objet (taper, secouer, faire rouler)",
          ecOrNaPhrase:
            "L'imitation d'action avec objet reste à étayer.",
        },
      ],
    },
    {
      id: "imit-sequentielle",
      label: "Imitation séquentielle / symbolique",
      items: [
        {
          id: "imit-sequence-2",
          label: "Imite une séquence de 2 gestes",
          ecOrNaPhrase:
            "L'imitation d'une séquence de 2 gestes n'est pas encore stabilisée.",
        },
        {
          id: "imit-faire-semblant",
          label: "Imite une action de « faire semblant »",
          ecOrNaPhrase:
            "L'imitation de « faire semblant » est rare ; le jeu reste principalement fonctionnel.",
        },
      ],
    },
  ],
};

export const GRILLE_JEU_SYMBOLIQUE: ScorableGridTemplate = {
  id: "grille-jeu-symbolique",
  name: "Grille de jeu fonctionnel et symbolique",
  description:
    "Du jeu d'exploration au jeu fonctionnel et symbolique partagé.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "jeu-fonctionnel",
      label: "Jeu fonctionnel",
      items: [
        {
          id: "jeu-utilisation-conventionnelle",
          label: "Utilise un objet selon sa fonction conventionnelle",
          ecOrNaPhrase:
            "L'utilisation conventionnelle des objets est en cours.",
          aPhrase:
            "L'utilisation conventionnelle des objets est disponible.",
        },
        {
          id: "jeu-sequence-fonctionnelle",
          label: "Enchaîne une séquence fonctionnelle (verser, boire, essuyer)",
          ecOrNaPhrase:
            "Les séquences fonctionnelles ne sont pas encore enchaînées spontanément.",
        },
      ],
    },
    {
      id: "jeu-symbolique",
      label: "Jeu symbolique",
      items: [
        {
          id: "jeu-substitution",
          label: "Utilise un objet pour un autre (substitution)",
          ecOrNaPhrase:
            "La substitution dans le jeu est rare.",
        },
        {
          id: "jeu-scenario-partage",
          label: "Partage un scénario de jeu avec l'adulte",
          ecOrNaPhrase:
            "Le partage d'un scénario de jeu reste à construire.",
        },
      ],
    },
  ],
};

export const GRILLE_TRANSITIONS_FLEXIBILITE: ScorableGridTemplate = {
  id: "grille-transitions-flexibilite",
  name: "Grille de transitions et flexibilité",
  description:
    "Transitions entre activités, tolérance au changement, flexibilité comportementale.",
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "trans-activites",
      label: "Transitions entre activités",
      items: [
        {
          id: "trans-preavis",
          label: "Accepte une transition annoncée à l'avance",
          ecOrNaPhrase:
            "Les transitions annoncées restent encore à étayer.",
          aPhrase:
            "Les transitions annoncées sont gérées sans désorganisation.",
        },
        {
          id: "trans-imprevue",
          label: "Tolère une transition imprévue",
          ecOrNaPhrase:
            "Les transitions imprévues sont sources de désorganisation et nécessitent un accompagnement systématique.",
        },
      ],
    },
    {
      id: "trans-flexibilite",
      label: "Flexibilité",
      items: [
        {
          id: "flex-changement-materiel",
          label: "Accepte un changement de matériel",
          ecOrNaPhrase:
            "Le changement de matériel est mal toléré.",
        },
        {
          id: "flex-nouvelle-personne",
          label: "Accepte une nouvelle personne dans l'activité",
          ecOrNaPhrase:
            "L'arrivée d'une nouvelle personne dans l'activité reste à étayer.",
        },
      ],
    },
  ],
};

export const SCORABLE_TEMPLATES: ScorableGridTemplate[] = [
  GRILLE_CAPACITES,
  GRILLE_ATTENTION_DISPONIBILITE,
  GRILLE_COMMUNICATION_EXPRESSIVE,
  GRILLE_COMMUNICATION_RECEPTIVE,
  GRILLE_INTERACTION_SOCIALE,
  GRILLE_ATTENTION_CONJOINTE,
  GRILLE_REGULATION_EMOTIONNELLE,
  GRILLE_TRAITEMENT_SENSORIEL,
  GRILLE_AUTONOMIE_ADAPTATION,
  GRILLE_IMITATION_MOTRICE,
  GRILLE_JEU_SYMBOLIQUE,
  GRILLE_TRANSITIONS_FLEXIBILITE,
];

export function findScorableTemplate(
  id: string
): ScorableGridTemplate | undefined {
  return SCORABLE_TEMPLATES.find((t) => t.id === id);
}

// Friendly labels for follow-up grid keys the suggestion engine
// may surface — so the UI can show "Attention soutenue grid" even
// when no template exists yet.
export const FOLLOW_UP_GRID_LABELS: Record<string, string> = {
  "grille-attention-soutenue": "Attention soutenue",
  "grille-engagement-tache": "Engagement dans la tâche",
  "grille-tolerance-attente": "Tolérance à l'attente",
  "grille-distractibilite": "Distractibilité (observation)",
  "grille-memoire-visuelle-courte": "Mémoire visuelle courte durée",
  "grille-reconnaissance-rappel": "Reconnaissance et rappel",
  "grille-discrimination-visuelle": "Discrimination visuelle",
  "grille-appariement-image-objet": "Appariement image / objet",
  "grille-tri-couleur-forme-taille": "Tri couleur / forme / taille",
  "grille-taches-structurees-avancees": "Tâches structurées avancées",
  "grille-generalisation": "Généralisation",
  "grille-autonomie-tache": "Autonomie dans la tâche",
  // Templates that DO exist in this PR — the suggestion engine can
  // point directly at administrable templates.
  "grille-communication-expressive": "Communication expressive",
  "grille-communication-receptive": "Communication réceptive",
  "grille-interaction-sociale": "Interaction sociale",
  "grille-attention-conjointe": "Attention conjointe",
  "grille-regulation-emotionnelle": "Régulation émotionnelle",
  "grille-traitement-sensoriel": "Traitement sensoriel",
  "grille-autonomie-adaptation": "Autonomie et adaptation",
  "grille-imitation-motrice": "Imitation motrice",
  "grille-jeu-symbolique": "Jeu fonctionnel et symbolique",
  "grille-transitions-flexibilite": "Transitions et flexibilité",
  "grille-routine-participation": "Participation aux routines",
  "grille-autonomie": "Autonomie dans la tâche",
  "grille-daily-living-skills-grid": "Compétences de vie quotidienne",
};

export function followUpGridLabel(key: string): string {
  return FOLLOW_UP_GRID_LABELS[key] ?? key;
}

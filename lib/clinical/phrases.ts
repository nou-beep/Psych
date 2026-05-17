// Multilingual Clinical Language System — curated phrase library
// across English / French / Arabic with categories the clinician can
// pull from when writing reports, clinical notes, or psychoeducation.

export type Lang = "en" | "fr" | "ar";

export type PhraseCategory =
  | "symptom"
  | "report"
  | "psychoeducation"
  | "intervention"
  | "documentation"
  | "clinical-note";

export interface ClinicalPhrase {
  id: string;
  category: PhraseCategory;
  topic: string;
  en: string;
  fr: string;
  ar: string;
  tags: string[];
}

export const CLINICAL_PHRASES: ClinicalPhrase[] = [
  // Symptom descriptions
  {
    id: "anxiety-1",
    category: "symptom",
    topic: "anxiety",
    en: "The client reports persistent worry across multiple domains, accompanied by somatic tension and sleep disturbance.",
    fr: "Le client rapporte une inquiétude persistante touchant plusieurs domaines, accompagnée de tension somatique et de troubles du sommeil.",
    ar: "يصف العميل قلقًا مستمرًا يشمل عدة مجالات، مصحوبًا بتوتر جسدي واضطراب في النوم.",
    tags: ["anxiety", "symptom-description"],
  },
  {
    id: "dpdr-1",
    category: "symptom",
    topic: "depersonalization",
    en: "The client describes recurrent experiences of feeling detached from their own body, with intact reality testing.",
    fr: "Le client décrit des expériences récurrentes de détachement par rapport à son propre corps, avec un sens de la réalité préservé.",
    ar: "يصف العميل خبرات متكررة من الانفصال عن جسده الخاص، مع احتفاظه بإدراك الواقع.",
    tags: ["depersonalization", "dpdr", "symptom-description"],
  },
  {
    id: "regulation-1",
    category: "symptom",
    topic: "emotional dysregulation",
    en: "Marked difficulty modulating affective intensity was noted, particularly under interpersonal stress.",
    fr: "On note une difficulté marquée à moduler l'intensité affective, en particulier en situation de stress interpersonnel.",
    ar: "لوحظت صعوبة واضحة في تنظيم شدة الانفعالات، خاصة في سياق الضغط بين الأشخاص.",
    tags: ["dysregulation", "symptom-description"],
  },

  // Report phrasing
  {
    id: "rpt-mood",
    category: "report",
    topic: "mood",
    en: "Mood was reported as low; affect appeared restricted and congruent.",
    fr: "L'humeur rapportée était basse ; l'affect apparaissait restreint et congruent.",
    ar: "كان المزاج المُبلَّغ عنه منخفضًا؛ وبدا الانفعال مقيدًا ومتسقًا.",
    tags: ["mood", "msge", "report"],
  },
  {
    id: "rpt-engagement",
    category: "report",
    topic: "engagement",
    en: "The client engaged collaboratively throughout the session.",
    fr: "Le client s'est engagé de manière collaborative tout au long de la séance.",
    ar: "تعاون العميل بشكل بنّاء طوال الجلسة.",
    tags: ["engagement", "alliance"],
  },
  {
    id: "rpt-risk",
    category: "report",
    topic: "risk",
    en: "No active suicidal ideation, plan, or intent was endorsed at this time.",
    fr: "Aucune idéation suicidaire active, plan ou intention n'a été rapporté à ce stade.",
    ar: "لم يُذكر في الوقت الحالي وجود أفكار انتحارية فعّالة أو خطة أو نية.",
    tags: ["risk", "documentation"],
  },

  // Intervention phrasing
  {
    id: "int-grounding",
    category: "intervention",
    topic: "grounding",
    en: "A sensory grounding intervention (5-4-3-2-1) was introduced and practised in session.",
    fr: "Une intervention d'ancrage sensoriel (5-4-3-2-1) a été introduite et pratiquée en séance.",
    ar: "تم تقديم تدخل تأريض حسي (5-4-3-2-1) والتدرب عليه في الجلسة.",
    tags: ["grounding", "intervention"],
  },
  {
    id: "int-cbt",
    category: "intervention",
    topic: "cbt",
    en: "Cognitive restructuring was used to identify and reframe automatic thoughts.",
    fr: "Une restructuration cognitive a été utilisée pour identifier et reformuler les pensées automatiques.",
    ar: "تم استخدام إعادة الهيكلة المعرفية لتحديد الأفكار التلقائية وإعادة صياغتها.",
    tags: ["cbt", "intervention"],
  },

  // Psychoeducation
  {
    id: "pe-anxiety",
    category: "psychoeducation",
    topic: "anxiety",
    en: "Anxiety is a protective response that becomes problematic when it fires in the absence of real threat.",
    fr: "L'anxiété est une réponse protectrice qui devient problématique lorsqu'elle se déclenche en l'absence de menace réelle.",
    ar: "القلق استجابة وقائية تصبح مُشكلة عندما تظهر في غياب تهديد حقيقي.",
    tags: ["anxiety", "psychoeducation"],
  },
  {
    id: "pe-dpdr",
    category: "psychoeducation",
    topic: "dpdr",
    en: "Depersonalization and derealization are common, often transient, dissociative experiences linked to overwhelm.",
    fr: "La dépersonnalisation et la déréalisation sont des expériences dissociatives fréquentes, souvent transitoires, liées au sentiment d'être submergé.",
    ar: "تبدد الشخصية وتبدد الواقع خبرتان انفصاليتان شائعتان وكثيرًا ما تكونان عابرتين، وترتبطان بالشعور بالغمر.",
    tags: ["dpdr", "psychoeducation"],
  },

  // Documentation
  {
    id: "doc-followup",
    category: "documentation",
    topic: "follow-up",
    en: "Follow-up agreed for next week; risk re-assessed and stable.",
    fr: "Suivi convenu pour la semaine prochaine ; le risque a été réévalué et reste stable.",
    ar: "تم الاتفاق على متابعة الأسبوع المقبل؛ وتمت إعادة تقييم المخاطر وكانت مستقرة.",
    tags: ["follow-up", "documentation"],
  },

  // Clinical notes
  {
    id: "cn-alliance",
    category: "clinical-note",
    topic: "alliance",
    en: "Therapeutic alliance appears strong; client volunteered new disclosure today.",
    fr: "L'alliance thérapeutique semble solide ; le client a fait une nouvelle confidence aujourd'hui.",
    ar: "يبدو التحالف العلاجي قويًا؛ وقد قدّم العميل اليوم إفصاحًا جديدًا.",
    tags: ["alliance", "clinical-note"],
  },
];

export function phrasesInCategory(category: PhraseCategory): ClinicalPhrase[] {
  return CLINICAL_PHRASES.filter((p) => p.category === category);
}

export function phrasesByTopic(topic: string): ClinicalPhrase[] {
  return CLINICAL_PHRASES.filter((p) => p.topic === topic);
}

export function searchPhrases(query: string, lang?: Lang): ClinicalPhrase[] {
  const q = query.trim().toLowerCase();
  if (!q) return CLINICAL_PHRASES;
  return CLINICAL_PHRASES.filter((p) => {
    const hay =
      lang === "fr"
        ? p.fr.toLowerCase()
        : lang === "ar"
        ? p.ar
        : `${p.en} ${p.topic} ${p.tags.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}

export function renderPhrase(p: ClinicalPhrase, lang: Lang): string {
  return lang === "fr" ? p.fr : lang === "ar" ? p.ar : p.en;
}

export const PHRASE_CATEGORY_LABELS: Record<PhraseCategory, string> = {
  symptom: "Symptom description",
  report: "Report phrasing",
  psychoeducation: "Psychoeducation",
  intervention: "Intervention",
  documentation: "Documentation",
  "clinical-note": "Clinical note",
};

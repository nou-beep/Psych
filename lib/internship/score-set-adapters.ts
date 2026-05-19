// Compat adapters between the legacy ScorableGrid types and the
// generic ScoreSet engine. Pure conversions — no copy of the
// underlying storage. Lets the engine treat the 26 existing
// templates as ScoreSet definitions without a data migration.
//
// In a follow-up PR the UI moves over to ScoreSetSection and the
// scorable-* modules become thin wrappers around these adapters.

import type {
  ScorableGridAdministration,
  ScorableGridTemplate,
  CapabilityScore,
  ItemScoreEntry,
} from "./scorable-grids";
import type {
  ScoreSetAdministration,
  ScoreSetDefinition,
  ScoreSetItemResult,
} from "./score-set";
import { acquisitionSchema, type AcquisitionValue } from "./score-set-schemas";

// ─── Template ────────────────────────────────────────────────

export function scorableGridToScoreSet(
  template: ScorableGridTemplate
): ScoreSetDefinition<AcquisitionValue> {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    observationsHeading: template.observationsHeading,
    schema: acquisitionSchema,
    domains: template.domains.map((d) => ({
      id: d.id,
      label: d.label,
      followUpKeys: d.followUpGridKeys,
      items: d.items.map((item) => ({
        id: item.id,
        label: item.label,
        // Distribute the legacy "ecOrNaPhrase" + "aPhrase" into the
        // generic phrases bag keyed by value.
        phrases: {
          ...(item.aPhrase ? { A: item.aPhrase } : {}),
          ...(item.ecOrNaPhrase
            ? { EC: item.ecOrNaPhrase, NA: item.ecOrNaPhrase }
            : {}),
        },
      })),
    })),
    advancedFollowUpKeys: template.advancedFollowUpKeys,
    licensingNote: template.licensingNote,
  };
}

// ─── Administration ──────────────────────────────────────────

export function scorableAdminToScoreSetAdmin(
  admin: ScorableGridAdministration
): ScoreSetAdministration<AcquisitionValue> {
  const results: Record<string, ScoreSetItemResult<AcquisitionValue>> = {};
  for (const [itemId, entry] of Object.entries(admin.scores) as Array<
    [string, ItemScoreEntry]
  >) {
    results[itemId] = {
      value: entry.score,
      note: entry.note,
      evidence: entry.evidence,
    };
  }
  return {
    id: admin.id,
    caseId: admin.caseId,
    templateId: admin.templateId,
    name: admin.name,
    date: admin.date,
    evaluator: admin.evaluator,
    context: admin.context,
    sessionLabel: admin.sessionLabel,
    results,
    observations: admin.observations,
    signaturePsychologue: admin.signaturePsychologue,
    visaResponsable: admin.visaResponsable,
    linkedTestId: admin.linkedTestId,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

// ─── Reverse direction (ScoreSet → ScorableGrid) ─────────────
// For the reverse path the ScoreSet must be on the acquisition
// schema. Throws (in TypeScript at runtime: returns null) for any
// other schema, since the legacy ScorableGridAdministration shape
// can only hold A/EC/NA/N-O values.

export function scoreSetAdminToScorable(
  admin: ScoreSetAdministration<string>,
  template: ScoreSetDefinition<string>
): ScorableGridAdministration | null {
  if (template.schema.id !== acquisitionSchema.id) return null;
  const scores: Record<string, ItemScoreEntry> = {};
  for (const [itemId, result] of Object.entries(admin.results)) {
    scores[itemId] = {
      score: result.value as CapabilityScore,
      note: result.note,
      evidence: result.evidence,
    };
  }
  return {
    id: admin.id,
    caseId: admin.caseId,
    templateId: admin.templateId,
    name: admin.name,
    date: admin.date,
    evaluator: admin.evaluator,
    context: admin.context,
    sessionLabel: admin.sessionLabel,
    scores,
    observations: admin.observations,
    signaturePsychologue: admin.signaturePsychologue,
    visaResponsable: admin.visaResponsable,
    linkedTestId: admin.linkedTestId,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

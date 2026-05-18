// Barrel for the structured-input primitive library. Use these
// everywhere a clinical workflow needs chips / segmented controls /
// rating scales / collapsed notes / generated text panels —
// instead of blank textareas.

export { ChipSelect, type ChipOption } from "./ChipSelect";
export {
  MultiChipSelect,
  type MultiChipOption,
} from "./MultiChipSelect";
export {
  SegmentedScore,
  type SegmentedOption,
} from "./SegmentedScore";
export { RatingScale } from "./RatingScale";
export { OptionalNoteCollapse } from "./OptionalNoteCollapse";
export { GeneratedTextBlock } from "./GeneratedTextBlock";

export {
  FREQUENCY_OPTIONS,
  INTENSITY_OPTIONS,
  SUPPORT_LEVEL_OPTIONS,
  ACQUISITION_OPTIONS,
  CLINICAL_CONFIDENCE_OPTIONS,
  CONTEXT_OPTIONS,
  RESPONSE_QUALITY_OPTIONS,
  labelOf,
  type Frequency,
  type Intensity,
  type SupportLevel,
  type Acquisition,
  type ClinicalConfidence,
  type ClinicalContext,
  type ResponseQuality,
} from "./options";

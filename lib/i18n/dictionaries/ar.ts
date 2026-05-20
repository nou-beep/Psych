// Arabic dictionary — SCAFFOLD ONLY.
//
// Starting point: the FR dictionary, re-exported as-is. This keeps
// the structural contract (every key present) and means an Arabic
// user falls through to French strings rather than English, which
// matches the Maghreb bilingual context.
//
// To complete the Arabic locale:
// 1. Translate keys here one namespace at a time.
// 2. Once a namespace is done, remove that namespace from the
//    re-exported FR_DICT and replace with the Arabic version.
// 3. Add "ar" to EXPOSED_LOCALES in lib/i18n/index.ts.
// 4. Test RTL rendering with `dir="rtl"` on <html>.

import { FR_DICT } from "./fr";
import type { AppDictionary } from "./en";

export const AR_DICT: AppDictionary = FR_DICT;

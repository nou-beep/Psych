// Theme definitions for Psych.
// Each theme has an id (stored in localStorage), a display name,
// a CSS data-attribute value, and preview colors for the theme selector UI.

export interface PsychTheme {
  id: string;
  name: string;
  dataAttr: string; // value for data-psych-theme attribute on <html>
  description: string;
  preview: {
    bg: string;
    primary: string;
    accent: string;
    sidebar: string;
  };
}

export const THEMES: PsychTheme[] = [
  {
    id: "rose-clinic",
    name: "Rose Clinic",
    dataAttr: "rose-clinic",
    description: "Soft pink, cream and berry — warm and feminine",
    preview: {
      bg: "#FFF5F7",
      primary: "#F43F5E",
      accent: "#9F1239",
      sidebar: "#FFF0F3",
    },
  },
  {
    id: "sage-mind",
    name: "Sage Mind",
    dataAttr: "sage-mind",
    description: "Sage, ivory and moss — calm and grounded",
    preview: {
      bg: "#F4F7F4",
      primary: "#5A7C5A",
      accent: "#3D5C3D",
      sidebar: "#EEF3EE",
    },
  },
  {
    id: "midnight-study",
    name: "Midnight Study",
    dataAttr: "midnight-study",
    description: "Dark, lavender and charcoal — focused and elegant",
    preview: {
      bg: "#0F0F1A",
      primary: "#A78BFA",
      accent: "#7C3AED",
      sidebar: "#16213E",
    },
  },
  {
    id: "ocean-notes",
    name: "Ocean Notes",
    dataAttr: "ocean-notes",
    description: "Blue, soft cyan and slate — clear and refreshing",
    preview: {
      bg: "#F0F8FF",
      primary: "#3B82F6",
      accent: "#1E40AF",
      sidebar: "#E8F4FD",
    },
  },
  {
    id: "sunset-desk",
    name: "Sunset Desk",
    dataAttr: "sunset-desk",
    description: "Peach, coral and warm cream — vibrant and cozy",
    preview: {
      bg: "#FFF8F3",
      primary: "#F97316",
      accent: "#C2410C",
      sidebar: "#FFF0E8",
    },
  },
  {
    id: "soft-lavender",
    name: "Soft Lavender",
    dataAttr: "soft-lavender",
    description: "Lavender, white and mauve — dreamy and soft",
    preview: {
      bg: "#FAF7FF",
      primary: "#A855F7",
      accent: "#7E22CE",
      sidebar: "#F5F0FF",
    },
  },
  {
    id: "classic-minimal",
    name: "Classic Minimal",
    dataAttr: "classic-minimal",
    description: "Clean white, gray and black — timeless and sharp",
    preview: {
      bg: "#F8FAFC",
      primary: "#1E293B",
      accent: "#475569",
      sidebar: "#F1F5F9",
    },
  },
];

export const DEFAULT_THEME_ID = "rose-clinic";
export const THEME_STORAGE_KEY = "psych-theme";

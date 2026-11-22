/** Key that, with Ctrl (Windows/Linux) or Cmd (Mac), opens page search. */
export const COMMAND_PALETTE_SHORTCUT_KEY = 'k';

/** Shown between parent menu names, e.g. "Transport › Vehicles". */
export const COMMAND_PALETTE_TRAIL_SEPARATOR = ' › ';

/** Ranking: higher shows first. A match only in the parent names ranks lowest. */
export const COMMAND_PALETTE_SCORE = {
  EXACT_LABEL: 100,
  LABEL_STARTS_WITH: 80,
  LABEL_WORD_STARTS_WITH: 60,
  LABEL_CONTAINS: 40,
  TRAIL_ONLY: 20,
} as const;

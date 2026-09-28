import type { RecallPromptState, RecallRating } from '../progress/types';

export const DAY_MS = 86_400_000;
export const STAGE_INTERVALS = [0, 3, 7, 21, 45, 90] as const;

/** Ordinal for the user's local calendar date, stable across DST boundaries. */
export function dayOrdinal(timestamp: number): number {
  const date = new Date(timestamp);
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

export function timestampForDay(ordinal: number): number {
  const utc = new Date(ordinal * DAY_MS);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()).getTime();
}

export function emptyPromptState(promptId: string, topicId: string, now: number): RecallPromptState {
  return { promptId, topicId, stage: 0, lastReviewedAt: null, dueAt: now, lastRating: null, successes: 0, successfulDays: [], lapses: 0 };
}

export function ratePrompt(state: RecallPromptState, rating: RecallRating, now: number): RecallPromptState {
  let stage = state.stage;
  let gap: number;
  if (rating === 'again') {
    stage = Math.max(0, stage - 1);
    gap = 1;
  } else if (rating === 'hard') {
    gap = Math.max(1, Math.ceil(STAGE_INTERVALS[stage] / 2));
  } else if (rating === 'good') {
    stage = Math.min(STAGE_INTERVALS.length - 1, stage + 1);
    gap = STAGE_INTERVALS[stage];
  } else {
    stage = Math.min(STAGE_INTERVALS.length - 1, stage + 2);
    gap = STAGE_INTERVALS[stage];
  }
  const success = rating === 'good' || rating === 'easy';
  const today = dayOrdinal(now);
  const successfulDays = success
    ? [...new Set([...state.successfulDays, today])].sort((a, b) => a - b).slice(-12)
    : state.successfulDays;
  return {
    ...state,
    stage,
    lastReviewedAt: now,
    dueAt: timestampForDay(today + gap),
    lastRating: rating,
    successes: successfulDays.length,
    successfulDays,
    lapses: state.lapses + (rating === 'again' ? 1 : 0),
  };
}

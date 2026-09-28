import type { WeaknessEvent } from '../progress/types';
import { dayOrdinal } from './schedule';

export const UNIVERSAL_WEAKNESSES = [
  'demand-decoding', 'insufficient-dimensions', 'generic-content', 'weak-evidence',
  'factual-uncertainty', 'poor-structure', 'weak-introduction', 'weak-conclusion',
  'weak-visual-use', 'time-management', 'incomplete-answer',
] as const;

export const SOCIOLOGY_WEAKNESSES = [
  'gs-style-answer', 'weak-sociological-concepts', 'decorative-thinkers',
  'weak-empirical-grounding', 'missing-critique', 'weak-paper1-paper2-linkage',
] as const;

export interface WeaknessStatus {
  key: string;
  weaknessId: string;
  targetType: WeaknessEvent['targetType'];
  targetId: string;
  recurring: boolean;
  highSeverity: boolean;
  resolved: boolean;
  latestObservedAt: number;
  observations: number;
  demonstrations: number;
}

export function weaknessKey(event: Pick<WeaknessEvent, 'weaknessId' | 'targetType' | 'targetId'>) {
  return `${event.weaknessId}|${event.targetType}|${event.targetId}`;
}

export function weaknessStatuses(events: WeaknessEvent[]): WeaknessStatus[] {
  const groups = new Map<string, WeaknessEvent[]>();
  for (const event of events) (groups.get(weaknessKey(event)) ?? groups.set(weaknessKey(event), []).get(weaknessKey(event))!).push(event);
  return [...groups.entries()].flatMap(([key, group]) => {
    const observed = group.filter((event) => event.kind === 'observed').sort((a, b) => a.observedAt - b.observedAt);
    if (!observed.length) return [];
    const days = new Set(observed.map((event) => dayOrdinal(event.observedAt)));
    const recurring = observed.some((event) => event.severity === 3) || days.size >= 2;
    const latestObservedAt = observed.at(-1)!.observedAt;
    const demonstrations = group.filter((event) => event.kind === 'demonstrated' && event.observedAt > latestObservedAt).length;
    const first = observed[0];
    return [{ key, weaknessId: first.weaknessId, targetType: first.targetType, targetId: first.targetId, recurring, highSeverity: observed.some((event) => event.severity === 3), resolved: demonstrations >= 2, latestObservedAt, observations: observed.length, demonstrations }];
  });
}

export function hasUnresolvedHighSeverity(events: WeaknessEvent[], topicId: string): boolean {
  return weaknessStatuses(events.filter((event) => event.targetId === topicId || event.targetId.startsWith(`${topicId}#`)))
    .some((status) => status.recurring && status.highSeverity && !status.resolved);
}

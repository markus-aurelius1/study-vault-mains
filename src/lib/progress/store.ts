import type { AnswerAttempt, RecallRating, Snapshot, StorageAdapter, TopicStudyState, WeaknessEvent } from './types';
import { emptyPromptState, ratePrompt } from '../revision/schedule';

export const SNAPSHOT_VERSION = 1;
export const EMPTY: Snapshot = { version: SNAPSHOT_VERSION, topicStates: {}, promptStates: {}, attempts: {}, weaknessEvents: [], recentTopics: [] };

export function migrate(raw: unknown): Snapshot {
  if (!raw || typeof raw !== 'object') return structuredClone(EMPTY);
  const value = raw as Partial<Snapshot>;
  const promptStates = value.promptStates && typeof value.promptStates === 'object' ? value.promptStates : {};
  for (const prompt of Object.values(promptStates)) {
    prompt.successfulDays = [...new Set(Array.isArray(prompt.successfulDays) ? prompt.successfulDays.filter(Number.isInteger) : [])].sort((a, b) => a - b).slice(-12);
    prompt.successes = prompt.successfulDays.length;
  }
  return { version: SNAPSHOT_VERSION, topicStates: value.topicStates ?? {}, promptStates, attempts: value.attempts ?? {}, weaknessEvents: Array.isArray(value.weaknessEvents) ? value.weaknessEvents : [], recentTopics: Array.isArray(value.recentTopics) ? value.recentTopics.slice(0, 12) : [] };
}

const defaultTopic = (topicId: string): TopicStudyState => ({ topicId, firstStudiedAt: null, lastOpenedAt: null, studyStage: 'not-started', recallLevel: 'weak', applicationLevel: 'unpractised', lastRecallAt: null, lastPracticeAt: null, preferredMode: 'answer-kit', pinned: false });

export class ProgressStore {
  private snapshot: Snapshot = structuredClone(EMPTY);
  private listeners = new Set<() => void>();
  private adapter: StorageAdapter | null = null;
  private flush: ReturnType<typeof setTimeout> | null = null;
  private hydrated = false;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  getSnapshot = () => this.snapshot;
  isHydrated = () => this.hydrated;
  private emit() { for (const listener of this.listeners) listener(); }
  private commit(next: Snapshot) { this.snapshot = next; this.emit(); if (this.adapter) { if (this.flush) clearTimeout(this.flush); this.flush = setTimeout(() => this.adapter?.write(this.snapshot), 120); } }
  hydrate(adapter: StorageAdapter) { if (this.hydrated) return; this.adapter = adapter; this.snapshot = migrate(adapter.read()); this.hydrated = true; this.emit(); }
  markStudied(topicId: string, promptIds: string[], now = Date.now()) {
    const current = this.snapshot.topicStates[topicId] ?? defaultTopic(topicId);
    const topic = { ...current, firstStudiedAt: current.firstStudiedAt ?? now, lastOpenedAt: now };
    const prompts = { ...this.snapshot.promptStates };
    for (const promptId of promptIds) prompts[promptId] ??= emptyPromptState(promptId, topicId, now);
    this.commit({ ...this.snapshot, topicStates: { ...this.snapshot.topicStates, [topicId]: topic }, promptStates: prompts });
  }
  touchTopic(topicId: string, now = Date.now()) {
    const current = this.snapshot.topicStates[topicId] ?? defaultTopic(topicId);
    this.commit({ ...this.snapshot, topicStates: { ...this.snapshot.topicStates, [topicId]: { ...current, lastOpenedAt: now } }, recentTopics: [{ topicId, at: now }, ...this.snapshot.recentTopics.filter((item) => item.topicId !== topicId)].slice(0, 12) });
  }
  setPreferredMode(topicId: string, mode: TopicStudyState['preferredMode']) {
    const current = this.snapshot.topicStates[topicId] ?? defaultTopic(topicId);
    this.commit({ ...this.snapshot, topicStates: { ...this.snapshot.topicStates, [topicId]: { ...current, preferredMode: mode } } });
  }
  rateRecall(promptId: string, topicId: string, rating: RecallRating, now = Date.now()) {
    const current = this.snapshot.promptStates[promptId] ?? emptyPromptState(promptId, topicId, now);
    const next = ratePrompt(current, rating, now);
    const topic = this.snapshot.topicStates[topicId] ?? defaultTopic(topicId);
    this.commit({ ...this.snapshot, promptStates: { ...this.snapshot.promptStates, [promptId]: next }, topicStates: { ...this.snapshot.topicStates, [topicId]: { ...topic, lastRecallAt: now } } });
  }
  addAttempt(attempt: AnswerAttempt) {
    const topics = { ...this.snapshot.topicStates };
    for (const topicId of attempt.topicIds) topics[topicId] = { ...(topics[topicId] ?? defaultTopic(topicId)), lastPracticeAt: attempt.completedAt ?? attempt.startedAt };
    this.commit({ ...this.snapshot, attempts: { ...this.snapshot.attempts, [attempt.id]: attempt }, topicStates: topics });
  }
  addWeakness(event: WeaknessEvent) { this.commit({ ...this.snapshot, weaknessEvents: [...this.snapshot.weaknessEvents, event] }); }
  replaceAll(snapshot: Snapshot) { this.commit(migrate(snapshot)); }
  reset() { this.commit(structuredClone(EMPTY)); }
}

export const progressStore = new ProgressStore();
const KEY = 'mains.state.v1';
export const localStorageAdapter: StorageAdapter = {
  read() { try { const raw = window.localStorage.getItem(KEY); return raw ? JSON.parse(raw) as Snapshot : null; } catch { return null; } },
  write(snapshot) { try { window.localStorage.setItem(KEY, JSON.stringify(snapshot)); } catch { /* Session remains usable if persistence is blocked. */ } },
};

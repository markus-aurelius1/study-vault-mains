import type { CompiledTopic } from '../content/types';
import type { AnswerAttempt, ApplicationLevel, RecallLevel, Snapshot, StudyStage } from './types';
import { dayOrdinal } from '../revision/schedule';
import { hasUnresolvedHighSeverity, weaknessStatuses } from '../revision/weakness';

export function completedAttempts(snapshot: Snapshot, topicId: string): AnswerAttempt[] {
  return Object.values(snapshot.attempts).filter((attempt) => attempt.completedAt !== null && attempt.topicIds.includes(topicId));
}

export function recallLevel(snapshot: Snapshot, topic: CompiledTopic): RecallLevel {
  const firstStudiedAt = snapshot.topicStates[topic.id]?.firstStudiedAt;
  const promptIds = topic.recall.prompts.map((prompt) => `${topic.id}#${prompt.id}`);
  if (!promptIds.length || !firstStudiedAt) return 'weak';
  const states = promptIds.map((id) => snapshot.promptStates[id]);
  if (states.some((state) => !state?.successfulDays.length)) return 'weak';
  const threshold = dayOrdinal(firstStudiedAt) + 7;
  const strong = states.every((state) => state.successfulDays.length >= 2 && state.successfulDays.some((day) => day >= threshold));
  return strong ? 'strong' : 'functional';
}

export function applicationLevel(snapshot: Snapshot, topic: CompiledTopic): ApplicationLevel {
  const attempts = completedAttempts(snapshot, topic.id);
  if (!attempts.length) return 'unpractised';
  const timed = attempts.some((attempt) => attempt.type === 'timed');
  if (!timed) return 'outlined';
  const demands = new Set(attempts.flatMap((attempt) => attempt.demandIds));
  const required = Math.min(2, topic.demands.length);
  const stable = attempts.length >= 2 && demands.size >= required && !hasUnresolvedHighSeverity(snapshot.weaknessEvents, topic.id);
  return stable ? 'stable' : 'timed';
}

export function studyStage(snapshot: Snapshot, topic: CompiledTopic): StudyStage {
  const state = snapshot.topicStates[topic.id];
  if (!state?.firstStudiedAt) return 'not-started';
  const recall = recallLevel(snapshot, topic);
  const application = applicationLevel(snapshot, topic);
  if (recall === 'strong' && application === 'stable' && !hasUnresolvedHighSeverity(snapshot.weaknessEvents, topic.id)) return 'stable';
  if (application !== 'unpractised') return 'applied';
  if (recall === 'functional' || recall === 'strong') return 'recall-ready';
  return 'learning';
}

export function topicDueAt(snapshot: Snapshot, topic: CompiledTopic): number | null {
  const dues = topic.recall.prompts.map((prompt) => snapshot.promptStates[`${topic.id}#${prompt.id}`]?.dueAt).filter((due): due is number => due !== null && due !== undefined);
  return dues.length ? Math.min(...dues) : null;
}

export interface NextAction { topicId: string; label: string; href: string; priority: number; dueAt: number | null }

export function nextAction(snapshot: Snapshot, topic: CompiledTopic, now = Date.now()): NextAction {
  const attempts = completedAttempts(snapshot, topic.id);
  const overdue = attempts.filter((attempt) => attempt.reattemptDueAt !== null && attempt.reattemptDueAt <= now).sort((a, b) => a.reattemptDueAt! - b.reattemptDueAt!)[0];
  if (overdue) return { topicId: topic.id, label: `${topic.title} — reattempt ${overdue.pyqId}`, href: `/topic/${topic.id}?mode=practice&pyq=${overdue.pyqId}`, priority: 1, dueAt: overdue.reattemptDueAt };
  const weakness = weaknessStatuses(snapshot.weaknessEvents.filter((event) => event.targetId === topic.id || event.targetId.startsWith(`${topic.id}#`))).find((status) => status.recurring && status.highSeverity && !status.resolved);
  if (weakness) return { topicId: topic.id, label: `${topic.title} — repair ${weakness.weaknessId}`, href: `/topic/${topic.id}?mode=answer`, priority: 2, dueAt: null };
  const duePrompts = topic.recall.prompts.map((prompt) => ({ prompt, state: snapshot.promptStates[`${topic.id}#${prompt.id}`] })).filter((x) => x.state?.dueAt !== null && x.state!.dueAt! <= now).sort((a, b) => a.state!.dueAt! - b.state!.dueAt!);
  if (duePrompts[0]) return { topicId: topic.id, label: `${topic.title} — ${duePrompts[0].prompt.type} recall`, href: `/topic/${topic.id}?mode=recall`, priority: 3, dueAt: duePrompts[0].state!.dueAt };
  const recall = recallLevel(snapshot, topic), application = applicationLevel(snapshot, topic);
  if (recall === 'strong' && application === 'unpractised') return { topicId: topic.id, label: `${topic.title} — outline a PYQ`, href: `/topic/${topic.id}?mode=practice`, priority: 4, dueAt: null };
  if (attempts.filter((a) => a.type === 'outline').length >= 2 && !attempts.some((a) => a.type === 'timed')) return { topicId: topic.id, label: `${topic.title} — write a timed answer`, href: `/topic/${topic.id}?mode=practice`, priority: 5, dueAt: null };
  const weakPrompt = topic.recall.prompts.find((prompt) => !snapshot.promptStates[`${topic.id}#${prompt.id}`]?.successfulDays.length);
  if (weakPrompt) return { topicId: topic.id, label: `${topic.title} — ${weakPrompt.type} recall`, href: `/topic/${topic.id}?mode=recall`, priority: 6, dueAt: null };
  if (!snapshot.topicStates[topic.id]?.firstStudiedAt) return { topicId: topic.id, label: `${topic.title} — prepare Answer Kit`, href: `/topic/${topic.id}?mode=answer`, priority: 7, dueAt: null };
  return { topicId: topic.id, label: `${topic.title} — maintenance recall`, href: `/topic/${topic.id}?mode=recall`, priority: 8, dueAt: topicDueAt(snapshot, topic) };
}

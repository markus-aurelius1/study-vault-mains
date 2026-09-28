import assert from 'node:assert/strict';
import test from 'node:test';
import { compileContent } from '../../scripts/content/compiler';
import { applicationLevel, recallLevel, studyStage } from '../../src/lib/progress/selectors';
import { EMPTY } from '../../src/lib/progress/store';
import type { AnswerAttempt, Snapshot } from '../../src/lib/progress/types';
import { dayOrdinal } from '../../src/lib/revision/schedule';

const clone = (): Snapshot => structuredClone(EMPTY);
const attempt = (id: string, type: AnswerAttempt['type'], demandId: string, at: number): AnswerAttempt => ({ id, pyqId: 'GS2-63', startedAt: at - 1000, completedAt: at, type, seconds: 60, topicIds: ['gs2-polity-parliamentary-committees'], demandIds: [`gs2-polity-parliamentary-committees#${demandId}`], rubric: {}, weaknessEventIds: [], reattemptDueAt: null });

test('Functional and Strong Recall follow successful-day rules', async () => {
  const topic = (await compileContent(false)).topics[0], snapshot = clone(), studied = new Date(2026, 0, 1).getTime();
  snapshot.topicStates[topic.id] = { topicId: topic.id, firstStudiedAt: studied, lastOpenedAt: studied, studyStage: 'learning', recallLevel: 'weak', applicationLevel: 'unpractised', lastRecallAt: null, lastPracticeAt: null, preferredMode: 'answer-kit', pinned: false };
  for (const prompt of topic.recall.prompts) snapshot.promptStates[`${topic.id}#${prompt.id}`] = { promptId: `${topic.id}#${prompt.id}`, topicId: topic.id, stage: 2, lastReviewedAt: studied, dueAt: studied, lastRating: 'good', successes: 1, successfulDays: [dayOrdinal(studied)], lapses: 0 };
  assert.equal(recallLevel(snapshot, topic), 'functional');
  for (const state of Object.values(snapshot.promptStates)) { state.successfulDays.push(dayOrdinal(studied) + 7); state.successes = 2; }
  assert.equal(recallLevel(snapshot, topic), 'strong');
});

test('two outlines cannot make Application stable', async () => {
  const topic = (await compileContent(false)).topics[0], snapshot = clone(), now = Date.now();
  snapshot.attempts.a = attempt('a', 'outline', 'utility', now); snapshot.attempts.b = attempt('b', 'outline', 'effectiveness', now + 1);
  assert.equal(applicationLevel(snapshot, topic), 'outlined');
});

test('stable Application requires timed plus two attempts and distinct demand coverage', async () => {
  const topic = (await compileContent(false)).topics[0], snapshot = clone(), now = Date.now();
  snapshot.attempts.a = attempt('a', 'timed', 'utility', now); assert.equal(applicationLevel(snapshot, topic), 'timed');
  snapshot.attempts.b = attempt('b', 'outline', 'effectiveness', now + 1); assert.equal(applicationLevel(snapshot, topic), 'stable');
});

test('unresolved recurring severity-three weakness blocks stable Application', async () => {
  const topic = (await compileContent(false)).topics[0], snapshot = clone(), now = Date.now();
  snapshot.attempts.a = attempt('a', 'timed', 'utility', now); snapshot.attempts.b = attempt('b', 'outline', 'effectiveness', now + 1);
  snapshot.weaknessEvents.push({ id: 'w', weaknessId: 'weak-evidence', kind: 'observed', sourceType: 'practice', sourceId: 'a', targetType: 'topic', targetId: topic.id, severity: 3, observedAt: now + 2 });
  assert.equal(applicationLevel(snapshot, topic), 'timed');
  snapshot.weaknessEvents.push({ id: 'd1', weaknessId: 'weak-evidence', kind: 'demonstrated', sourceType: 'practice', sourceId: 'b', targetType: 'topic', targetId: topic.id, severity: 1, observedAt: now + 3 });
  snapshot.weaknessEvents.push({ id: 'd2', weaknessId: 'weak-evidence', kind: 'demonstrated', sourceType: 'practice', sourceId: 'c', targetType: 'topic', targetId: topic.id, severity: 1, observedAt: now + 4 });
  assert.equal(applicationLevel(snapshot, topic), 'stable');
});

test('practice before stable recall produces Applied stage', async () => {
  const topic = (await compileContent(false)).topics[0], snapshot = clone(), now = Date.now();
  snapshot.topicStates[topic.id] = { topicId: topic.id, firstStudiedAt: now, lastOpenedAt: now, studyStage: 'learning', recallLevel: 'weak', applicationLevel: 'unpractised', lastRecallAt: null, lastPracticeAt: null, preferredMode: 'answer-kit', pinned: false };
  snapshot.attempts.a = attempt('a', 'outline', 'utility', now);
  assert.equal(studyStage(snapshot, topic), 'applied');
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { DAY_MS, dayOrdinal, emptyPromptState, ratePrompt, STAGE_INTERVALS } from '../../src/lib/revision/schedule';

const now = new Date(2026, 0, 1, 12).getTime();

test('Good advances one stage and uses that stage interval', () => {
  const next = ratePrompt(emptyPromptState('t#p', 't', now), 'good', now);
  assert.equal(next.stage, 1); assert.equal(dayOrdinal(next.dueAt!), dayOrdinal(now) + STAGE_INTERVALS[1]);
});

test('Easy advances two stages and caps at D90', () => {
  let state = emptyPromptState('t#p', 't', now); state.stage = 4;
  state = ratePrompt(state, 'easy', now);
  assert.equal(state.stage, 5); assert.equal(dayOrdinal(state.dueAt!), dayOrdinal(now) + 90);
});

test('Again regresses and is due tomorrow', () => {
  let state = emptyPromptState('t#p', 't', now); state.stage = 3;
  state = ratePrompt(state, 'again', now);
  assert.equal(state.stage, 2); assert.equal(dayOrdinal(state.dueAt!), dayOrdinal(now) + 1); assert.equal(state.lapses, 1);
});

test('Hard stays at stage and uses half interval with minimum one day', () => {
  let state = emptyPromptState('t#p', 't', now); state.stage = 3;
  state = ratePrompt(state, 'hard', now);
  assert.equal(state.stage, 3); assert.equal(dayOrdinal(state.dueAt!), dayOrdinal(now) + 11);
  const stageZero = ratePrompt(emptyPromptState('x', 't', now), 'hard', now);
  assert.equal(dayOrdinal(stageZero.dueAt!), dayOrdinal(now) + 1);
});

test('successfulDays stores unique Good/Easy days only and keeps the latest 12', () => {
  let state = emptyPromptState('t#p', 't', now);
  state = ratePrompt(state, 'again', now); state = ratePrompt(state, 'hard', now + DAY_MS);
  assert.deepEqual(state.successfulDays, []);
  for (let i = 0; i < 14; i++) state = ratePrompt(state, i % 2 ? 'good' : 'easy', now + i * DAY_MS);
  state = ratePrompt(state, 'good', now + 13 * DAY_MS);
  assert.equal(state.successfulDays.length, 12);
  assert.equal(state.successfulDays[0], dayOrdinal(now) + 2);
  assert.equal(state.successes, 12);
});

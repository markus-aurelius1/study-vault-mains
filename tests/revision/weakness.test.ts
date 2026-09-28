import assert from 'node:assert/strict';
import test from 'node:test';
import type { WeaknessEvent } from '../../src/lib/progress/types';
import { DAY_MS } from '../../src/lib/revision/schedule';
import { weaknessStatuses } from '../../src/lib/revision/weakness';

const base = new Date(2026, 0, 1).getTime();
const event = (id: string, kind: WeaknessEvent['kind'], at: number, severity: 1 | 2 | 3 = 2): WeaknessEvent => ({ id, weaknessId: 'weak-evidence', kind, sourceType: 'practice', sourceId: id, targetType: 'topic', targetId: 'topic-a', severity, observedAt: at });

test('two observations on separate days recur', () => {
  const status = weaknessStatuses([event('a', 'observed', base), event('b', 'observed', base + DAY_MS)])[0];
  assert.equal(status.recurring, true); assert.equal(status.resolved, false);
});

test('one severity-three observation recurs', () => {
  assert.equal(weaknessStatuses([event('a', 'observed', base, 3)])[0].recurring, true);
});

test('two later demonstrations resolve a weakness', () => {
  const status = weaknessStatuses([event('a', 'observed', base, 3), event('b', 'demonstrated', base + DAY_MS), event('c', 'demonstrated', base + 2 * DAY_MS)])[0];
  assert.equal(status.resolved, true); assert.equal(status.demonstrations, 2);
});

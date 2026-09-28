import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { TopicSourceSchema, type TopicSource } from '../../src/lib/content/schema';
import { assertUniqueIds, buildRelationshipIndexes, compileContent, detectCycles, requireRef, resolveImports, validateCrossLinks } from '../../scripts/content/compiler';

async function baseTopic(): Promise<TopicSource> {
  const raw = YAML.parse(await readFile('content-src/topics/gs2/parliamentary-committees.yaml', 'utf8'));
  return TopicSourceSchema.parse(raw);
}

test('production content passes strict schema and relationship compilation', async () => {
  const result = await compileContent(false);
  assert.equal(result.topics.length, 1);
  assert.equal(result.topics[0].pyqs[0].text.length > 20, true);
});

test('schema rejects forbidden or malformed topic papers', async () => {
  const topic = await baseTopic();
  assert.equal(TopicSourceSchema.safeParse({ ...topic, paper: 'ECO1' }).success, false);
});

test('duplicate IDs and missing references fail explicitly', () => {
  assert.throws(() => assertUniqueIds([{ id: 'same' }, { id: 'same' }], 'fixture'), /duplicate fixture ID/);
  assert.throws(() => requireRef('missing', new Set(['present']), 'fixture.ref'), /unknown reference missing/);
});

test('unknown PYQ IDs fail reference validation', () => {
  assert.throws(() => requireRef('GS2-99999', new Set(['GS2-63']), 'fixture.pyqs'), /unknown reference GS2-99999/);
});

test('every declared Topic cross-link must resolve', async () => {
  const topic = await baseTopic();
  topic.scope.cross_links = ['gs2-topic-not-built'];
  assert.throws(() => validateCrossLinks([topic]), /unknown reference gs2-topic-not-built/);
});

test('circular synthesis dependencies fail', async () => {
  const base = await baseTopic();
  const a = { ...structuredClone(base), id: 'soc2-cycle-a', node_type: 'synthesis' as const, imports: [{ ref: 'soc2-cycle-b#specialised-scrutiny' }] };
  const b = { ...structuredClone(base), id: 'soc2-cycle-b', node_type: 'synthesis' as const, imports: [{ ref: 'soc2-cycle-a#specialised-scrutiny' }] };
  assert.throws(() => detectCycles([a, b]), /circular import/);
});

test('synthesis imports retain Core canonical identity and alias', async () => {
  const core: TopicSource = { ...structuredClone(await baseTopic()), id: 'soc2-core-fixture', node_type: 'core' };
  const synthesis: TopicSource = { ...structuredClone(core), id: 'soc2-synthesis-fixture', node_type: 'synthesis', arguments: [], imports: [{ ref: 'soc2-core-fixture#specialised-scrutiny', alias: 'scrutiny-alias', priority: 'A' }] };
  const imported = resolveImports(synthesis, new Map<string, TopicSource>([[core.id, core], [synthesis.id, synthesis]]));
  assert.equal(imported.get('scrutiny-alias')?.canonicalId, 'soc2-core-fixture#specialised-scrutiny');
  assert.equal(imported.get('scrutiny-alias')?.imported, true);
});

test('missing imported arguments fail', async () => {
  const core: TopicSource = { ...structuredClone(await baseTopic()), id: 'soc2-core-fixture', node_type: 'core' };
  const synthesis: TopicSource = { ...structuredClone(core), id: 'soc2-synthesis-fixture', node_type: 'synthesis', imports: [{ ref: 'soc2-core-fixture#not-there' }] };
  assert.throws(() => resolveImports(synthesis, new Map<string, TopicSource>([[core.id, core], [synthesis.id, synthesis]])), /missing imported argument/);
});

test('reverse PYQ backlinks are generated', async () => {
  const { topics } = await compileContent(false);
  const indexes = buildRelationshipIndexes(topics);
  assert.deepEqual(indexes.pyqToTopics['GS2-63'], ['gs2-polity-parliamentary-committees']);
});

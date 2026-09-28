import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  EvidenceRegistrySchema, FrameworkRegistrySchema, PAPER_IDS, SourceRegistrySchema,
  SyllabusRegistrySchema, ThinkerRegistrySchema, TopicSourceSchema, VisualRegistrySchema,
  type ArgumentSource, type TopicSource,
} from '../../src/lib/content/schema';
import type { CanonicalArgument, CompiledTopic, ContentManifest, PyqIndexRow, TopicSummary } from '../../src/lib/content/types';
import { filesUnder, loadYaml, loadYamlDirectory } from './load';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'content-src');
const BRIDGE = path.join(ROOT, 'external', 'pyq-engine', 'search.json');
const TMP = path.join(ROOT, '.content-build-tmp');
const OUT = path.join(ROOT, 'content');
const PUBLIC = path.join(ROOT, 'public', 'data');

export interface CompileResult { topics: CompiledTopic[]; manifest: ContentManifest; warnings: string[] }

export function assertUniqueIds<T extends { id: string }>(items: T[], label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) throw new Error(`duplicate ${label} ID: ${item.id}`);
    seen.add(item.id);
  }
}

export function requireRef(ref: string, ids: Set<string>, context: string) {
  if (!ids.has(ref)) throw new Error(`${context}: unknown reference ${ref}`);
}

function argumentMap(topic: TopicSource) {
  return new Map(topic.arguments.map((a) => [a.id, a]));
}

export function detectCycles(topics: TopicSource[]) {
  const deps = new Map(topics.map((t) => [t.id, new Set(t.imports.map((i) => i.ref.split('#')[0]))]));
  const active = new Set<string>();
  const done = new Set<string>();
  function visit(id: string, trail: string[]) {
    if (active.has(id)) throw new Error(`circular import: ${[...trail, id].join(' -> ')}`);
    if (done.has(id)) return;
    active.add(id);
    for (const dep of deps.get(id) ?? []) visit(dep, [...trail, id]);
    active.delete(id);
    done.add(id);
  }
  for (const topic of topics) visit(topic.id, []);
}

export function resolveImports(topic: TopicSource, topicById: Map<string, TopicSource>): Map<string, CanonicalArgument> {
  const localArgs = argumentMap(topic);
  const imported = new Map<string, CanonicalArgument>();
  for (const imp of topic.imports) {
    const [originId, argumentId] = imp.ref.split('#');
    if (originId === topic.id) throw new Error(`${topic.id}: self-import ${imp.ref}`);
    const origin = topicById.get(originId);
    if (!origin) throw new Error(`${topic.id}: missing import Topic ${originId}`);
    if (origin.node_type !== 'core') throw new Error(`${topic.id}: imports must target Core Topics (${imp.ref})`);
    const sourceArg = argumentMap(origin).get(argumentId);
    if (!sourceArg) throw new Error(`${topic.id}: missing imported argument ${imp.ref}`);
    const localRef = imp.alias ?? argumentId;
    if (localArgs.has(localRef) || imported.has(localRef)) throw new Error(`${topic.id}: duplicate imported alias ${localRef}`);
    imported.set(localRef, { ...sourceArg, priority: imp.priority ?? sourceArg.priority, canonicalId: imp.ref, originTopicId: originId, localRef, imported: true });
  }
  return imported;
}

export function buildRelationshipIndexes(compiled: CompiledTopic[]) {
  const pyqToTopics: Record<string, string[]> = {};
  const topicToPyqs: Record<string, string[]> = {};
  for (const topic of compiled) {
    topicToPyqs[topic.id] = topic.pyqs.map((p) => p.id);
    for (const pyq of topic.pyqs) (pyqToTopics[pyq.id] ??= []).push(topic.id);
  }
  return { topicToPyqs, pyqToTopics };
}

export function validateCrossLinks(topics: TopicSource[]) {
  const ids = new Set(topics.map((topic) => topic.id));
  for (const topic of topics) for (const ref of topic.scope.cross_links) requireRef(ref, ids, `${topic.id}.scope.cross_links`);
}

function stable(value: unknown) { return `${JSON.stringify(value, null, 2)}\n`; }

async function readBridge(): Promise<Map<string, PyqIndexRow>> {
  let parsed: { fields?: unknown; rows?: unknown };
  try { parsed = JSON.parse(await readFile(BRIDGE, 'utf8')) as typeof parsed; }
  catch { throw new Error('external/pyq-engine/search.json is missing or invalid; run npm run sync:pyq -- --from <file>'); }
  if (!Array.isArray(parsed.rows)) throw new Error('PYQ bridge must contain a rows array');
  const map = new Map<string, PyqIndexRow>();
  for (const raw of parsed.rows) {
    if (!Array.isArray(raw) || raw.length !== 8 || typeof raw[0] !== 'string') throw new Error('PYQ bridge contains an invalid row');
    const row = raw as PyqIndexRow;
    if (map.has(row[0])) throw new Error(`PYQ bridge contains duplicate ID ${row[0]}`);
    map.set(row[0], row);
  }
  return map;
}

export async function compileContent(write = true): Promise<CompileResult> {
  const topicFiles = await filesUnder(path.join(SRC, 'topics'));
  const topics: TopicSource[] = [];
  for (const file of topicFiles) topics.push(await loadYaml(file, TopicSourceSchema));
  assertUniqueIds(topics, 'Topic');

  const evidence = (await loadYamlDirectory(path.join(SRC, 'assets', 'evidence'), EvidenceRegistrySchema)).flat();
  const thinkers = (await loadYamlDirectory(path.join(SRC, 'assets', 'thinkers'), ThinkerRegistrySchema)).flat();
  const visuals = (await loadYamlDirectory(path.join(SRC, 'assets', 'visuals'), VisualRegistrySchema)).flat();
  const frameworks = (await loadYamlDirectory(path.join(SRC, 'assets', 'frameworks'), FrameworkRegistrySchema)).flat();
  const sources = (await loadYamlDirectory(path.join(SRC, 'sources'), SourceRegistrySchema)).flat();
  const syllabus = (await loadYamlDirectory(path.join(SRC, 'syllabus'), SyllabusRegistrySchema)).flat();
  const registries: Array<[Array<{ id: string }>, string]> = [
    [evidence, 'Evidence'], [thinkers, 'Thinker'], [visuals, 'Visual'],
    [frameworks, 'Framework'], [sources, 'Source'], [syllabus, 'Syllabus'],
  ];
  for (const [items, label] of registries) assertUniqueIds(items, label);

  const globalIds = new Map<string, string>();
  for (const [items, label] of [[topics, 'Topic'] as [Array<{ id: string }>, string], ...registries]) {
    for (const item of items) {
      const prior = globalIds.get(item.id);
      if (prior) throw new Error(`permanent ID ${item.id} is shared by ${prior} and ${label}`);
      globalIds.set(item.id, label);
    }
  }

  const topicById = new Map(topics.map((t) => [t.id, t]));
  const evidenceById = new Map(evidence.map((x) => [x.id, x]));
  const thinkerById = new Map(thinkers.map((x) => [x.id, x]));
  const visualById = new Map(visuals.map((x) => [x.id, x]));
  const frameworkById = new Map(frameworks.map((x) => [x.id, x]));
  const sourceIds = new Set(sources.map((x) => x.id));
  const syllabusIds = new Set(syllabus.map((x) => x.id));
  const pyqs = await readBridge();
  const warnings: string[] = [];

  detectCycles(topics);
  validateCrossLinks(topics);
  for (const topic of topics) {
    if (!PAPER_IDS.includes(topic.paper)) throw new Error(`${topic.id}: forbidden paper ${topic.paper}`);
    requireRef(topic.syllabus.primary, syllabusIds, `${topic.id}.syllabus.primary`);
    for (const ref of topic.syllabus.secondary) requireRef(ref, syllabusIds, `${topic.id}.syllabus.secondary`);
    for (const ref of topic.sources) requireRef(ref, sourceIds, `${topic.id}.sources`);
    assertUniqueIds(topic.demands, `${topic.id} demand`); assertUniqueIds(topic.concepts, `${topic.id} concept`);
    assertUniqueIds(topic.arguments, `${topic.id} argument`); assertUniqueIds(topic.answer_shells, `${topic.id} answer shell`);
    assertUniqueIds(topic.recall.prompts, `${topic.id} recall prompt`); assertUniqueIds(topic.deep_sections, `${topic.id} deep section`);
  }

  for (const item of evidence) {
    for (const src of item.sources) requireRef(src.source_id, sourceIds, `${item.id}.sources`);
    if (item.verification.status === 'verified' && item.sources.length === 0) throw new Error(`${item.id}: verified evidence requires provenance`);
    if (item.verification.status === 'time_sensitive' && !item.verification.as_of) warnings.push(`${item.id}: time_sensitive evidence should carry as_of`);
  }
  for (const item of thinkers) for (const ref of item.source_refs) requireRef(ref, sourceIds, `${item.id}.source_refs`);

  const compiled: CompiledTopic[] = [];
  for (const topic of topics) {
    const demandIds = new Set(topic.demands.map((d) => d.id));
    const localArgs = argumentMap(topic);
    const imported = resolveImports(topic, topicById);
    const available = new Set([...localArgs.keys(), ...imported.keys()]);
    const evIds = new Set(evidenceById.keys()), thIds = new Set(thinkerById.keys()), visIds = new Set(visualById.keys()), fwIds = new Set(frameworkById.keys());
    for (const arg of topic.arguments) {
      for (const ref of arg.demand_refs) requireRef(ref, demandIds, `${topic.id}#${arg.id}.demand_refs`);
      for (const ref of arg.evidence_refs) requireRef(ref, evIds, `${topic.id}#${arg.id}.evidence_refs`);
      for (const ref of arg.thinker_refs) requireRef(ref, thIds, `${topic.id}#${arg.id}.thinker_refs`);
      for (const ref of arg.counterpoint_refs) requireRef(ref, available, `${topic.id}#${arg.id}.counterpoint_refs`);
    }
    for (const demand of topic.demands) {
      for (const ref of [...demand.argument_refs.core, ...demand.argument_refs.supporting, ...demand.argument_refs.critique]) requireRef(ref, available, `${topic.id}#${demand.id}.argument_refs`);
    }
    for (const ref of topic.evidence_refs) requireRef(ref, evIds, `${topic.id}.evidence_refs`);
    for (const ref of topic.thinker_refs) requireRef(ref, thIds, `${topic.id}.thinker_refs`);
    for (const ref of topic.visual_refs) requireRef(ref, visIds, `${topic.id}.visual_refs`);
    for (const ref of topic.framework_refs) requireRef(ref, fwIds, `${topic.id}.framework_refs`);
    for (const shell of topic.answer_shells) {
      for (const ref of shell.demand_refs) requireRef(ref, demandIds, `${topic.id}#${shell.id}.demand_refs`);
      for (const section of shell.sections) for (const ref of section.argument_refs ?? []) requireRef(ref, available, `${topic.id}#${shell.id}.argument_refs`);
    }
    for (const view of topic.analytical_views) for (const row of view.rows) for (const key of ['left', 'middle', 'right']) {
      const ref = row[key]; if (typeof ref === 'string') requireRef(ref, available, `${topic.id}#${view.id}.${key}`);
    }
    const recallTargets = new Set([...available, ...topic.answer_shells.map((x) => x.id), ...topic.concepts.map((x) => x.id), ...evIds, ...thIds, ...visIds, ...fwIds]);
    for (const prompt of topic.recall.prompts) for (const ref of prompt.targets) requireRef(ref, recallTargets, `${topic.id}#${prompt.id}.targets`);
    for (const ref of topic.recall.summary.argument_refs) requireRef(ref, available, `${topic.id}.recall.summary.argument_refs`);
    for (const ref of topic.recall.summary.evidence_refs) requireRef(ref, evIds, `${topic.id}.recall.summary.evidence_refs`);
    for (const ref of topic.recall.summary.visual_refs) requireRef(ref, visIds, `${topic.id}.recall.summary.visual_refs`);

    const compiledPyqs = topic.pyqs.map((ref) => {
      const row = pyqs.get(ref.id);
      if (!row) throw new Error(`${topic.id}: unknown PYQ ID ${ref.id}`);
      if (row[2] === 'ECO1' || row[2] === 'ECO2') throw new Error(`${topic.id}: Economics Optional PYQ ${ref.id} is forbidden`);
      for (const demand of ref.demand_refs) requireRef(demand, demandIds, `${topic.id}.${ref.id}.demand_refs`);
      return { ...ref, text: row[1], paper: row[2], subject: row[3], topic: row[4], href: row[5], year: row[6], marks: row[7] };
    });
    const argumentsResolved: CanonicalArgument[] = [
      ...topic.arguments.map((a: ArgumentSource) => ({ ...a, canonicalId: `${topic.id}#${a.id}`, originTopicId: topic.id, localRef: a.id, imported: false })),
      ...imported.values(),
    ];
    const out: CompiledTopic = {
      ...topic,
      arguments: argumentsResolved,
      pyqs: compiledPyqs,
      resolved: {
        evidence: topic.evidence_refs.map((id) => evidenceById.get(id)!),
        thinkers: topic.thinker_refs.map((id) => thinkerById.get(id)!),
        visuals: topic.visual_refs.map((id) => visualById.get(id)!),
        frameworks: topic.framework_refs.map((id) => frameworkById.get(id)!),
      },
    };
    compiled.push(out);
    const recallArgumentRefs = new Set([
      ...topic.recall.summary.argument_refs,
      ...topic.recall.prompts.flatMap((prompt) => prompt.targets),
    ]);
    for (const argument of argumentsResolved) if (argument.priority === 'C' && recallArgumentRefs.has(argument.localRef)) warnings.push(`${topic.id}: Recall references Priority-C argument ${argument.localRef}`);
    const usedDemands = new Set(topic.arguments.flatMap((a) => a.demand_refs));
    for (const demand of topic.demands) if (!usedDemands.has(demand.id)) warnings.push(`${topic.id}#${demand.id}: demand has no local argument usage`);
    if (!topic.pyqs.length && topic.node_type === 'core') warnings.push(`${topic.id}: Core Topic has no PYQ`);
    if (topic.concepts.length > 6) warnings.push(`${topic.id}: ${topic.concepts.length} concepts exceeds the normal ceiling of 6`);
    if (topic.arguments.filter((argument) => argument.priority === 'A').length > 10) warnings.push(`${topic.id}: Priority-A arguments exceed the normal ceiling of 10`);
    if (topic.evidence_refs.length > 6) warnings.push(`${topic.id}: evidence anchors exceed the normal ceiling of 6`);
    if (topic.visual_refs.length > 2) warnings.push(`${topic.id}: visuals exceed the normal ceiling of 2`);
    if (topic.intro_anchors.length > 3 || topic.conclusion_anchors.length > 3) warnings.push(`${topic.id}: intro/conclusion anchors exceed the normal ceiling of 3`);
    if (topic.future_variants.length > 6) warnings.push(`${topic.id}: future variants exceed the normal ceiling of 6`);
    if (topic.answer_shells.length > 4) warnings.push(`${topic.id}: answer shells exceed the normal ceiling of 4`);
  }
  compiled.sort((a, b) => a.id.localeCompare(b.id));

  const usedEvidence = new Set(topics.flatMap((topic) => topic.evidence_refs));
  const usedVisuals = new Set(topics.flatMap((topic) => topic.visual_refs));
  const usedFrameworks = new Set(topics.flatMap((topic) => topic.framework_refs));
  for (const asset of evidence) if (!usedEvidence.has(asset.id)) warnings.push(`${asset.id}: evidence is unused`);
  for (const asset of visuals) if (!usedVisuals.has(asset.id)) warnings.push(`${asset.id}: visual is orphaned`);
  for (const asset of frameworks) if (!usedFrameworks.has(asset.id)) warnings.push(`${asset.id}: framework is orphaned`);

  const summaries: TopicSummary[] = compiled.map((t) => ({ id: t.id, title: t.title, paper: t.paper, node_type: t.node_type, syllabus: t.syllabus.primary, pyqCount: t.pyqs.length, demandCount: t.demands.length, href: `/topic/${t.id}` }));
  const sourceDocs = await Promise.all((await filesUnder(SRC)).map((f) => readFile(f, 'utf8')));
  const digest = createHash('sha256').update(sourceDocs.join('\n---\n')).digest('hex');
  const labels: Record<string, string> = { GS1: 'GS-I', GS2: 'GS-II', GS3: 'GS-III', GS4: 'GS-IV', ESSAY: 'Essay', SOC1: 'Sociology-I', SOC2: 'Sociology-II' };
  const manifest: ContentManifest = { schemaVersion: 'mains-topic-v1', digest, papers: PAPER_IDS.map((id) => ({ id, label: labels[id], topics: summaries.filter((t) => t.paper === id) })), topics: summaries };

  if (write) {
    await rm(TMP, { recursive: true, force: true });
    await mkdir(path.join(TMP, 'topics'), { recursive: true });
    await mkdir(path.join(TMP, 'indexes'), { recursive: true });
    for (const topic of compiled) await writeFile(path.join(TMP, 'topics', `${topic.id}.json`), stable(topic));
    const { topicToPyqs, pyqToTopics } = buildRelationshipIndexes(compiled);
    const graph = {
      topicToPyqs, pyqToTopics,
      topicToDemands: Object.fromEntries(compiled.map((t) => [t.id, t.demands.map((d) => `${t.id}#${d.id}`)])),
      topicToArguments: Object.fromEntries(compiled.map((t) => [t.id, t.arguments.map((a) => a.canonicalId)])),
      topicToRelated: Object.fromEntries(compiled.map((t) => [t.id, t.scope.cross_links])),
    };
    await writeFile(path.join(TMP, 'manifest.json'), stable(manifest));
    await writeFile(path.join(TMP, 'graph.json'), stable(graph));
    await writeFile(path.join(TMP, 'indexes', 'pyq-topic-map.json'), stable(pyqToTopics));
    await rm(OUT, { recursive: true, force: true });
    await rename(TMP, OUT);
    await mkdir(PUBLIC, { recursive: true });
    const searchRows = compiled.flatMap((topic) => [
      { id: topic.id, kind: 'topic', title: topic.title, text: topic.thesis, paper: topic.paper, href: `/topic/${topic.id}`, rank: 100 },
      ...topic.demands.map((d) => ({ id: `${topic.id}#${d.id}`, kind: 'demand', title: d.label, text: d.description ?? d.directives.join(' '), paper: topic.paper, href: `/topic/${topic.id}?mode=answer&demand=${d.id}`, rank: 80 })),
      ...topic.arguments.map((a) => ({ id: a.canonicalId, kind: 'argument', title: a.keyword, text: a.line, paper: topic.paper, href: `/topic/${topic.id}?mode=answer`, rank: a.priority === 'A' ? 90 : a.priority === 'B' ? 60 : 30 })),
      ...topic.resolved.evidence.map((e) => ({ id: e.id, kind: 'evidence', title: e.title, text: `${e.exam_line} ${e.implication}`, paper: topic.paper, href: `/topic/${topic.id}?mode=answer`, rank: 70 })),
      ...topic.resolved.thinkers.map((e) => ({ id: e.id, kind: 'thinker', title: e.name, text: e.one_line_lens, paper: topic.paper, href: `/topic/${topic.id}?mode=answer`, rank: 70 })),
      ...topic.pyqs.map((p) => ({ id: p.id, kind: 'pyq', title: `${p.year} · ${p.marks} marks`, text: p.text, paper: topic.paper, href: `/topic/${topic.id}?mode=practice&pyq=${p.id}`, rank: 65 })),
    ]).sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));
    await writeFile(path.join(PUBLIC, 'search.json'), stable({ rows: searchRows }));
    await writeFile(path.join(PUBLIC, 'pyq-topic-map.json'), stable(pyqToTopics));
  }
  return { topics: compiled, manifest, warnings };
}

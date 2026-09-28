import { z } from 'zod';

export const PAPER_IDS = ['GS1', 'GS2', 'GS3', 'GS4', 'ESSAY', 'SOC1', 'SOC2'] as const;
export const PaperSchema = z.enum(PAPER_IDS);
const Id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a lowercase kebab-case ID');
const Text = z.string().trim().min(1);
const StringList = z.array(Text);

const RefLists = z.object({
  core: z.array(Id).default([]),
  supporting: z.array(Id).default([]),
  critique: z.array(Id).default([]),
}).strict();

const PyqSchema = z.object({
  id: z.string().regex(/^[A-Z0-9]+-\d+$/),
  role: z.enum(['primary', 'secondary', 'contextual']),
  demand_refs: z.array(Id),
}).strict();

const DemandSchema = z.object({
  id: Id,
  label: Text,
  description: Text.optional(),
  directives: StringList.default([]),
  argument_refs: RefLists,
}).strict();

const ConceptSchema = z.object({ id: Id, label: Text, definition: Text, use: Text.optional() }).strict();

const ArgumentSchema = z.object({
  id: Id,
  keyword: Text,
  line: Text,
  dimensions: StringList,
  demand_refs: z.array(Id),
  evidence_refs: z.array(Id).default([]),
  thinker_refs: z.array(Id).default([]),
  counterpoint_refs: z.array(Id).default([]),
  priority: z.enum(['A', 'B', 'C']),
}).strict();

const ImportSchema = z.object({
  ref: z.string().regex(/^[a-z0-9-]+#[a-z0-9-]+$/),
  alias: Id.optional(),
  priority: z.enum(['A', 'B', 'C']).optional(),
}).strict();

const AnalyticalRow = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));
const AnalyticalViewSchema = z.object({
  id: Id,
  type: Text,
  title: Text,
  rows: z.array(AnalyticalRow),
}).strict();

const ShellSectionSchema = z.object({
  label: Text,
  function: z.enum(['thesis', 'synthesis']).optional(),
  argument_refs: z.array(Id).optional(),
}).strict().refine((v) => v.function || v.argument_refs?.length, 'section needs function or argument_refs');

const AnswerShellSchema = z.object({
  id: Id,
  title: Text,
  marks: z.array(z.number().positive()),
  demand_refs: z.array(Id),
  sections: z.array(ShellSectionSchema).min(1),
}).strict();

const RecallSchema = z.object({
  summary: z.object({
    thesis: z.boolean().optional(),
    argument_refs: z.array(Id).default([]),
    evidence_refs: z.array(Id).default([]),
    visual_refs: z.array(Id).default([]),
  }).strict(),
  prompts: z.array(z.object({
    id: Id,
    type: z.enum(['thesis', 'generate', 'compare', 'mechanism', 'evidence', 'thinker', 'diagram', 'framework', 'pyq-outline', 'synthesis']),
    prompt: Text,
    targets: z.array(z.string()).min(1),
  }).strict()),
}).strict();

export const TopicSourceSchema = z.object({
  schema: z.literal('mains-topic-v1'),
  id: Id,
  title: Text,
  paper: PaperSchema,
  optional_id: z.string().nullable(),
  node_type: z.enum(['core', 'synthesis']),
  syllabus: z.object({ primary: Id, secondary: z.array(Id).default([]) }).strict(),
  scope: z.object({ includes: StringList, excludes: StringList, cross_links: z.array(Id) }).strict(),
  thesis: Text,
  pyqs: z.array(PyqSchema),
  demands: z.array(DemandSchema),
  concepts: z.array(ConceptSchema),
  arguments: z.array(ArgumentSchema),
  imports: z.array(ImportSchema),
  thinker_refs: z.array(Id),
  evidence_refs: z.array(Id),
  visual_refs: z.array(Id),
  framework_refs: z.array(Id),
  analytical_views: z.array(AnalyticalViewSchema),
  answer_shells: z.array(AnswerShellSchema),
  intro_anchors: StringList,
  conclusion_anchors: StringList,
  future_variants: StringList,
  recall: RecallSchema,
  deep_sections: z.array(z.object({ id: Id, title: Text, body: Text, source_refs: z.array(Id).optional() }).strict()),
  sources: z.array(Id),
  meta: z.object({ status: Text, version: z.number().int().positive(), last_academic_review: z.string().date() }).strict(),
}).strict();

const Verification = z.object({
  status: z.enum(['verified', 'source_only', 'needs_verification', 'time_sensitive']),
  as_of: z.string().nullable(),
  checked_on: z.string().nullable(),
}).strict();

export const EvidenceRegistrySchema = z.array(z.object({
  id: Id,
  title: Text,
  type: Text,
  exam_line: Text,
  implication: Text,
  verification: Verification,
  sources: z.array(z.object({ source_id: Id, page: z.union([z.string(), z.number()]).nullable().optional() }).strict()),
  tags: StringList,
}).strict());

export const ThinkerRegistrySchema = z.array(z.object({
  id: Id,
  name: Text,
  paper_use: z.array(PaperSchema),
  one_line_lens: Text,
  concepts: StringList,
  studies: StringList,
  critiques: StringList,
  source_refs: z.array(Id),
}).strict());

export const VisualRegistrySchema = z.array(z.object({
  id: Id,
  title: Text,
  type: Text,
  purpose: Text,
  exam_version: Text,
  labels: StringList,
  draw_seconds: z.number().int().nonnegative(),
  use_for: StringList,
}).strict());

export const FrameworkRegistrySchema = z.array(z.object({
  id: Id,
  title: Text,
  type: Text,
  prompts: StringList,
  use_when: StringList,
  avoid_when: StringList,
}).strict());

export const SourceRegistrySchema = z.array(z.object({
  id: Id,
  title: Text,
  author: z.string().nullable().optional(),
  type: Text,
  year: z.number().int().nullable().optional(),
  local_file: z.string().nullable().optional(),
  url: z.string().url().optional(),
  publisher: z.string().optional(),
  publication_date: z.string().nullable().optional(),
  checked_on: z.string().nullable().optional(),
  notes: z.string().optional(),
}).strict());

export const SyllabusRegistrySchema = z.array(z.object({
  id: Id,
  paper: PaperSchema,
  label: Text,
  parent_id: Id.nullable().default(null),
}).strict());

export type TopicSource = z.infer<typeof TopicSourceSchema>;
export type ArgumentSource = z.infer<typeof ArgumentSchema>;
export type EvidenceAsset = z.infer<typeof EvidenceRegistrySchema>[number];
export type ThinkerAsset = z.infer<typeof ThinkerRegistrySchema>[number];
export type VisualAsset = z.infer<typeof VisualRegistrySchema>[number];
export type FrameworkAsset = z.infer<typeof FrameworkRegistrySchema>[number];
export type SourceAsset = z.infer<typeof SourceRegistrySchema>[number];
export type SyllabusItem = z.infer<typeof SyllabusRegistrySchema>[number];
export type PaperId = z.infer<typeof PaperSchema>;

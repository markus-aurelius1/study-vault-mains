# Mains Study Vault — Implementation Architecture

**Status:** Frozen MVP implementation contract  
**Target repository:** `markus-aurelius1/study-vault-mains`

## 1. Technical direction

Build a new application. Do not modify either reference repository.

Use:
- Next.js 16 App Router
- React 19
- TypeScript
- static/pre-rendered content wherever possible
- YAML authoring
- Zod validation
- `tsx` build scripts
- localStorage behind a versioned `StorageAdapter`
- no database
- no authentication
- no AI/LLM API
- no graph database
- no live cross-origin shared state in MVP

Reference repositories:
1. `markus-aurelius1/study-vault-prelims`
2. `markus-aurelius1/pyq-engine`

## 2. Reuse conceptually from reference repositories

### Study Vault Prelims

Inspect particularly:
- `app/css/vault.css`
- `app/js/store.js`
- `app/js/content.js`
- `app/js/views/reader.js`
- `app/js/views/study.js`
- `index.html`
- `tools/build.mjs`
- `NOTES_FORMAT_GUIDE.md`

Reuse conceptually:
- design tokens;
- typography;
- low-noise reader UX;
- local state separated from note content;
- active-recall interaction;
- export/import;
- keyboard-friendly search;
- reading density controls;
- weak-area/revision philosophy.

Do not reuse its atomic factual-line schema.

### PYQ Engine

Inspect particularly:
- `package.json`
- `next.config.ts`
- `src/lib/types.ts`
- `src/lib/content.ts`
- `src/lib/searchIndex.ts`
- `src/lib/progress/store.ts`
- `src/lib/progress/selectors.ts`
- `src/lib/progress/provider.tsx`
- `src/components/AppShell.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/TopicWorkspace.tsx`

Reuse conceptually:
- Next.js structured/static content;
- server-side content access;
- typed content/state separation;
- `StorageAdapter`;
- migration-friendly snapshots;
- global command palette;
- canonical question IDs;
- build-time content pipeline.

## 3. Repository structure

```text
study-vault-mains/
│
├── AGENTS.md
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── CONTENT_SCHEMA.md
│   ├── IMPLEMENTATION_ARCHITECTURE.md
│   └── DECISIONS.md
│
├── content-src/
│   ├── topics/
│   │   ├── gs1/
│   │   ├── gs2/
│   │   ├── gs3/
│   │   ├── gs4/
│   │   ├── essay/
│   │   ├── soc1/
│   │   └── soc2/
│   ├── assets/
│   │   ├── evidence/
│   │   ├── thinkers/
│   │   ├── visuals/
│   │   └── frameworks/
│   ├── syllabus/
│   └── sources/
│
├── external/
│   └── pyq-engine/
│       └── search.json
│
├── content/                         # GENERATED
│   ├── manifest.json
│   ├── topics/
│   ├── graph.json
│   └── indexes/
│
├── public/
│   └── data/
│       ├── search.json
│       └── pyq-topic-map.json
│
├── scripts/
│   ├── build-content.ts
│   ├── validate-content.ts
│   └── sync-pyq-index.ts
│
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
│       ├── content/
│       ├── progress/
│       ├── revision/
│       └── search/
│
└── tests/
```

Generated `content/` must never be hand-edited.

## 4. Build pipeline

`npm run content` must:

1. read YAML under `content-src/`;
2. validate every file with Zod;
3. check globally unique permanent IDs;
4. load the committed PYQ bridge index;
5. validate every `pyqId`;
6. resolve Topic cross-links;
7. resolve imported arguments;
8. resolve evidence/thinker/visual/framework refs;
9. detect circular imports;
10. validate Demand → Argument references;
11. validate AnswerShell references;
12. validate Recall references;
13. generate reverse/backlink indexes;
14. generate search index;
15. generate compiled Topic JSON;
16. generate manifest;
17. generate `public/data/pyq-topic-map.json`.

The ordinary production build must not depend on the network.

Suggested packages:
- `yaml`
- `zod`
- `tsx`

## 5. Generated relationship indexes

Build-time lookups should include:
- Topic → PYQs
- PYQ → Topics
- Topic → Demands
- Demand → PYQs
- Demand → Arguments
- Topic → Arguments
- Argument → Topics
- Argument → Evidence
- Evidence → Arguments/Topics
- Thinker → Arguments/Topics
- Visual → Topics/Demands
- Topic → Related Topics

A graph database is unnecessary. Build-time maps/indexes are sufficient.

## 6. PYQ Engine bridge

Use a committed snapshot shaped like the PYQ Engine search index:

```text
[id, text, paper, subject, topic, href, year, marks]
```

Store it at:

```text
external/pyq-engine/search.json
```

Provide an explicit developer sync command capable of updating from:
- a local `pyq-engine` checkout; or
- a supplied file/URL.

Do not automatically fetch remote PYQ data during normal build.

External base URL is configurable; initial value:

```text
https://pyq-engine.vercel.app
```

Every linked PYQ displays:

> Open in PYQ Engine

Generate reverse mapping:

```text
pyqId → Mains Topic IDs
```

for future reverse integration.

Do not modify PYQ Engine in MVP.

## 7. Routes

```text
/                                  Dashboard
/syllabus                          Syllabus map
/paper/[paper]                     Paper overview
/topic/[topicId]                   Topic workspace
/revision                          Revision queue
/weaknesses                        Weakness queue
/settings                          Settings / backup
```

Topic modes use query parameters:

```text
/topic/[topicId]?mode=answer
/topic/[topicId]?mode=recall
/topic/[topicId]?mode=practice
/topic/[topicId]?mode=deep
```

Practice may specify:

```text
?mode=practice&pyq=GS2-69
```

Topic IDs remain stable if titles change.

## 8. TopicWorkspace

```text
TopicWorkspace
├── TopicHeader
├── ModeSwitcher
├── AnswerKit
├── RecallMode
├── PracticeMode
├── DeepMode
└── TopicStudyRail
```

Modes are views over the same compiled Topic object.

## 9. Answer Kit behavior

Default learning/repair view.

Render:
1. PYQ Demand Map
2. Thesis
3. Core Concepts
4. Priority-A arguments
5. Priority-B arguments
6. Analytical Views
7. Evidence / Thinker anchors
8. Visuals
9. Answer Shells
10. Intro / Conclusion anchors
11. Future Variants

Priority-C material belongs in Deep.

Provide a Demand filter. When a Demand is selected, show only relevant:
- arguments;
- evidence;
- thinkers;
- visuals;
- answer shells;
- linked PYQs.

Primary actions:
- Study Complete
- Recall This
- Practice PYQ
- Open Deep

Opening/scrolling alone changes no mastery.

## 10. Recall behavior

Sequence:

> Prompt → retrieve mentally/on paper → Reveal → Again / Hard / Good / Easy

Do not show source material before retrieval.

Supported prompt types:
- thesis
- generate
- compare
- mechanism
- evidence
- thinker
- diagram
- framework
- pyq-outline
- synthesis

Recall targets canonical assets.

## 11. Practice behavior

Initially hide Topic answer material.

Modes:
- Outline
- Timed Answer
- Full Untimed

Do not require typing a full answer.

### GS planning surface
- Directive
- Core demand
- Subsidiary demands
- Thesis
- Body headings
- Arguments
- Evidence
- Visual
- Nuance/limitation
- Conclusion

### Sociology planning surface
- Directive
- Sociological thesis
- Core concepts
- Thinker/study lenses
- Dimensions
- Empirical anchors
- Critique / alternative lens
- Paper I ↔ Paper II linkage
- Conclusion

After Finish / Compare, reveal only the question-relevant subgraph.

### GS review rubric
Each 0 serious weakness / 1 adequate / 2 strong:
- Demand
- Structure
- Dimensions
- Evidence
- Analysis
- Completion

### Sociology review rubric
- Demand
- Sociological lens
- Concepts/thinkers
- Empirical grounding
- Critique/nuance
- Structure/completion

Do not foreground a vanity total score.

## 12. Deep behavior

Contains extended/reference material.

Deep reading gives no mastery credit.

Provide contextual links such as:

> Understand in Deep

After repair:

> Test understanding

launches the relevant Recall prompt.

## 13. User-state architecture

Academic content and mutable state remain completely separate.

Use a framework-independent store:

```ts
interface StorageAdapter {
  read(): Snapshot | null;
  write(snapshot: Snapshot): void;
}
```

Initial adapter: localStorage.

Use versioned snapshot + migration.

Suggested storage key:

```text
mains.state.v1
```

Snapshot:

```ts
interface Snapshot {
  version: number;
  topicStates: Record<string, TopicStudyState>;
  promptStates: Record<string, RecallPromptState>;
  attempts: Record<string, AnswerAttempt>;
  weaknessEvents: WeaknessEvent[];
  recentTopics: RecentTopic[];
}
```

Add export/import and reset-with-confirmation.

## 14. TopicStudyState

```ts
interface TopicStudyState {
  topicId: string;

  firstStudiedAt: number | null;
  lastOpenedAt: number | null;

  studyStage:
    | 'not-started'
    | 'learning'
    | 'recall-ready'
    | 'applied'
    | 'stable';

  recallLevel:
    | 'weak'
    | 'functional'
    | 'strong';

  applicationLevel:
    | 'unpractised'
    | 'outlined'
    | 'timed'
    | 'stable';

  lastRecallAt: number | null;
  lastPracticeAt: number | null;

  preferredMode:
    | 'answer-kit'
    | 'recall'
    | 'practice'
    | 'deep';

  pinned: boolean;
}
```

These should largely be derived rather than manually editable.

## 15. RecallPromptState and scheduling

```ts
interface RecallPromptState {
  promptId: string;
  topicId: string;

  stage: number;
  lastReviewedAt: number | null;
  dueAt: number | null;

  lastRating:
    | 'again'
    | 'hard'
    | 'good'
    | 'easy'
    | null;

  successes: number;
  lapses: number;
}
```

Intervals:

```text
D0 → D3 → D7 → D21 → D45 → D90 maintenance
```

Rating behavior:
- Again → due tomorrow; regress one stage where possible
- Hard → remain at stage; shortened interval
- Good → advance one stage
- Easy → advance two stages, capped

Unit-test the algorithm.

Topic due date:

> earliest due Priority-A Recall prompt

Do not maintain a second manual Topic due date.

## 16. RecallLevel derivation

### Weak
Core prompts have not all achieved successful retrieval or a recent serious lapse exists.

### Functional
All Priority-A prompts have at least one successful Good/Easy retrieval.

### Strong
Core prompts have at least two successful retrievals on separate dates, including one at least 7 days after initial study.

## 17. ApplicationLevel derivation

### Unpractised
No PYQ attempt.

### Outlined
At least one Outline and no Timed attempt.

### Timed
At least one Timed answer.

### Stable
- at least one Timed answer;
- at least two total serious attempts;
- attempts cover at least `min(2, numberOfDemandClusters)` distinct demands;
- no unresolved high-severity recurring weakness.

## 18. StudyStage derivation

### Not Started
No Study Complete.

### Learning
Studied but Recall not Functional.

### Recall Ready
Recall Functional/Strong and Application Unpractised.

### Applied
Practice exists but Stability criteria are not met.

### Stable
Strong Recall + Stable Application + no unresolved severe recurring weakness.

No mastery percentage.

## 19. AnswerAttempt

```ts
interface AnswerAttempt {
  id: string;
  pyqId: string;

  startedAt: number;
  completedAt: number | null;

  type:
    | 'outline'
    | 'timed'
    | 'full';

  seconds: number;

  topicIds: string[];
  demandIds: string[];

  rubric: Record<string, 0 | 1 | 2>;

  weaknessEventIds: string[];

  reattemptDueAt: number | null;
}
```

Keep logical identity centered on canonical `pyqId`.

Do not implement cross-origin state sharing now.

## 20. Weakness events

```ts
interface WeaknessEvent {
  id: string;
  weaknessId: string;

  kind:
    | 'observed'
    | 'demonstrated';

  sourceType:
    | 'practice'
    | 'recall'
    | 'manual';

  sourceId: string;

  targetType:
    | 'topic'
    | 'demand'
    | 'argument'
    | 'evidence'
    | 'visual'
    | 'skill';

  targetId: string;

  severity: 1 | 2 | 3;
  observedAt: number;
}
```

Recurring:
- 2+ observations on separate occasions; or
- one severity 3.

Resolution:
- two later successful demonstrations.

Rubrics may **suggest** weaknesses for confirmation; do not silently create all weakness events.

## 21. Reattempt behavior

### Severe demand-decoding failure
Same PYQ in roughly 2–3 days.

### Moderate dimensions/evidence issue
Repair Topic, then same/similar PYQ in ~7 days.

### Strong attempt
Move to a different PYQ in the same Demand Cluster after roughly 2–3 weeks.

## 22. Next Action engine

Priority:
1. overdue PYQ reattempt;
2. recurring severe weakness repair;
3. overdue Priority-A recall;
4. strong recall + no practice → Outline PYQ;
5. repeated outlines + no timed attempt → Timed answer;
6. weak individual Recall prompt;
7. new prepared Topic;
8. Stable maintenance.

Labels identify actual tasks.

Good:
> Parliamentary Committees — evidence recall

Bad:
> Revise Parliamentary Committees

## 23. Topic study rail

Desktop rail should show:

```text
Stage
Recall
Application
PYQ attempts
Recurring weaknesses
Next Due
Next Action
```

Mobile: collapsible panel.

No XP, streak or rank.

## 24. Dashboard

Top:
- Continue
- Due Today
- Next Actions

Paper summaries:
- GS-I
- GS-II
- GS-III
- GS-IV
- Essay
- Sociology-I
- Sociology-II

Useful counts:
- Stable
- Applied
- Recall Ready
- Learning
- Not Started

PYQ counts:
- Outlined
- Timed
- Untouched

Recurring weakness counts.

Useful filters:
- Strong Recall + Zero Practice
- PYQ Attempted + Topic Weak
- Repeated Evidence Weakness
- Due Diagrams
- Weak Thinker Recall
- Untouched High-PYQ Topic

No XP/rank system.

## 25. Search

One global command palette using:
- `/`
- Cmd/Ctrl+K

Search:
- Topic title
- Thesis
- Demand labels
- Concepts
- Arguments
- Evidence
- Thinkers
- PYQ text

Ranking:

> Topic title > Priority-A argument > Demand > Evidence/Thinker > Priority-B > Deep

Support paper filtering.

## 26. Design system

Port/adapt the philosophy and tokens of Study Vault Prelims, not its entire implementation.

Target character:
- paper-like `#FAF9F6` light background;
- restrained neutral surfaces;
- Atkinson Hyperlegible UI/reading stack;
- Source Serif heading stack;
- dark mode;
- narrow readable measure;
- subtle borders;
- subject accent;
- semantic Again/Hard/Good/Easy colours;
- sidebar may collapse in focused reading;
- desktop main column + sticky Study Rail;
- mobile rail collapsible;
- low animation.

Avoid:
- giant cards;
- gradients;
- gamification;
- decorative dashboard animations.

## 27. Settings / backup

Settings:
- theme;
- font preference;
- text size;
- density;
- reading width.

State:
- Export JSON backup
- Import JSON backup
- Reset study state with confirmation

Preserve migrations.

## 28. Prototype content

Codex must not generate substantive UPSC notes.

Development content:

### Production Core prototype
`gs2-polity-parliamentary-committees`

### Sociology synthesis fixture
`soc2-caste-changing-nature`

If required Core imports do not exist yet, keep Sociology synthesis under `tests/fixtures` rather than weakening validation.

## 29. Tests

At minimum:

### Content
- schema validation;
- duplicate IDs;
- missing refs;
- unknown PYQ IDs;
- circular imports;
- synthesis import resolution;
- reverse/backlink indexes.

### State/revision
- Again / Hard / Good / Easy;
- StudyStage derivation;
- RecallLevel derivation;
- ApplicationLevel derivation;
- recurring weakness;
- weakness resolution.

Acceptance:

```text
npm run content
npm run typecheck
npm test
npm run build
```

all pass.

## 30. Explicit non-goals

Do not implement:
- AI answer generation;
- AI grading;
- LLM calls;
- authentication;
- database;
- cloud sync;
- shared live state with PYQ Engine;
- current-affairs ingestion;
- graph database;
- XP/ranks/streaks;
- drag-and-drop answer building;
- PWA/service worker unless explicitly requested later;
- advanced analytics.

## 31. Delivery contract

Before coding:
1. inspect both reference repositories;
2. read all four docs in `docs/`;
3. produce a concise milestone implementation plan;
4. identify patterns reused conceptually from each reference;
5. show intended file structure.

Completion report must include:
- files created;
- architecture decisions;
- compiler behavior;
- routes;
- state/revision behavior;
- PYQ bridge behavior;
- test/build results;
- deferred items.

The result must be a usable MVP, not a mockup.

# Mains Study Vault — Product Specification

**Status:** Frozen MVP product contract  
**Version:** 1.0  
**Scope:** UPSC CSE Mains — GS I–IV, Essay, Sociology Optional I–II  
**Reference products:** `study-vault-prelims`, `pyq-engine`

## 1. Product purpose

Mains Study Vault is an **answer-generation, active-recall, revision and PYQ-application system**, not a digital textbook.

Preparation loop:

> **Syllabus → PYQs → Demand analysis → Concepts → Micro-arguments → Evidence / Thinkers / Visuals → Answer shells → Recall → PYQ practice → Weakness diagnosis → Targeted revision**

The system optimises for:
- exact question-demand coverage;
- fast retrieval under exam pressure;
- conversion of knowledge into answer-ready points;
- breadth without filler;
- evidence and disciplinary anchors attached to arguments;
- compact revision surfaces backed by deeper reference material;
- active recall and answer application rather than passive rereading.

Completeness is subordinate to **answerability**.

## 2. What to inherit from the existing products

### From Study Vault Prelims

Retain:
- quiet, content-first reader UX;
- stable permanent IDs;
- deterministic builds;
- global search;
- active recall;
- spaced revision;
- local user state separated from academic content;
- progressive disclosure;
- restrained visual design;
- fast/offline-like interaction;
- export/import of progress.

Do **not** reuse the Prelims Master Sheet content model. Prelims is built around atomic factual lines; Mains is built around **demand-linked arguments and their relationships**.

### From PYQ Engine

Retain conceptually:
- structured content types;
- build-time generation;
- statically rendered topic pages;
- stable canonical PYQ IDs;
- content/state separation;
- client-side progress adapter;
- global command-palette search;
- question-level practice identity.

Do **not** duplicate the complete PYQ database inside Mains Vault.

## 3. Canonical ownership

| Information | Canonical owner |
|---|---|
| UPSC question text | PYQ Engine |
| PYQ ID, year, marks, original classification | PYQ Engine |
| Topper/model-answer resources | PYQ Engine |
| Preparation topic taxonomy | Mains Vault |
| Topic ↔ PYQ mapping | Mains Vault |
| Demand clusters | Mains Vault |
| Micro-arguments | Mains Vault |
| Evidence registry | Mains Vault |
| Thinker registry | Mains Vault |
| Visual registry | Mains Vault |
| Framework registry | Mains Vault |
| Detailed objective facts / Prelims traps | Prelims Vault |
| Recall/practice/weakness state | User state |
| Long-term answer-attempt identity | Canonical `pyqId` |

The relevant paper universe is:

`GS1, GS2, GS3, GS4, ESSAY, SOC1, SOC2`

`ECO1` and `ECO2` may remain in PYQ Engine but must not surface in this user's Mains Vault.

## 4. Fundamental preparation unit: Answerable Topic Node

The fundamental unit is an **Answerable Topic Node**, not a whole syllabus line and not an individual PYQ.

A Topic Node is justified when it can support an independent UPSC demand and has a coherent reusable body of concepts, arguments, evidence, critique/nuance, visuals and answer structures.

Example: `Parliament & State Legislatures` is too broad. It should split into independently answerable nodes such as Parliamentary Committees, Speaker, Anti-defection, Legislative Scrutiny, Privileges, Bicameralism and Ordinances.

Topic/PYQ mapping is many-to-many.

## 5. Topic types

### Core Topic
Owns reusable canonical arguments.

Examples:
- `gs2-polity-parliamentary-committees`
- `soc2-caste-sanskritisation`
- `soc2-caste-dominant-caste`

### Synthesis Topic
Assembles arguments from multiple Core Topics and may add a small number of synthesis-specific arguments.

Example: `soc2-caste-changing-nature` may import from Sanskritisation, Dominant Caste, Caste–Class–Power, Caste and Politics, Endogamy and Dalit Assertion.

A Synthesis Topic must reference canonical arguments instead of copying them.

## 6. Universal topic envelope

Every GS or Sociology topic contains:
- stable Topic ID;
- paper and syllabus location;
- scope boundary;
- PYQ references;
- PYQ Demand Map;
- core thesis;
- concepts;
- paper-specific micro-arguments;
- evidence / thinker / visual references;
- answer shells;
- recall surface;
- recall prompts;
- practice links;
- Deep/reference material where needed.

Mutable personal state is never embedded into academic topic files.

## 7. PYQ-driven content methodology

For every topic:

1. Identify syllabus boundary.
2. Pull all relevant canonical PYQs.
3. Atomize each into directive, object, qualifier, core demand, subsidiary demands, implicit demand, required lenses and useful evidence type.
4. Cluster by recurring demand rather than keywords.
5. Build the Demand Map.
6. Read the user's base/coaching/topper material.
7. Extract concepts and reusable answer-ready arguments.
8. Remove duplication and non-answerable textbook filler.
9. Identify missing demand coverage.
10. Add only necessary evidence, thinkers and visuals.
11. Build analytical pairings/tensions.
12. Build answer shells.
13. Compress the Recall Card.
14. Generate active-recall prompts.
15. Verify current/fragile evidence.
16. Test against every linked PYQ and several plausible future transformations.

Future variants are **transformations of known demands, not predictions**. Normally cap them at 3–6 per topic.

## 8. GS writing standard

### Atomic unit

> **Keyword → claim/mechanism → evidence where useful → payoff to demand**

Rules:
- one distinct idea per point;
- short, direct English;
- exam-usable keyword lead;
- mechanism is preferable to assertion;
- evidence must strengthen a specific claim;
- avoid detached evidence dumps;
- reforms must repair diagnosed problems;
- use topic-specific dimensions;
- mark Core / Enrichment / Deep.

Evidence may include constitutional provisions, judgments, committees, reports, statistics, schemes, examples, case studies, comparisons and current developments.

Every evidence item must answer:

> **What claim does this prove or strengthen?**

Useful analytical pairings:
- Strength ↔ Limitation
- Problem ↔ Cause
- Problem ↔ Reform
- Benefit ↔ Risk
- Stakeholder ↔ Impact
- Theory ↔ Practice

## 9. Sociology writing standard

Sociology must read unmistakably as a disciplinary answer rather than GS with scholar names added.

### Atomic unit

> **Concept → mechanism → thinker/study/empirical anchor → payoff → critique/nuance**

Thinkers are analytical lenses, not decorations or biographies.

Preferred empirical assets:
- field studies;
- scholar findings;
- Indian sociological studies;
- movement/event;
- community example;
- survey/data where sociologically useful;
- contemporary application;
- comparative society.

Store empirical anchors as:

> **Finding/example → sociological interpretation → where to use it**

Critique must attack the actual analytical limitation. Possible lenses include conceptual, methodological, empirical, Marxist, feminist, subaltern, postcolonial, alternative thinker and contemporary relevance.

Typical analytical tensions:
- Change ↔ Persistence
- Structure ↔ Agency
- Consensus ↔ Conflict
- Tradition ↔ Modernity
- Caste ↔ Class
- Status ↔ Power
- Theory ↔ Empirical reality
- Macro ↔ Micro
- Continuity ↔ Transformation
- Thesis ↔ Critique

Use Paper I ↔ Paper II linkages where analytically genuine.

Current affairs are not Sociology assets until converted through:

> **Current issue → sociological concept → thinker/lens → implication**

## 10. Essay

Essay should not be prepared as one notebook per possible topic.

The intended unit is a reusable **Theme Module**, e.g. freedom/responsibility, knowledge/wisdom, technology/humanity, progress/sustainability, justice/equality, resilience/failure, democracy/dissent, education/creativity.

A Theme Module may contain central tensions, conceptual distinctions, reusable stories/examples, thinkers/quotes, Indian anchors, counterarguments, transitions and introduction/conclusion possibilities.

The first MVP must reserve `ESSAY` in navigation/search/content plumbing, but the specialised Essay schema must not block the GS/Sociology MVP.

## 11. Evidence provenance

Every evidence asset carries provenance and verification state:

- `verified`
- `source_only`
- `needs_verification`
- `time_sensitive`

Coaching/topper-note evidence begins as `source_only` unless checked against the original source.

Changing statistics carry `as_of` where relevant.

## 12. Visual assets

Visuals are first-class only when they compress reasoning and can be reproduced quickly.

Useful forms include maps, flows, cause-effect diagrams, cycles, matrices, comparison tables, stakeholder diagrams, timelines, institutional architecture, thinker comparisons, caste-class-power triangles and Paper I ↔ Paper II flows.

Each visual stores purpose, type, exact exam version, labels, linked demands/topics and approximate draw time.

The canonical asset is the **quick exam drawing**, not a polished website graphic.

## 13. Answer shells

Answer shells correspond to recurring **Demand Clusters**, not necessarily one individual PYQ.

They are retrieval structures, not model answers.

Typical GS shell:
> Introduction → Demand 1 → Demand 2 → Evidence → Limitation/Nuance → Reform if demanded → Conclusion

Typical Sociology shell:
> Sociological thesis → Concept/thinker lenses → Dimensions → Empirical anchors → Critique → Contemporary relevance → Synthesis

## 14. Human-facing topic page

Every topic has four modes over the **same underlying content**:

1. **Answer Kit**
2. **Recall**
3. **Practice**
4. **Deep**

There are not four duplicated documents.

### Answer Kit
Primary learning/repair surface:
1. PYQ Demand Map
2. Thesis
3. Core concepts
4. Visual/structure snapshot if useful
5. Priority-A arguments
6. Priority-B arguments
7. Analytical matrix/tension
8. Evidence/thinker anchors
9. Answer shells
10. Intro/conclusion anchors
11. Future variants
12. Deep links

A Demand filter should expose only the relevant subgraph.

### Recall
Memory-first:
> Prompt → Retrieve → Reveal → Compare → Again / Hard / Good / Easy

It must test argument generation, dimensions, evidence, thinkers/studies, visuals and answer structuring. It must not simply blur the note.

### Practice
The marks-conversion surface.

Show canonical PYQ and initially hide Vault material.

Modes:
- Outline
- Timed Answer
- Full Untimed

The answer may be handwritten; do not force 250 typed words.

After completion, reveal only the question-relevant subgraph.

### Deep
Reference and understanding-repair layer.

Opening Deep gives no mastery credit.

Ideal loop:
> Failure → Deep explanation → Close source → Recall again

## 15. Density and anti-bloat ceilings

| Component | Normal ceiling |
|---|---:|
| Core thesis | 1–2 sentences |
| Core concepts | 3–6 |
| Core micro-arguments | 6–10 |
| Core evidence/empirical anchors | 3–6 |
| Core visuals | 0–2 |
| Intro anchors | ≤3 |
| Conclusion anchors | ≤3 |
| Future variants | 3–6 |
| Answer Kit | ~700–1,100 words |
| Recall surface | ~200–300 words equivalent |
| Answer shells | usually 2–4 |

These are diagnostic ceilings, not arbitrary truncation rules.

## 16. Topic acceptance test

Universal:
- Demand coverage;
- future robustness;
- distinct arguments;
- near-exam language;
- evidence tied to claims;
- quick retrieval;
- meaningful compression;
- reproducible visuals.

Sociology additionally:
- unmistakable disciplinary lens;
- thinkers analytical rather than decorative;
- empirical grounding;
- genuine critique/nuance;
- appropriate Paper I–II linkage.

## 17. Revision philosophy

The Vault measures **retrieval and application, not page consumption**.

Opening pages or reading Deep does not increase mastery.

Three dimensions:
- Recall: Weak → Functional → Strong
- Application: Unpractised → Outlined → Timed → Stable
- Weakness burden: active/resolved

Derived Study Stage:
> Not Started → Learning → Recall Ready → Applied → Stable

No arbitrary mastery percentage.

### Stable requires

Recall:
- two successful Recall sessions;
- on separate dates;
- at least one ≥7 days after initial study.

Application:
- at least one timed answer or two serious outlines;
- across different Demand Clusters where possible.

Weakness:
- no unresolved high-severity recurring weakness.

## 18. Weakness philosophy

Track weakness events, not permanent labels.

Universal vocabulary:
- demand-decoding
- insufficient-dimensions
- generic-content
- weak-evidence
- factual-uncertainty
- poor-structure
- weak-introduction
- weak-conclusion
- weak-visual-use
- time-management
- incomplete-answer

Sociology-specific:
- gs-style-answer
- weak-sociological-concepts
- decorative-thinkers
- weak-empirical-grounding
- missing-critique
- weak-paper1-paper2-linkage

Recurring weakness:
- 2+ observations on separate occasions; or
- one severity-3 observation.

A weakness is not fixed by rereading. Require later successful retrieval/application demonstrations.

## 19. Next Action philosophy

The dashboard's main question is:

> **What should I do next?**

Priority:
1. overdue PYQ reattempt;
2. recurring severe weakness repair;
3. overdue Priority-A recall;
4. strong recall + no practice → outline PYQ;
5. repeated outlines + no timed answer → timed answer;
6. weak individual prompt;
7. newly prepared topic;
8. Stable-topic maintenance.

Prefer:
> `Parliamentary Committees — evidence recall`

over:
> `Revise Parliamentary Committees`

## 20. Productive-procrastination safeguards

- prove architecture on real topics before expanding UI;
- add features only after recurring friction;
- follow content building with recall/application;
- do not build speculative giant evidence databases;
- manual workflow before automation;
- no aesthetic rewrites for their own sake;
- no AI chat, gamification, advanced analytics, cloud sync or recommendation engines in MVP.

## 21. MVP scope

### Build now
- GS1–GS4 / Sociology I–II / Essay category plumbing;
- topic hierarchy;
- YAML content pipeline;
- strict validator/compiler;
- Answer Kit;
- Recall;
- Practice;
- Deep;
- direct PYQ Engine links;
- demand maps;
- micro-arguments;
- evidence/thinker/visual registries;
- answer shells;
- recall prompts;
- local study/progress/weakness state;
- revision queue;
- search;
- backup/import;
- responsive light/dark reader.

### Defer
- AI generation or grading;
- authentication;
- database;
- cloud sync;
- shared live state with PYQ Engine;
- automatic current-affairs ingestion;
- graph database;
- advanced analytics;
- gamification;
- drag-and-drop answer builder;
- automatic answer evaluation;
- PWA/service-worker work unless later justified.

## 22. Validated prototypes

The architecture has been stress-tested conceptually against:

1. **GS2 — Parliamentary Committees**
2. **Sociology II — Changing Nature of Caste**

The Sociology prototype permanently added:
- `node_type: core | synthesis`
- evidence provenance/verification state

These are frozen for MVP.

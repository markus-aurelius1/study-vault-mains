# Mains Study Vault — Frozen Decisions & Guardrails

**Purpose:** This file is intentionally short. It records decisions that Codex must not casually redesign.

## 1. Frozen product decisions

1. The product is an **UPSC Mains answer-generation / recall / practice system**, not a digital textbook.
2. Build a **new repository/application**. Do not modify `study-vault-prelims` or `pyq-engine`.
3. The technical base is **Next.js + React + TypeScript**.
4. Human-authored academic content is **YAML**.
5. Runtime/build output is generated JSON.
6. The fundamental preparation unit is an **Answerable Topic Node**.
7. Topic types are `core` and `synthesis`.
8. The fundamental answer unit is a **MicroArgument**.
9. PYQ mappings are many-to-many.
10. PYQ Engine remains canonical for PYQ text/year/marks/resources.
11. Mains Vault owns Topic ↔ PYQ and Demand mapping.
12. Stable canonical IDs must not depend on display titles or array positions.
13. Global reusable registries: evidence, thinkers, visuals, frameworks, sources.
14. Topic-local: demands, concepts, answer shells, intro/conclusion anchors, Recall prompts, analytical views, Deep sections.
15. `ECO1` and `ECO2` are excluded from this user's Vault.
16. Academic content and personal state remain completely separate.
17. Four modes over one content model: Answer Kit, Recall, Practice, Deep.
18. Answer Kit is the learning/repair surface.
19. Recall is memory-first and uses Again/Hard/Good/Easy.
20. Practice is PYQ-first and may assume handwritten answers.
21. Deep is understanding/reference and gives no mastery credit.
22. No arbitrary mastery percentage.
23. Stability requires both retrieval and application.
24. Weaknesses are event-based and require later demonstrations to resolve.
25. Evidence has provenance and verification status.
26. Synthesis Topics import canonical arguments rather than copy them.
27. The system should primarily answer: **What should I do next?**

## 2. Frozen academic rules

GS:

> **Keyword → claim/mechanism → evidence where useful → payoff**

Sociology:

> **Concept → mechanism → thinker/study/empirical anchor → payoff → critique**

Thinkers must be analytical, not decorative.

Evidence must strengthen a specific argument.

Frameworks are retrieval aids, not mandatory headings.

Visuals must be reproducible quickly in the examination.

Answer shells are retrieval structures, not model answers.

## 3. Frozen revision rules

Base Recall intervals:

```text
D0 → D3 → D7 → D21 → D45 → D90
```

Ratings:
- Again → due tomorrow; regress where possible
- Hard → same stage; shorter interval
- Good → advance one stage
- Easy → advance two stages, capped

Topic due date is derived from the earliest due Priority-A prompt.

Opening/scrolling/read-time does not create mastery.

## 4. Frozen UX rules

Retain the Study Vault Prelims character:
- content-first;
- restrained;
- paper-like;
- readable;
- low-noise;
- light/dark;
- keyboard-friendly;
- progressive disclosure.

Do not introduce:
- XP;
- ranks;
- streak pressure;
- badges;
- giant metric cards;
- gradients;
- decorative animation;
- reading-time-as-success.

## 5. MVP non-goals

Do not add unless explicitly requested later:
- AI generation;
- AI grading;
- LLM calls;
- authentication;
- database;
- cloud sync;
- graph database;
- automatic current-affairs ingestion;
- shared live progress with PYQ Engine;
- advanced analytics;
- drag-and-drop answer builder;
- PWA/service-worker work.

## 6. Reference repositories

Treat as read-only references:
- `https://github.com/markus-aurelius1/study-vault-prelims`
- `https://github.com/markus-aurelius1/pyq-engine`

Primary patterns to inspect are listed in `IMPLEMENTATION_ARCHITECTURE.md`.

## 7. Change-control rule

If an implementation detail is ambiguous:

> choose the simplest solution consistent with the specification.

If a frozen decision appears technically impossible:
1. do not silently redesign it;
2. document the conflict;
3. explain the minimum required change;
4. wait for explicit approval before changing product architecture.

## 8. Essay scope note

The application must reserve Essay as a supported paper/category.

The specialized Theme Module authoring schema may be finalized after the GS/Sociology MVP. Do not let Essay-specific overengineering block initial implementation.

## 9. Acceptance gates

A substantial implementation is incomplete until:

```text
npm run content
npm run typecheck
npm test
npm run build
```

all pass.

Content compiler failures must be explicit rather than silently dropping broken content.

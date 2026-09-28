# Mains Study Vault — Content Schema

**Status:** Frozen Stage 4B authoring contract  
**Schema version:** `mains-topic-v1`

## 1. Authoring strategy

Human-authored academic content uses **YAML**.

Build-time output uses JSON.

> **Human-authored YAML → schema validation → relationship resolution → compiled JSON → UI**

Do not hand-author runtime JSON. Markdown may be used inside text fields, but Markdown is not the structural schema.

## 2. Source tree

```text
content-src/
├── topics/
│   ├── gs1/
│   ├── gs2/
│   ├── gs3/
│   ├── gs4/
│   ├── essay/
│   ├── soc1/
│   └── soc2/
├── assets/
│   ├── evidence/
│   ├── thinkers/
│   ├── visuals/
│   └── frameworks/
├── syllabus/
└── sources/
```

Generated output lives under `content/` and must never be hand-edited.

## 3. ID rules

Examples:

```text
Topic:      gs2-polity-parliamentary-committees
Core Soc:   soc2-caste-sanskritisation
Synthesis:  soc2-caste-changing-nature
Evidence:   ev-soc-gould-lucknow
Thinker:    th-mn-srinivas
Visual:     vis-soc-caste-class-power
Framework:  fw-continuity-change
```

Topic-local object:

```text
specialised-scrutiny
```

Compiled canonical object:

```text
gs2-polity-parliamentary-committees#specialised-scrutiny
```

Published IDs are permanent. Titles may change without changing IDs.

## 4. Topic schema

```yaml
schema: mains-topic-v1

id:
title:
paper:
optional_id: null

node_type: core   # core | synthesis

syllabus:
  primary:
  secondary: []

scope:
  includes: []
  excludes: []
  cross_links: []

thesis:

pyqs: []
demands: []
concepts: []
arguments: []
imports: []

thinker_refs: []
evidence_refs: []
visual_refs: []
framework_refs: []

analytical_views: []
answer_shells: []

intro_anchors: []
conclusion_anchors: []

future_variants: []

recall:
  summary:
  prompts: []

deep_sections: []

sources: []

meta:
  status:
  version:
  last_academic_review:
```

## 5. PYQ references

Do not copy canonical question text into Topic YAML.

```yaml
pyqs:
  - id: GS2-73
    role: primary
    demand_refs:
      - structure
      - financial-control
```

Valid roles:
- `primary`
- `secondary`
- `contextual`

PYQ Engine owns text/year/marks/resources. Mains Vault owns preparation mapping.

## 6. Demand schema

```yaml
demands:
  - id: effectiveness
    label: Effectiveness of committee system
    description: >
      Evaluate whether committees translate formal parliamentary
      oversight into substantive accountability.
    directives:
      - evaluate
      - examine
      - critically-examine
    argument_refs:
      core:
        - executive-accountability
        - specialised-scrutiny
      supporting:
        - deliberative-space
      critique:
        - low-referral
        - advisory-character
```

Demands are topic-local.

## 7. Concept schema

```yaml
concepts:
  - id: power-of-purse
    label: Power of the purse
    definition: >
      Legislative control over public finance through authorisation,
      scrutiny and post-expenditure accountability.
    use: Financial committee questions.
```

Concepts remain topic-local in MVP.

## 8. MicroArgument schema

### GS

```yaml
arguments:
  - id: specialised-scrutiny
    keyword: Specialised scrutiny
    line: >
      Repeated ministry-specific examination permits detailed scrutiny
      beyond limited floor time, improving legislative quality.
    dimensions:
      - institutional
      - legislative
    demand_refs:
      - utility
      - effectiveness
    evidence_refs:
      - ev-gs2-motor-vehicles-committee
    thinker_refs: []
    counterpoint_refs: []
    priority: A
```

### Sociology

```yaml
arguments:
  - id: public-private-persistence
    keyword: Public secularisation, private persistence
    line: >
      Occupational interaction may weaken commensal restrictions,
      while kinship and marriage continue to reproduce caste closure.
    dimensions:
      - urbanisation
      - kinship
      - social-closure
    demand_refs:
      - transformation
      - persistence
    evidence_refs:
      - ev-soc-gould-lucknow
    thinker_refs:
      - th-harold-gould
    priority: A
```

Priority:
- `A` = Recall surface / core retrieval
- `B` = Answer Kit enrichment
- `C` = Deep/enrichment only

## 9. Synthesis imports

```yaml
imports:
  - ref: soc2-caste-sanskritisation#positional-not-structural
    alias: mobility-without-abolition
    priority: A

  - ref: soc2-caste-dominant-caste#secular-power
    priority: A
```

Rules:
- imported argument remains canonical in its Core Topic;
- synthesis cannot mutate imported canonical text;
- alias may provide a local reference name;
- self-imports fail;
- circular imports fail;
- missing targets fail.

## 10. Evidence registry

```yaml
- id: ev-soc-gould-lucknow
  title: Harold Gould — Lucknow rickshaw pullers
  type: field-study

  exam_line: >
    Gould found caste restrictions weakened during occupational
    interaction but reappeared in domestic life; commensality
    weakened while connubium persisted.

  implication: >
    Supports the distinction between public secularisation and
    private persistence of caste.

  verification:
    status: source_only
    as_of: null
    checked_on: null

  sources:
    - source_id: src-neha-bhosle-p2
      page: 102

  tags:
    - caste
    - urbanisation
    - endogamy
    - persistence
```

Verification status:
- `verified`
- `source_only`
- `needs_verification`
- `time_sensitive`

A `verified` asset requires provenance.

## 11. Source registry

Conversation/runtime file IDs are never permanent source identifiers.

```yaml
- id: src-neha-bhosle-p2
  title: Sociology Optional Notes — Paper II
  author: Neha Bhosle
  type: topper-notes
  year: null
  local_file: null
  notes: User-provided Paper II Sociology notes.

- id: src-smriti-shah-p2
  title: Sociology Smriti Shah Paper II
  author: Smriti Shah
  type: coaching-notes

- id: src-levelup-p2
  title: LevelUp Sociology Paper II
  type: coaching-reference
```

Official/web sources may additionally store URL, publisher, publication date and check/access date.

## 12. Thinker registry

```yaml
- id: th-mn-srinivas
  name: M. N. Srinivas
  paper_use:
    - SOC1
    - SOC2

  one_line_lens: >
    Explains social mobility and local caste power through
    Sanskritisation, Westernisation and dominant caste.

  concepts:
    - Sanskritisation
    - Westernisation
    - dominant caste

  studies:
    - Rampura

  critiques:
    - village-centric
    - underplays macro political economy
    - limited Dalit/subaltern perspective

  source_refs:
    - src-neha-bhosle-p2
```

Registry stores the thinker once. Topic arguments define the topic-specific analytical use.

## 13. Visual registry

```yaml
- id: vis-soc-caste-class-power
  title: Caste–Class–Power Triangle
  type: triangle

  purpose: >
    Show Beteille's differentiated dimensions of stratification.

  exam_version: |
        Power
       /     \
    Caste — Class

  labels:
    - Caste
    - Class
    - Power

  draw_seconds: 15

  use_for:
    - caste-class-power
    - changing-nature-of-caste
```

The canonical representation is the quick exam version.

## 14. Framework registry

```yaml
- id: fw-continuity-change
  title: Continuity ↔ Change
  type: analytical-lens

  prompts:
    - What has weakened?
    - What persists?
    - What has changed form?
    - Which mechanism reproduces continuity?
    - Which new institution changes the old structure?

  use_when:
    - social transformation
    - institutional evolution

  avoid_when:
    - purely definitional questions
```

Frameworks are aids, not mandatory answer templates.

## 15. Analytical views

### GS

```yaml
analytical_views:
  - id: strength-limitation-repair
    type: paired-matrix
    title: Strength ↔ Limitation ↔ Repair
    rows:
      - left: specialised-scrutiny
        middle: low-referral
        right: mandatory-referral
```

### Sociology

```yaml
analytical_views:
  - id: change-persistence
    type: comparison
    title: Change ↔ Persistence
    rows:
      - dimension: Occupation
        left: occupational-deinstitutionalisation
        right: caste-class-differentiation
```

Rows reference arguments instead of duplicating text.

## 16. Answer shell

```yaml
answer_shells:
  - id: evaluate-effectiveness-15m
    title: Evaluate committee effectiveness
    marks: [15]
    demand_refs:
      - effectiveness
    sections:
      - label: Introduction
        function: thesis
      - label: Contribution
        argument_refs:
          - specialised-scrutiny
          - executive-accountability
          - financial-control
      - label: Limitations
        argument_refs:
          - low-referral
          - short-tenure
          - advisory-character
      - label: Reform
        argument_refs:
          - mandatory-referral
          - research-support
      - label: Conclusion
        function: synthesis
```

## 17. Recall schema

```yaml
recall:
  summary:
    thesis: true
    argument_refs:
      - specialised-scrutiny
      - specialisation
      - executive-accountability
    evidence_refs:
      - ev-gs2-motor-vehicles-committee
    visual_refs:
      - vis-gs2-parliamentary-committee-tree

  prompts:
    - id: roles-seven
      type: generate
      prompt: Generate seven functions of parliamentary committees.
      targets:
        - specialised-scrutiny
        - specialisation
        - executive-accountability

    - id: draw-structure
      type: diagram
      prompt: Draw the parliamentary committee classification.
      targets:
        - vis-gs2-parliamentary-committee-tree
```

Supported prompt types:
- `thesis`
- `generate`
- `compare`
- `mechanism`
- `evidence`
- `thinker`
- `diagram`
- `framework`
- `pyq-outline`
- `synthesis`

Prompts target canonical assets rather than duplicate answers.

## 18. Deep sections

Deep is deliberately less normalized.

```yaml
deep_sections:
  - id: detailed-classification
    title: Detailed committee classification
    body: >
      Full classification, membership, tenure and procedural details
      required for understanding and factual repair.
    source_refs:
      - src-mcf-polity-lbn
```

## 19. User state is forbidden in content

Never store:
- last revised;
- confidence;
- answers written;
- weaknesses;
- next revision;
- timers;
- attempt scores.

These belong in runtime state.

---

# 20. Complete sample — Parliamentary Committees

```yaml
schema: mains-topic-v1

id: gs2-polity-parliamentary-committees
title: Parliamentary Committees
paper: GS2
optional_id: null
node_type: core

syllabus:
  primary: gs2-polity-parliament-state-legislatures
  secondary:
    - gs2-governance-accountability

scope:
  includes:
    - committee system
    - department-related standing committees
    - financial committees
    - legislative scrutiny
    - executive accountability
    - committee effectiveness
    - committee reform
  excludes:
    - Speaker
    - anti-defection
    - parliamentary privileges
    - bicameralism
  cross_links:
    - gs2-polity-legislative-scrutiny
    - gs2-polity-executive-accountability

thesis: >
  Parliamentary committees convert episodic floor accountability
  into continuous, specialised and relatively deliberative scrutiny
  of legislation, expenditure and administration.

pyqs:
  - id: GS2-63
    role: primary
    demand_refs: [executive-accountability, financial-control]
  - id: GS2-64
    role: primary
    demand_refs: [utility, financial-control]
  - id: GS2-69
    role: primary
    demand_refs: [executive-accountability, effectiveness]
  - id: GS2-73
    role: primary
    demand_refs: [structure, financial-control, institutionalisation]

demands:
  - id: structure
    label: Structure of the committee system
    directives: [explain]
    argument_refs:
      core: [standing-ad-hoc, financial-committee-distinction]

  - id: utility
    label: Why committees are useful
    directives: [discuss, examine]
    argument_refs:
      core:
        - specialised-scrutiny
        - specialisation
        - executive-accountability
        - deliberative-space
        - expert-input

  - id: executive-accountability
    label: Executive accountability
    directives: [discuss, evaluate]
    argument_refs:
      core: [executive-accountability, specialised-scrutiny]
      critique: [advisory-character, weak-follow-through]

  - id: financial-control
    label: Financial control
    directives: [discuss, explain]
    argument_refs:
      core: [financial-control, financial-committee-distinction]

  - id: effectiveness
    label: Effectiveness of committees
    directives: [evaluate, critically-examine]
    argument_refs:
      core: [specialised-scrutiny, executive-accountability]
      critique:
        - low-referral
        - short-tenure
        - research-deficit
        - advisory-character

  - id: institutionalisation
    label: Institutionalisation of Parliament
    directives: [evaluate, examine]
    argument_refs:
      core: [burden-sharing, specialisation, financial-control]

concepts:
  - id: power-of-purse
    label: Power of the purse
    definition: >
      Parliament's authority to authorise, scrutinise and review
      public expenditure.

arguments:
  - id: standing-ad-hoc
    keyword: Standing and ad hoc committees
    line: >
      The committee system combines permanent standing bodies with
      issue- or Bill-specific ad hoc committees.
    dimensions: [institutional]
    demand_refs: [structure]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: specialised-scrutiny
    keyword: Specialised scrutiny
    line: >
      Detailed ministry- and subject-specific examination compensates
      for limited floor time and improves legislative scrutiny.
    dimensions: [institutional, legislative]
    demand_refs: [utility, executive-accountability, effectiveness]
    evidence_refs: [ev-gs2-motor-vehicles-committee]
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: specialisation
    keyword: Legislative specialisation
    line: >
      Repeated sectoral exposure develops domain familiarity among MPs
      and narrows the legislature–executive information gap.
    dimensions: [institutional]
    demand_refs: [utility, institutionalisation]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: executive-accountability
    keyword: Continuous executive accountability
    line: >
      Ministries and officials face detailed examination beyond episodic
      floor mechanisms, extending parliamentary oversight.
    dimensions: [accountability, governance]
    demand_refs: [executive-accountability, effectiveness]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: financial-control
    keyword: Financial accountability
    line: >
      PAC, Estimates Committee and COPU operationalise Parliament's
      power of the purse through complementary forms of scrutiny.
    dimensions: [financial, institutional]
    demand_refs: [financial-control, institutionalisation]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: financial-committee-distinction
    keyword: Complementary financial scrutiny
    line: >
      PAC examines propriety of expenditure, Estimates Committee stresses
      economy and efficiency, while COPU scrutinises public enterprises.
    dimensions: [financial]
    demand_refs: [structure, financial-control]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: deliberative-space
    keyword: Deliberative space
    line: >
      Smaller cross-party forums permit less adversarial and more detailed
      discussion than the full House.
    dimensions: [political, deliberative]
    demand_refs: [utility]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: expert-input
    keyword: Expert and stakeholder input
    line: >
      Committees can obtain specialised testimony and official evidence,
      making legislative examination more evidence-based.
    dimensions: [institutional]
    demand_refs: [utility]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: B

  - id: burden-sharing
    keyword: Institutional burden sharing
    line: >
      Delegating technical scrutiny to smaller bodies frees floor time
      without surrendering parliamentary oversight.
    dimensions: [institutional]
    demand_refs: [institutionalisation]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: B

  - id: low-referral
    keyword: Declining referral
    line: >
      When major Bills bypass committee scrutiny, Parliament loses an
      important stage of detailed legislative examination.
    dimensions: [legislative]
    demand_refs: [effectiveness]
    evidence_refs: [ev-gs2-bill-referral-17ls]
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: short-tenure
    keyword: Weak institutional memory
    line: >
      Short committee tenure limits continuity and accumulation of
      subject expertise.
    dimensions: [institutional]
    demand_refs: [effectiveness]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: research-deficit
    keyword: Research-capacity deficit
    line: >
      Limited dedicated expert support constrains scrutiny of increasingly
      technical legislation and policy.
    dimensions: [institutional]
    demand_refs: [effectiveness]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: advisory-character
    keyword: Advisory recommendations
    line: >
      Committee recommendations generally lack binding force, weakening
      implementation where executive follow-through is poor.
    dimensions: [accountability]
    demand_refs: [executive-accountability, effectiveness]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: weak-follow-through
    keyword: Weak follow-through
    line: >
      Insufficient floor discussion and action on committee findings may
      reduce their institutional influence.
    dimensions: [institutional]
    demand_refs: [executive-accountability]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: B

  - id: mandatory-referral
    keyword: Presumptive Bill referral
    line: >
      Significant non-urgent Bills should ordinarily undergo committee
      scrutiny before final passage.
    dimensions: [reform]
    demand_refs: [effectiveness]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

  - id: research-support
    keyword: Professional committee support
    line: >
      Permanent research and domain expertise can strengthen continuity,
      technical scrutiny and institutional memory.
    dimensions: [reform]
    demand_refs: [effectiveness]
    evidence_refs: []
    thinker_refs: []
    counterpoint_refs: []
    priority: A

imports: []

thinker_refs: []

evidence_refs:
  - ev-gs2-motor-vehicles-committee
  - ev-gs2-bill-referral-17ls

visual_refs:
  - vis-gs2-parliamentary-committee-tree

framework_refs:
  - fw-institution-effectiveness

analytical_views:
  - id: strength-limitation-repair
    type: paired-matrix
    title: Strength ↔ Limitation ↔ Repair
    rows:
      - left: specialised-scrutiny
        middle: low-referral
        right: mandatory-referral
      - left: specialisation
        middle: short-tenure
        right: research-support
      - left: executive-accountability
        middle: advisory-character
        right: weak-follow-through

answer_shells:
  - id: utility-financial-10m
    title: Utility + financial committee
    marks: [10]
    demand_refs: [utility, financial-control]
    sections:
      - label: Introduction
        function: thesis
      - label: Utility
        argument_refs:
          - specialised-scrutiny
          - specialisation
          - executive-accountability
          - deliberative-space
          - expert-input
      - label: Financial dimension
        argument_refs:
          - financial-control
          - financial-committee-distinction
      - label: Conclusion
        function: synthesis

  - id: evaluate-effectiveness-15m
    title: Evaluate committee effectiveness
    marks: [15]
    demand_refs: [effectiveness]
    sections:
      - label: Introduction
        function: thesis
      - label: Contribution
        argument_refs:
          - specialised-scrutiny
          - executive-accountability
          - specialisation
          - financial-control
      - label: Limitations
        argument_refs:
          - low-referral
          - short-tenure
          - research-deficit
          - advisory-character
      - label: Reform
        argument_refs:
          - mandatory-referral
          - research-support
      - label: Conclusion
        function: synthesis

intro_anchors:
  - >
    Parliamentary committees act as the specialised extension of
    Parliament for detailed legislative and executive scrutiny.

conclusion_anchors:
  - >
    Effective committees convert formal parliamentary supremacy into
    substantive executive accountability while complementing floor debate.

future_variants:
  - Declining committee referral and quality of legislation
  - Committee system under conditions of executive dominance
  - Professional research capacity for parliamentary scrutiny
  - Effectiveness of non-binding committee recommendations
  - Expert and citizen participation in committee work

recall:
  summary:
    argument_refs:
      - specialised-scrutiny
      - specialisation
      - executive-accountability
      - financial-control
      - deliberative-space
      - low-referral
      - research-deficit
      - advisory-character
      - mandatory-referral
    evidence_refs:
      - ev-gs2-bill-referral-17ls
    visual_refs:
      - vis-gs2-parliamentary-committee-tree

  prompts:
    - id: functions-seven
      type: generate
      prompt: Generate seven functions of parliamentary committees.
      targets:
        - specialised-scrutiny
        - specialisation
        - executive-accountability
        - financial-control
        - deliberative-space
        - expert-input
        - burden-sharing

    - id: financial-distinction
      type: compare
      prompt: Distinguish PAC, Estimates Committee and COPU.
      targets:
        - financial-committee-distinction

    - id: evaluate-45s
      type: pyq-outline
      prompt: Build a 15-mark evaluation structure in 45 seconds.
      targets:
        - evaluate-effectiveness-15m

deep_sections:
  - id: detailed-classification
    title: Detailed committee classification
    body: >
      Full classification, membership, tenure and procedural details
      required for understanding and factual repair.

sources:
  - src-mcf-polity-lbn
  - src-mcn-polity

meta:
  status: prototype-validated
  version: 1
  last_academic_review: "2026-09-28"
```

# 21. Complete sample — Changing Nature of Caste

This is a **Synthesis Topic**. It assumes the referenced Core Topics exist. Until they do, keep it under test fixtures rather than weakening validation.

```yaml
schema: mains-topic-v1

id: soc2-caste-changing-nature
title: Changing Nature of Caste
paper: SOC2
optional_id: sociology
node_type: synthesis

syllabus:
  primary: soc2-social-structure-caste
  secondary:
    - soc2-social-change
    - soc2-politics-and-society

scope:
  includes:
    - transformation of caste
    - weakening and persistence
    - mobility
    - caste-class-power
    - caste and politics
    - endogamy
    - modern state
    - Dalit assertion
  excludes:
    - complete theories of individual caste thinkers
    - complete caste-politics topic
    - complete Sanskritisation topic
  cross_links:
    - soc2-caste-sanskritisation
    - soc2-caste-dominant-caste
    - soc2-caste-class-power
    - soc2-caste-politics
    - soc2-caste-endogamy
    - soc2-dalit-assertion

thesis: >
  Caste in contemporary India is undergoing institutional transformation
  rather than linear dissolution: ritual and occupational rigidities weaken
  unevenly while endogamy, inequality, identity and political mobilisation
  reproduce caste through altered mechanisms.

pyqs:
  - id: SOC2-93
    role: primary
    demand_refs: [transformation, illustration]
  - id: SOC2-85
    role: primary
    demand_refs: [cultural-change, structural-change]
  - id: SOC2-80
    role: primary
    demand_refs: [transformation, persistence, evaluation]
  - id: SOC2-69
    role: secondary
    demand_refs: [mobility, structural-change]
  - id: SOC2-67
    role: secondary
    demand_refs: [power-transformation]
  - id: SOC2-70
    role: secondary
    demand_refs: [caste-class-power]

demands:
  - id: transformation
    label: How caste has changed
    directives: [discuss, elaborate, examine]
    argument_refs:
      core:
        - occupational-deinstitutionalisation
        - public-private-persistence
        - vertical-to-horizontal
        - democratic-transformation
        - internal-class-differentiation

  - id: persistence
    label: Why caste persists
    directives: [discuss, assess, examine]
    argument_refs:
      core:
        - endogamy-persistence
        - political-reproduction
        - inequality-persistence
      critique:
        - transformation-not-disappearance

  - id: evaluation
    label: Changing, weakening or disintegrating?
    directives: [assess, critically-examine]
    argument_refs:
      core:
        - transformation-not-disappearance
        - public-private-persistence
        - mobility-without-abolition
        - vertical-to-horizontal

  - id: cultural-change
    label: Cultural change
    directives: [examine]
    argument_refs:
      core:
        - public-private-persistence
        - vertical-to-horizontal
        - assertion-over-emulation

  - id: structural-change
    label: Structural change
    directives: [examine]
    argument_refs:
      core:
        - occupational-deinstitutionalisation
        - internal-class-differentiation
        - democratic-transformation
        - mobility-without-abolition

  - id: power-transformation
    label: Changing bases of caste power
    directives: [explain, evaluate]
    argument_refs:
      core: [secular-power]

  - id: caste-class-power
    label: Caste–class–power differentiation
    directives: [analyse]
    argument_refs:
      core: [caste-class-differentiation]

concepts:
  - id: social-closure
    label: Social closure
    definition: >
      Mechanisms through which group boundaries restrict access to
      marriage, resources, status or opportunities.

  - id: positional-structural
    label: Positional vs structural change
    definition: >
      Mobility within an existing hierarchy differs from transformation
      of the hierarchy itself.

arguments:
  - id: transformation-not-disappearance
    keyword: Transformation ≠ disappearance
    line: >
      Decline of some ritual restrictions does not imply disappearance
      of caste when identity, closure and inequality persist through new forms.
    dimensions: [continuity-change]
    demand_refs: [transformation, persistence, evaluation]
    thinker_refs: [th-dipankar-gupta, th-andre-beteille]
    evidence_refs: []
    counterpoint_refs: []
    priority: A

  - id: public-private-persistence
    keyword: Public secularisation, private persistence
    line: >
      Caste restrictions may weaken in occupational interaction while
      kinship and marriage continue to reproduce caste boundaries.
    dimensions: [urbanisation, kinship, social-closure]
    demand_refs: [transformation, persistence, cultural-change]
    thinker_refs: [th-harold-gould]
    evidence_refs: [ev-soc-gould-lucknow]
    counterpoint_refs: []
    priority: A

  - id: vertical-to-horizontal
    keyword: Hierarchy to difference
    line: >
      Castes increasingly operate as self-assertive groups competing for
      recognition, resources and power rather than accepting one ritual ranking.
    dimensions: [identity, politics]
    demand_refs: [transformation, evaluation, cultural-change]
    thinker_refs: [th-dipankar-gupta]
    evidence_refs: []
    counterpoint_refs: []
    priority: A

  - id: democratic-transformation
    keyword: Democratisation of caste
    line: >
      Electoral competition and affirmative action transform caste into
      an instrument of representation, bargaining and resource claims.
    dimensions: [politics, state]
    demand_refs: [transformation, structural-change]
    thinker_refs: [th-rajni-kothari]
    evidence_refs: []
    counterpoint_refs: []
    priority: A

  - id: internal-class-differentiation
    keyword: Class within caste
    line: >
      Uneven gains from education, markets and state intervention generate
      internal class differentiation within caste groups.
    dimensions: [class, inequality]
    demand_refs: [transformation, structural-change, caste-class-power]
    thinker_refs: [th-andre-beteille]
    evidence_refs: []
    counterpoint_refs: []
    priority: A

  - id: mobility-without-abolition
    keyword: Mobility without structural abolition
    line: >
      Upward mobility may alter relative caste position without dismantling
      the hierarchical structure itself.
    dimensions: [mobility, hierarchy]
    demand_refs: [evaluation, structural-change]
    thinker_refs: [th-yogendra-singh, th-mn-srinivas]
    evidence_refs: []
    counterpoint_refs: []
    priority: A

  - id: assertion-over-emulation
    keyword: Assertion over emulation
    line: >
      Dalit and backward-caste mobilisation increasingly seeks dignity,
      rights and recognition rather than merely emulating upper-caste practices.
    dimensions: [agency, identity]
    demand_refs: [transformation, cultural-change]
    thinker_refs: [th-gail-omvedt]
    evidence_refs: []
    counterpoint_refs: []
    priority: B

imports:
  - ref: soc2-caste-occupation#occupational-deinstitutionalisation
    alias: occupational-deinstitutionalisation
    priority: A
  - ref: soc2-caste-dominant-caste#secular-power
    alias: secular-power
    priority: A
  - ref: soc2-caste-class-power#caste-class-differentiation
    alias: caste-class-differentiation
    priority: A
  - ref: soc2-caste-endogamy#endogamy-persistence
    alias: endogamy-persistence
    priority: A
  - ref: soc2-caste-politics#political-reproduction
    alias: political-reproduction
    priority: A
  - ref: soc2-caste-inequality#inequality-persistence
    alias: inequality-persistence
    priority: A

thinker_refs:
  - th-mn-srinivas
  - th-yogendra-singh
  - th-andre-beteille
  - th-dipankar-gupta
  - th-harold-gould
  - th-rajni-kothari
  - th-br-ambedkar
  - th-gail-omvedt

evidence_refs:
  - ev-soc-gould-lucknow
  - ev-soc-bailey-bisipara
  - ev-soc-beteille-sripuram

visual_refs:
  - vis-soc-continuity-change
  - vis-soc-caste-class-power

framework_refs:
  - fw-continuity-change
  - fw-structure-agency

analytical_views:
  - id: change-persistence
    type: comparison
    title: Change ↔ Persistence
    rows:
      - dimension: Occupation
        left: occupational-deinstitutionalisation
        right: caste-class-differentiation
      - dimension: Public interaction
        left: public-private-persistence
        right: endogamy-persistence
      - dimension: Hierarchy
        left: vertical-to-horizontal
        right: inequality-persistence
      - dimension: Politics
        left: democratic-transformation
        right: political-reproduction
      - dimension: Mobility
        left: mobility-without-abolition
        right: transformation-not-disappearance

answer_shells:
  - id: change-10m
    title: Cultural and structural changes
    marks: [10]
    demand_refs: [cultural-change, structural-change]
    sections:
      - label: Introduction
        function: thesis
      - label: Cultural change
        argument_refs:
          - public-private-persistence
          - vertical-to-horizontal
          - assertion-over-emulation
      - label: Structural change
        argument_refs:
          - occupational-deinstitutionalisation
          - secular-power
          - internal-class-differentiation
          - democratic-transformation
      - label: Qualification
        argument_refs:
          - endogamy-persistence
      - label: Conclusion
        function: synthesis

  - id: change-weakening-disintegration-20m
    title: Changing, weakening or disintegrating?
    marks: [20]
    demand_refs: [evaluation]
    sections:
      - label: Introduction
        function: thesis
      - label: Evidence of transformation
        argument_refs:
          - occupational-deinstitutionalisation
          - vertical-to-horizontal
          - democratic-transformation
          - internal-class-differentiation
      - label: Evidence of persistence
        argument_refs:
          - endogamy-persistence
          - political-reproduction
          - inequality-persistence
          - public-private-persistence
      - label: Sociological synthesis
        argument_refs:
          - mobility-without-abolition
          - transformation-not-disappearance
      - label: Conclusion
        function: synthesis

intro_anchors:
  - >
    Caste change should be judged not merely by decline of ritual practices
    but by whether mechanisms of closure, inequality and power disappear or transform.

conclusion_anchors:
  - >
    Contemporary caste is neither an unchanged traditional institution nor
    a disappearing relic; its social mechanisms are being recomposed through
    democracy, markets, state policy and identity assertion.

future_variants:
  - Does urbanisation weaken caste or merely relocate it?
  - Has caste shifted from hierarchy to competitive identity?
  - Does mobility undermine or reproduce caste?
  - How does democracy simultaneously weaken and strengthen caste?
  - Is endogamy the strongest contemporary mechanism of caste reproduction?

recall:
  summary:
    argument_refs:
      - occupational-deinstitutionalisation
      - public-private-persistence
      - vertical-to-horizontal
      - secular-power
      - mobility-without-abolition
      - democratic-transformation
      - internal-class-differentiation
      - endogamy-persistence
      - transformation-not-disappearance
    evidence_refs:
      - ev-soc-gould-lucknow
      - ev-soc-bailey-bisipara
      - ev-soc-beteille-sripuram
    visual_refs:
      - vis-soc-continuity-change
      - vis-soc-caste-class-power

  prompts:
    - id: dimensions-eight
      type: generate
      prompt: Generate eight dimensions showing transformation of caste.
      targets:
        - occupational-deinstitutionalisation
        - public-private-persistence
        - vertical-to-horizontal
        - secular-power
        - mobility-without-abolition
        - democratic-transformation
        - internal-class-differentiation
        - assertion-over-emulation

    - id: persistence-five
      type: generate
      prompt: Generate five mechanisms explaining persistence of caste.
      targets:
        - endogamy-persistence
        - political-reproduction
        - inequality-persistence
        - public-private-persistence
        - transformation-not-disappearance

    - id: thinker-map
      type: thinker
      prompt: Map Srinivas, Beteille, Gupta, Gould and Kothari to caste transformation.
      targets:
        - th-mn-srinivas
        - th-andre-beteille
        - th-dipankar-gupta
        - th-harold-gould
        - th-rajni-kothari

    - id: pyq-20m
      type: pyq-outline
      prompt: Build "changing, weakening or disintegrating?" in 60 seconds.
      targets:
        - change-weakening-disintegration-20m

deep_sections:
  - id: classical-baseline
    title: Traditional caste baseline
    body: >
      Ghurye's features, Dumont's purity-pollution hierarchy and the
      classical mechanisms of caste closure required to understand change.

  - id: detailed-transformation
    title: Detailed transformation mechanisms
    body: >
      Industrialisation, urbanisation, land reform, Green Revolution,
      affirmative action, Mandal-era politics and changing caste associations.

sources:
  - src-smriti-shah-p2
  - src-neha-bhosle-p2
  - src-levelup-p2

meta:
  status: prototype-validated
  version: 1
  last_academic_review: "2026-09-28"
```

## 22. Build validation

### Fail
- duplicate permanent ID;
- missing imported argument;
- unknown PYQ ID;
- unknown required evidence/thinker/visual/framework ref;
- synthesis self-import;
- circular synthesis import;
- argument references unknown demand;
- answer shell references missing argument;
- `verified` evidence lacks provenance;
- configured user universe includes `ECO1`/`ECO2`.

### Warn
- Recall references Priority-C/Deep-only material;
- evidence unused anywhere;
- argument has no demand usage;
- Core Topic has no PYQ and no explicit syllabus justification;
- orphan visual/framework.

The compiler should be strict academically, not merely syntactically.

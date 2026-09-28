'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { CompiledTopic } from '@/lib/content/types';
import { useProgress } from '@/lib/progress/provider';

export function AnswerKit({ topic }: { topic: CompiledTopic }) {
  const params = useSearchParams(), demandId = params.get('demand'), { store } = useProgress();
  const demand = topic.demands.find((item) => item.id === demandId);
  const argumentRefs = demand ? new Set([...demand.argument_refs.core, ...demand.argument_refs.supporting, ...demand.argument_refs.critique]) : null;
  const argumentsShown = topic.arguments.filter((argument) => argument.priority !== 'C' && (!argumentRefs || argumentRefs.has(argument.localRef)));
  const evidenceIds = new Set(argumentsShown.flatMap((argument) => argument.evidence_refs));
  const thinkerIds = new Set(argumentsShown.flatMap((argument) => argument.thinker_refs));
  const pyqs = topic.pyqs.filter((pyq) => !demand || pyq.demand_refs.includes(demand.id));
  const shells = topic.answer_shells.filter((shell) => !demand || shell.demand_refs.includes(demand.id));
  return <>
    <section className="section"><h2>PYQ Demand Map</h2><div className="demand-filter"><Link className={!demand ? 'active' : ''} href={`/topic/${topic.id}?mode=answer`}>All demands</Link>{topic.demands.map((item) => <Link className={demand?.id === item.id ? 'active' : ''} key={item.id} href={`/topic/${topic.id}?mode=answer&demand=${item.id}`}>{item.label}</Link>)}</div>
      {demand && <p><b>{demand.directives.join(' · ')}</b>{demand.description ? ` — ${demand.description}` : ''}</p>}
      <div className="paper-list">{pyqs.map((pyq) => <Link className="paper-link" key={pyq.id} href={`/topic/${topic.id}?mode=practice&pyq=${pyq.id}`}><span>{pyq.text}</span><small>{pyq.year} · {pyq.marks}m</small></Link>)}</div>
    </section>
    <section className="section"><h2>Core concepts</h2>{topic.concepts.map((concept) => <div key={concept.id}><h3>{concept.label}</h3><p>{concept.definition}</p></div>)}</section>
    <section className="section"><h2>Micro-arguments</h2>{argumentsShown.map((argument) => <article className="argument" key={argument.localRef}><b>{argument.keyword}</b><span>{argument.line}</span><div className="tags"><span className="tag">Priority {argument.priority}</span>{argument.dimensions.map((dimension) => <span className="tag" key={dimension}>{dimension}</span>)}</div></article>)}</section>
    {topic.analytical_views.map((view) => <section className="section" key={view.id}><h2>{view.title}</h2><table className="matrix"><tbody>{view.rows.map((row, i) => <tr key={i}>{Object.entries(row).map(([key, value]) => <td key={key}><small className="muted">{key}</small><br />{String(value)}</td>)}</tr>)}</tbody></table></section>)}
    {(evidenceIds.size > 0 || thinkerIds.size > 0) && <section className="section"><h2>Evidence and thinker anchors</h2>{topic.resolved.evidence.filter((item) => evidenceIds.has(item.id)).map((item) => <article key={item.id}><h3>{item.title}</h3><p>{item.exam_line}</p><p className="muted">{item.verification.status} · {item.implication}</p></article>)}{topic.resolved.thinkers.filter((item) => thinkerIds.has(item.id)).map((item) => <article key={item.id}><h3>{item.name}</h3><p>{item.one_line_lens}</p></article>)}</section>}
    {topic.resolved.visuals.length > 0 && <section className="section"><h2>Visual snapshot</h2>{topic.resolved.visuals.map((visual) => <article key={visual.id}><h3>{visual.title}</h3><pre>{visual.exam_version}</pre><p className="muted">Approx. {visual.draw_seconds}s · {visual.purpose}</p></article>)}</section>}
    {topic.resolved.frameworks.length > 0 && <section className="section"><h2>Retrieval frameworks</h2>{topic.resolved.frameworks.map((framework) => <article key={framework.id}><h3>{framework.title}</h3><ul>{framework.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul><p className="muted">Use when: {framework.use_when.join(', ')}. Frameworks are aids, not mandatory headings.</p></article>)}</section>}
    <section className="section"><h2>Answer shells</h2>{shells.map((shell) => <article key={shell.id}><h3>{shell.title} <span className="tag">{shell.marks.join('/')} marks</span></h3><ol>{shell.sections.map((section) => <li key={section.label}><b>{section.label}</b>{section.argument_refs?.length ? ` — ${section.argument_refs.join(', ')}` : ''}</li>)}</ol></article>)}</section>
    <section className="section"><h2>Openers, closers and transformations</h2><h3>Introduction</h3>{topic.intro_anchors.map((item) => <p key={item}>{item}</p>)}<h3>Conclusion</h3>{topic.conclusion_anchors.map((item) => <p key={item}>{item}</p>)}<h3>Future variants</h3><ul>{topic.future_variants.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <div className="mode-switch"><button className="btn primary" onClick={() => store.markStudied(topic.id, topic.recall.prompts.map((prompt) => `${topic.id}#${prompt.id}`))}>Study complete</button><Link className="btn" href={`/topic/${topic.id}?mode=recall`}>Recall this</Link><Link className="btn" href={`/topic/${topic.id}?mode=practice`}>Practice PYQ</Link><Link className="btn ghost" href={`/topic/${topic.id}?mode=deep`}>Open Deep</Link></div>
  </>;
}

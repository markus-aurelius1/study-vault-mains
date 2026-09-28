'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { CompiledTopic } from '@/lib/content/types';
import { useProgress } from '@/lib/progress/provider';
import { UNIVERSAL_WEAKNESSES, SOCIOLOGY_WEAKNESSES } from '@/lib/revision/weakness';

export function PracticeMode({ topic }: { topic: CompiledTopic }) {
  const params = useSearchParams(), { store } = useProgress();
  const pyq = topic.pyqs.find((item) => item.id === params.get('pyq')) ?? topic.pyqs[0];
  const [type, setType] = useState<'outline' | 'timed' | 'full'>('outline'), [started, setStarted] = useState<number | null>(null), [finished, setFinished] = useState(false), [plan, setPlan] = useState(''), [weakness, setWeakness] = useState('');
  const rubricNames = topic.paper.startsWith('SOC') ? ['Demand', 'Sociological lens', 'Concepts/thinkers', 'Empirical grounding', 'Critique/nuance', 'Structure/completion'] : ['Demand', 'Structure', 'Dimensions', 'Evidence', 'Analysis', 'Completion'];
  const [rubric, setRubric] = useState<Record<string, 0 | 1 | 2>>(() => Object.fromEntries(rubricNames.map((name) => [name, 1])));
  useEffect(() => { setStarted(null); setFinished(false); setPlan(''); }, [pyq?.id]);
  const demands = useMemo(() => pyq?.demand_refs ?? [], [pyq]);
  if (!pyq) return <p className="empty">No linked PYQ is available for this topic.</p>;
  const finish = () => {
    const completedAt = Date.now(), id = `attempt-${completedAt}-${Math.random().toString(36).slice(2, 7)}`, eventIds: string[] = [];
    if (weakness) { const eventId = `weak-${completedAt}-${Math.random().toString(36).slice(2, 7)}`; eventIds.push(eventId); store.addWeakness({ id: eventId, weaknessId: weakness, kind: 'observed', sourceType: 'practice', sourceId: id, targetType: 'topic', targetId: topic.id, severity: Math.min(3, Math.max(1, 3 - Math.min(...Object.values(rubric)))) as 1 | 2 | 3, observedAt: completedAt }); }
    store.addAttempt({ id, pyqId: pyq.id, startedAt: started ?? completedAt, completedAt, type, seconds: started ? Math.round((completedAt - started) / 1000) : 0, topicIds: [topic.id], demandIds: demands.map((id) => `${topic.id}#${id}`), rubric, weaknessEventIds: eventIds, reattemptDueAt: Object.values(rubric).some((score) => score === 0) ? completedAt + 3 * 86_400_000 : null }); setFinished(true);
  };
  const external = `${process.env.NEXT_PUBLIC_PYQ_ENGINE_BASE_URL ?? 'https://pyq-engine.vercel.app'}${pyq.href}#${pyq.id}`;
  return <>
    <section className="section"><div className="eyebrow">{pyq.year} · {pyq.marks} marks · {pyq.id}</div><p className="pyq">{pyq.text}</p><a href={external} target="_blank" rel="noreferrer">Open in PYQ Engine ↗</a>
      <div className="mode-switch">{(['outline', 'timed', 'full'] as const).map((item) => <button className={type === item ? 'active' : ''} key={item} onClick={() => setType(item)}>{item === 'full' ? 'Full Untimed' : item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      {!started ? <button className="btn primary" onClick={() => setStarted(Date.now())}>Start {type}</button> : !finished && <><p className="muted">Vault material remains hidden until Finish / Compare. A handwritten answer is expected; notes below are optional.</p><textarea value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Optional planning notes: directive, thesis, headings, arguments, evidence, nuance, conclusion…" /><h3>Self-review</h3><div className="rubric">{rubricNames.map((name) => <label className="rubric-row" key={name}><span>{name}</span><select value={rubric[name]} onChange={(e) => setRubric({ ...rubric, [name]: Number(e.target.value) as 0 | 1 | 2 })}><option value="0">0 — serious weakness</option><option value="1">1 — adequate</option><option value="2">2 — strong</option></select></label>)}</div><label className="settings-row"><span>Confirm a weakness event <small className="muted">optional; never inferred silently</small></span><select value={weakness} onChange={(e) => setWeakness(e.target.value)}><option value="">None</option>{[...UNIVERSAL_WEAKNESSES, ...(topic.paper.startsWith('SOC') ? SOCIOLOGY_WEAKNESSES : [])].map((item) => <option key={item}>{item}</option>)}</select></label><button className="btn primary" onClick={finish}>Finish and compare</button></>}
    </section>
    {finished && <section className="section"><h2>Question-relevant Answer Kit</h2>{topic.arguments.filter((argument) => argument.demand_refs.some((id) => demands.includes(id))).map((argument) => <article className="argument" key={argument.canonicalId}><b>{argument.keyword}</b>{argument.line}</article>)}</section>}
  </>;
}

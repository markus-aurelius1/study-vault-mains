'use client';

import { useMemo, useState } from 'react';
import type { CompiledTopic } from '@/lib/content/types';
import { useProgress } from '@/lib/progress/provider';
import type { RecallRating } from '@/lib/progress/types';

function answers(topic: CompiledTopic, targets: string[]) {
  return targets.map((target) => {
    const argument = topic.arguments.find((item) => item.localRef === target || item.canonicalId === target);
    if (argument) return `${argument.keyword} — ${argument.line}`;
    const shell = topic.answer_shells.find((item) => item.id === target); if (shell) return shell.sections.map((s) => s.label).join(' → ');
    const visual = topic.resolved.visuals.find((item) => item.id === target); if (visual) return visual.exam_version;
    const evidence = topic.resolved.evidence.find((item) => item.id === target); if (evidence) return evidence.exam_line;
    return target;
  });
}

export function RecallMode({ topic }: { topic: CompiledTopic }) {
  const { snapshot, store } = useProgress();
  const ordered = useMemo(() => [...topic.recall.prompts].sort((a, b) => (snapshot.promptStates[`${topic.id}#${a.id}`]?.dueAt ?? 0) - (snapshot.promptStates[`${topic.id}#${b.id}`]?.dueAt ?? 0)), [snapshot.promptStates, topic]);
  const [index, setIndex] = useState(0), [revealed, setRevealed] = useState(false);
  const prompt = ordered[index % ordered.length];
  if (!prompt) return <p className="empty">No Recall prompts are authored for this topic.</p>;
  const promptId = `${topic.id}#${prompt.id}`, state = snapshot.promptStates[promptId];
  const rate = (rating: RecallRating) => { store.rateRecall(promptId, topic.id, rating); setRevealed(false); setIndex((value) => value + 1); };
  return <section className="card recall-card"><div className="eyebrow">{prompt.type} · {index % ordered.length + 1}/{ordered.length}</div><p className="prompt">{prompt.prompt}</p><p className="muted">Retrieve mentally or on paper before revealing. {state?.dueAt ? `Due ${new Date(state.dueAt).toLocaleDateString()}.` : 'Complete the Answer Kit to initialise scheduling.'}</p>
    {!revealed ? <button className="btn primary" onClick={() => setRevealed(true)}>Reveal and compare</button> : <><div className="reveal">{answers(topic, prompt.targets).map((answer) => <p key={answer}>{answer}</p>)}</div><div className="ratings">{(['again', 'hard', 'good', 'easy'] as RecallRating[]).map((rating) => <button key={rating} className={rating} onClick={() => rate(rating)}>{rating[0].toUpperCase() + rating.slice(1)}</button>)}</div></>}
  </section>;
}

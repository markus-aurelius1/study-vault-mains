'use client';

import type { CompiledTopic } from '@/lib/content/types';
import { useProgress } from '@/lib/progress/provider';
import { applicationLevel, completedAttempts, nextAction, recallLevel, studyStage, topicDueAt } from '@/lib/progress/selectors';
import { weaknessStatuses } from '@/lib/revision/weakness';

export function TopicStudyRail({ topic }: { topic: CompiledTopic }) {
  const { snapshot, ready } = useProgress(); if (!ready) return <aside className="study-rail"><p className="muted">Loading study state…</p></aside>;
  const stage = studyStage(snapshot, topic), recall = recallLevel(snapshot, topic), application = applicationLevel(snapshot, topic), attempts = completedAttempts(snapshot, topic.id), due = topicDueAt(snapshot, topic), action = nextAction(snapshot, topic);
  const weaknesses = weaknessStatuses(snapshot.weaknessEvents.filter((event) => event.targetId === topic.id || event.targetId.startsWith(`${topic.id}#`))).filter((item) => item.recurring && !item.resolved).length;
  return <aside className="study-rail"><div className="eyebrow">Study status</div>{[['Stage', stage], ['Recall', recall], ['Application', application], ['PYQ attempts', String(attempts.length)], ['Recurring weaknesses', String(weaknesses)], ['Next due', due ? new Date(due).toLocaleDateString() : '—']].map(([label, value]) => <div className="rail-row" key={label}><span>{label}</span><b>{value}</b></div>)}<h3>Next action</h3><a href={action.href}>{action.label}</a></aside>;
}

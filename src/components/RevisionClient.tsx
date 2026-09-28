'use client';

import Link from 'next/link';
import type { CompiledTopic } from '@/lib/content/types';
import { useProgress } from '@/lib/progress/provider';
import { nextAction, topicDueAt } from '@/lib/progress/selectors';

export function RevisionClient({ topics }: { topics: CompiledTopic[] }) {
  const { snapshot, ready } = useProgress(), now = Date.now();
  if (!ready) return <p className="muted">Loading local revision state…</p>;
  const due = topics.filter((topic) => (topicDueAt(snapshot, topic) ?? Infinity) <= now).map((topic) => nextAction(snapshot, topic, now));
  const all = topics.map((topic) => nextAction(snapshot, topic, now)).sort((a, b) => a.priority - b.priority);
  return <><section className="section"><h2>Due today</h2>{due.length ? due.map((action) => <Link className="paper-link" href={action.href} key={action.topicId}><span>{action.label}</span><small>{action.dueAt ? new Date(action.dueAt).toLocaleDateString() : ''}</small></Link>) : <p className="empty">No Priority-A Recall prompt is overdue.</p>}</section><section className="section"><h2>Next actions</h2>{all.map((action) => <Link className="paper-link" href={action.href} key={action.topicId}><span>{action.label}</span><small>Priority {action.priority}</small></Link>)}</section></>;
}

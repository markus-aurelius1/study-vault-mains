'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CompiledTopic, ContentManifest } from '@/lib/content/types';
import { useProgress } from '@/lib/progress/provider';
import { applicationLevel, completedAttempts, nextAction, recallLevel, studyStage } from '@/lib/progress/selectors';

export function DashboardClient({ manifest, topics }: { manifest: ContentManifest; topics: CompiledTopic[] }) {
  const { snapshot, ready } = useProgress();
  const [filter, setFilter] = useState('strong-zero-practice');
  const actions = ready ? topics.map((topic) => nextAction(snapshot, topic)).sort((a, b) => a.priority - b.priority || (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity)) : [];
  const due = actions.filter((action) => action.dueAt !== null && action.dueAt <= Date.now());
  const filtered = ready ? topics.filter((topic) => {
    if (filter === 'strong-zero-practice') return recallLevel(snapshot, topic) === 'strong' && applicationLevel(snapshot, topic) === 'unpractised';
    if (filter === 'attempted-weak') return completedAttempts(snapshot, topic.id).length > 0 && recallLevel(snapshot, topic) === 'weak';
    if (filter === 'untouched-high-pyq') return !snapshot.topicStates[topic.id]?.firstStudiedAt && topic.pyqs.length >= 3;
    return true;
  }) : [];
  const recent = snapshot.recentTopics.map((item) => topics.find((topic) => topic.id === item.topicId)).filter((item): item is CompiledTopic => !!item);
  return <div className="page"><div className="eyebrow">Active recall and answer application</div><h1>What should I do next?</h1><p className="lede">Move from demand analysis to retrieval and PYQ application. Reading alone does not change mastery.</p>
    {ready && <section className="section"><h2>Due today</h2>{due.length ? due.map((action) => <Link className="paper-link" key={action.topicId} href={action.href}><span>{action.label}</span><small>{new Date(action.dueAt!).toLocaleDateString()}</small></Link>) : <p className="empty">Nothing is overdue.</p>}</section>}
    <section className="section"><h2>Next actions</h2>{!ready ? <p className="muted">Loading local study state…</p> : actions.length ? <div className="paper-list">{actions.slice(0, 6).map((action) => <Link className="paper-link" key={action.topicId} href={action.href}><span>{action.label}</span><small>Priority {action.priority}</small></Link>)}</div> : <p className="empty">Add a prepared topic to begin.</p>}</section>
    {recent.length > 0 && <section className="section"><h2>Continue</h2>{recent.slice(0, 4).map((topic) => <Link className="paper-link" key={topic.id} href={`/topic/${topic.id}?mode=${snapshot.topicStates[topic.id]?.preferredMode === 'answer-kit' ? 'answer' : snapshot.topicStates[topic.id]?.preferredMode ?? 'answer'}`}><span>{topic.title}</span><small>{studyStage(snapshot, topic)}</small></Link>)}</section>}
    {ready && <section className="section"><h2>Study filters</h2><div className="filter-bar"><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="strong-zero-practice">Strong Recall + Zero Practice</option><option value="attempted-weak">PYQ Attempted + Topic Weak</option><option value="untouched-high-pyq">Untouched High-PYQ Topic</option><option value="all">All prepared topics</option></select><span className="muted">{filtered.length} match{filtered.length === 1 ? '' : 'es'}</span></div>{filtered.length ? filtered.map((topic) => <Link className="paper-link" href={`/topic/${topic.id}`} key={topic.id}><span>{topic.title}</span><small>{studyStage(snapshot, topic)}</small></Link>) : <p className="empty">No prepared topic currently matches this filter.</p>}</section>}
    <h2>Papers</h2><div className="grid">{manifest.papers.map((paper) => { const paperTopics = topics.filter((topic) => topic.paper === paper.id); return <Link className="card" key={paper.id} href={`/paper/${paper.id.toLowerCase()}`}><div className="eyebrow">{paper.id}</div><h2>{paper.label}</h2><p className="card-meta">{paperTopics.length} prepared topic{paperTopics.length === 1 ? '' : 's'}</p>{ready && paperTopics.length > 0 && <p className="card-meta">{paperTopics.filter((topic) => studyStage(snapshot, topic) === 'stable').length} Stable · {paperTopics.filter((topic) => recallLevel(snapshot, topic) === 'strong' && applicationLevel(snapshot, topic) === 'unpractised').length} strong recall / zero practice</p>}</Link>; })}</div>
  </div>;
}

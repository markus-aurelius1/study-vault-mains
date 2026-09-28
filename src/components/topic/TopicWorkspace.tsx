'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import type { CompiledTopic } from '@/lib/content/types';
import { useProgress } from '@/lib/progress/provider';
import { AnswerKit } from './AnswerKit';
import { RecallMode } from './RecallMode';
import { PracticeMode } from './PracticeMode';
import { DeepMode } from './DeepMode';
import { TopicStudyRail } from './TopicStudyRail';

const MODES = ['answer', 'recall', 'practice', 'deep'] as const;

export function TopicWorkspace({ topic }: { topic: CompiledTopic }) {
  const params = useSearchParams(), { store, ready } = useProgress();
  const raw = params.get('mode'); const mode = MODES.includes(raw as typeof MODES[number]) ? raw as typeof MODES[number] : 'answer';
  useEffect(() => { if (ready) store.touchTopic(topic.id); }, [ready, store, topic.id]);
  useEffect(() => { if (ready) store.setPreferredMode(topic.id, mode === 'answer' ? 'answer-kit' : mode); }, [ready, store, topic.id, mode]);
  const query = (value: string) => `/topic/${topic.id}?mode=${value}`;
  return <div className="page">
    <div className="eyebrow">{topic.paper} · {topic.node_type} topic</div><h1>{topic.title}</h1><p className="lede">{topic.thesis}</p>
    <nav className="mode-switch" aria-label="Topic mode">{MODES.map((item) => <Link key={item} className={mode === item ? 'active' : ''} href={query(item)}>{item === 'answer' ? 'Answer Kit' : item[0].toUpperCase() + item.slice(1)}</Link>)}</nav>
    <div className="topic-layout"><div>
      {mode === 'answer' && <AnswerKit topic={topic} />}{mode === 'recall' && <RecallMode topic={topic} />}{mode === 'practice' && <PracticeMode topic={topic} />}{mode === 'deep' && <DeepMode topic={topic} />}
    </div><TopicStudyRail topic={topic} /></div>
  </div>;
}

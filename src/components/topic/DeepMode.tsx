import Link from 'next/link';
import type { CompiledTopic } from '@/lib/content/types';

export function DeepMode({ topic }: { topic: CompiledTopic }) {
  return <><p className="muted">Deep is for understanding repair. Opening or reading it creates no mastery credit.</p>{topic.deep_sections.length ? topic.deep_sections.map((section) => <section className="section" key={section.id}><h2>{section.title}</h2><p>{section.body}</p><Link className="btn" href={`/topic/${topic.id}?mode=recall`}>Test understanding</Link></section>) : <p className="empty">No Deep material is authored for this topic.</p>}</>;
}

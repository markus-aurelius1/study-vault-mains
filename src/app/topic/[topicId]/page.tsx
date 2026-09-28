import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getManifest, getTopic } from '@/lib/content/server';
import { TopicWorkspace } from '@/components/topic/TopicWorkspace';

export async function generateStaticParams() { return (await getManifest()).topics.map((topic) => ({ topicId: topic.id })); }
export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) { const { topicId } = await params; const topic = await getTopic(topicId); if (!topic) notFound(); return <Suspense fallback={<div className="page"><p className="muted">Loading topic workspace…</p></div>}><TopicWorkspace topic={topic} /></Suspense>; }

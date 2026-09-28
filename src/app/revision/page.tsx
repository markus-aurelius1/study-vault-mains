import { RevisionClient } from '@/components/RevisionClient';
import { getAllTopics } from '@/lib/content/server';
export default async function RevisionPage() { return <div className="page"><div className="eyebrow">Retrieval queue</div><h1>Revision</h1><p className="lede">Due dates come from the earliest Priority-A Recall prompt; there is no separate Topic due date.</p><RevisionClient topics={await getAllTopics()} /></div>; }

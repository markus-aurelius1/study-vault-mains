import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getManifest } from '@/lib/content/server';

export async function generateStaticParams() { return (await getManifest()).papers.map((paper) => ({ paper: paper.id.toLowerCase() })); }
export default async function PaperPage({ params }: { params: Promise<{ paper: string }> }) { const id = (await params).paper.toUpperCase(); const paper = (await getManifest()).papers.find((item) => item.id === id); if (!paper) notFound(); return <div className="page"><div className="eyebrow">{paper.id}</div><h1>{paper.label}</h1><p className="lede">Prepared Answerable Topic Nodes, their demand clusters and PYQ coverage.</p>{paper.topics.length ? <div className="grid">{paper.topics.map((topic) => <Link className="card" href={topic.href} key={topic.id}><div className="eyebrow">{topic.node_type}</div><h2>{topic.title}</h2><p className="card-meta">{topic.pyqCount} PYQs · {topic.demandCount} demand clusters</p></Link>)}</div> : <p className="empty">No prepared topics in this paper yet.</p>}</div>; }

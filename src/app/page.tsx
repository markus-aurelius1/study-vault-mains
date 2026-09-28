import { DashboardClient } from '@/components/DashboardClient';
import { getAllTopics, getManifest } from '@/lib/content/server';

export default async function HomePage() { const [manifest, topics] = await Promise.all([getManifest(), getAllTopics()]); return <DashboardClient manifest={manifest} topics={topics} />; }

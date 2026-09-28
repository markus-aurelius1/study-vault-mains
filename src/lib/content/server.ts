import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { CompiledTopic, ContentManifest } from './types';

const ROOT = path.join(process.cwd(), 'content');
const cache = new Map<string, unknown>();
async function json<T>(relative: string): Promise<T> {
  if (cache.has(relative)) return cache.get(relative) as T;
  let parsed: T;
  try { parsed = JSON.parse(await readFile(path.join(ROOT, relative), 'utf8')) as T; }
  catch { throw new Error(`Generated content/${relative} is missing or invalid; run npm run content.`); }
  cache.set(relative, parsed);
  return parsed;
}

export const getManifest = () => json<ContentManifest>('manifest.json');
export const getTopic = (topicId: string) => json<CompiledTopic>(`topics/${topicId}.json`).catch(() => null);
export async function getAllTopics() {
  const manifest = await getManifest();
  return Promise.all(manifest.topics.map((topic) => getTopic(topic.id))).then((items) => items.filter((item): item is CompiledTopic => item !== null));
}

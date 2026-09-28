import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const at = args.indexOf('--from');
const source = at >= 0 ? args[at + 1] : null;
if (!source) throw new Error('Usage: npm run sync:pyq -- --from <file-or-url>');

const text = /^https?:\/\//i.test(source)
  ? await fetch(source).then((response) => {
      if (!response.ok) throw new Error(`download failed: ${response.status}`);
      return response.text();
    })
  : await readFile(path.resolve(source), 'utf8');

const parsed = JSON.parse(text) as { fields?: unknown; rows?: unknown };
if (!Array.isArray(parsed.rows)) throw new Error('Source index must contain rows');
const seen = new Set<string>();
for (const row of parsed.rows) {
  if (!Array.isArray(row) || row.length !== 8 || typeof row[0] !== 'string') throw new Error('Source index contains an invalid row');
  if (seen.has(row[0])) throw new Error(`Duplicate PYQ ID ${row[0]}`);
  seen.add(row[0]);
}
const target = path.join(process.cwd(), 'external', 'pyq-engine', 'search.json');
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(parsed)}\n`);
console.log(`Synced ${parsed.rows.length} PYQ index rows to external/pyq-engine/search.json.`);

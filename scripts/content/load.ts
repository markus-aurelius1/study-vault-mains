import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import type { ZodType } from 'zod';

export async function filesUnder(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.ya?ml$/i.test(entry.name)) out.push(full);
    }
  }
  await walk(dir);
  return out.sort((a, b) => a.localeCompare(b));
}

export async function loadYaml<T>(file: string, schema: ZodType<T>): Promise<T> {
  const raw = await readFile(file, 'utf8');
  let parsed: unknown;
  try {
    parsed = YAML.parse(raw);
  } catch (error) {
    throw new Error(`${file}: invalid YAML: ${(error as Error).message}`);
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`).join('\n  ');
    throw new Error(`${file}: schema validation failed\n  ${issues}`);
  }
  return result.data;
}

export async function loadYamlDirectory<T>(dir: string, schema: ZodType<T>): Promise<T[]> {
  const files = await filesUnder(dir);
  const values: T[] = [];
  for (const file of files) values.push(await loadYaml(file, schema));
  return values;
}

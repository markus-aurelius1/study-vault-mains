import { compileContent } from './content/compiler';

try {
  const result = await compileContent(true);
  for (const warning of result.warnings) console.warn(`WARN ${warning}`);
  console.log(`Content built: ${result.topics.length} topic(s), ${result.manifest.digest.slice(0, 12)}.`);
} catch (error) {
  console.error(`Content build failed: ${(error as Error).message}`);
  process.exitCode = 1;
}

import { compileContent } from './content/compiler';

try {
  const result = await compileContent(false);
  for (const warning of result.warnings) console.warn(`WARN ${warning}`);
  console.log(`Content valid: ${result.topics.length} topic(s).`);
} catch (error) {
  console.error(`Content validation failed: ${(error as Error).message}`);
  process.exitCode = 1;
}

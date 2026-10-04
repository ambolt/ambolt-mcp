import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../functions');

export async function loadFunctions(dir = root) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()) {
    out.push((await import(pathToFileURL(join(dir, name, 'index.js')).href)).default);
  }
  return out;
}

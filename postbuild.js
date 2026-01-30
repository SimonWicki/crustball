import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

mkdirSync('dist/assets', { recursive: true });

try {
  copyFileSync('config/crustball.yaml', join('dist', 'assets', 'crustball.yaml'));
} catch {
  // optional
}

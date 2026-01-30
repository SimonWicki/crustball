import { readFileSync } from 'node:fs';
import YAML from 'yaml';
import { ConfigSchema, type BagsBallConfig } from './schema.js';

function interpolateEnv(obj: unknown): unknown {
  if (typeof obj === 'string') {
    const m = obj.match(/^\$\{([A-Z0-9_]+)\}$/);
    if (m) return process.env[m[1]] ?? '';
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(interpolateEnv);
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = interpolateEnv(v);
    return out;
  }
  return obj;
}

export function loadConfig(path: string): BagsBallConfig {
  const raw = readFileSync(path, 'utf-8');
  const parsed = YAML.parse(raw);
  const interpolated = interpolateEnv(parsed);
  const cfg = ConfigSchema.parse(interpolated);
  return cfg;
}

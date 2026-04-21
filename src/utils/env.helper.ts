/**
 * EnvHelper — typed, validated access to environment variables.
 *
 * Usage:
 *   import { env } from '@utils/env.helper';
 *   env.baseUrl   // string
 *   env.headless  // boolean
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  baseUrl:   optionalEnv('BASE_URL',   'https://jsonplaceholder.typicode.com'),
  timeoutMs: Number(optionalEnv('TIMEOUT_MS', '10000')),
  logLevel:  optionalEnv('LOG_LEVEL',  'info') as 'silent' | 'info' | 'debug',
  headless:  optionalEnv('HEADLESS',   'true') === 'true',
  // Add authenticated endpoints here when needed:
  // apiKey: requireEnv('API_KEY'),
} as const;

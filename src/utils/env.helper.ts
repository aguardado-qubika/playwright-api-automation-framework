function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  baseUrl:   optionalEnv('BASE_URL',  'https://api.mockfly.dev/mocks/cab5e087-09ad-424c-b618-52f3993993f0'),
  apiKey:    requireEnv('API_KEY'),
  timeoutMs: Number(optionalEnv('TIMEOUT_MS', '10000')),
  logLevel:  optionalEnv('LOG_LEVEL', 'info') as 'silent' | 'info' | 'debug',
  headless:  optionalEnv('HEADLESS',  'true') === 'true',
} as const;

export const ENV = {
  BASE_URL: process.env.BASE_URL ?? 'https://jsonplaceholder.typicode.com',
  TIMEOUT_MS: Number(process.env.TIMEOUT_MS ?? 10_000),
  LOG_LEVEL: (process.env.LOG_LEVEL ?? 'info') as 'silent' | 'info' | 'debug',
} as const;
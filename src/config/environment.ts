export const ENV = {
  BASE_URL: process.env.BASE_URL ?? 'https://api.mockfly.dev/mocks/cab5e087-09ad-424c-b618-52f3993993f0',
  API_KEY:  process.env.API_KEY  ?? '',
  TIMEOUT_MS: Number(process.env.TIMEOUT_MS ?? 10_000),
  LOG_LEVEL: (process.env.LOG_LEVEL ?? 'info') as 'silent' | 'info' | 'debug',
} as const;
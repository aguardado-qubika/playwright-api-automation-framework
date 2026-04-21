import { expect, type APIResponse } from '@playwright/test';

/**
 * expectAPI — named assertion wrappers for HTTP contract testing.
 *
 * These keep specs readable ("what is asserted") without exposing
 * Playwright internals ("how Playwright asserts it").
 *
 * Usage:
 *   await expectAPI.toHaveStatus(response, STATUS.OK);
 *   await expectAPI.toBeOk(response);
 */
export const expectAPI = {
  async toBeOk(response: APIResponse): Promise<void> {
    expect(
      response.ok(),
      `Expected 2xx but got ${response.status()} ${response.statusText()}`
    ).toBe(true);
  },

  async toHaveStatus(response: APIResponse, status: number): Promise<void> {
    expect(response.status()).toBe(status);
  },

  async bodyToMatchSchema<T>(
    response: APIResponse,
    guard: (value: unknown) => value is T
  ): Promise<T> {
    const body: unknown = await response.json();
    expect(
      guard(body),
      `Response body failed schema validation:\n${JSON.stringify(body, null, 2)}`
    ).toBe(true);
    return body as T;
  },

  async toBeEmptyObject(response: APIResponse): Promise<void> {
    const body: unknown = await response.json();
    expect(typeof body).toBe('object');
    expect(Array.isArray(body)).toBe(false);
    expect(Object.keys(body as object).length).toBe(0);
  },
} as const;

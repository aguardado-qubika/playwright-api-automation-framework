import { type APIRequestContext, type APIResponse } from '@playwright/test';

/**
 * ApiClient — the single point of control for every outbound HTTP call.
 *
 * Responsibilities:
 *   - Inject default headers (Content-Type, Accept) on every request
 *   - Provide a typed method per HTTP verb so controllers stay thin
 *   - Never parse response bodies — that belongs in the test spec
 *
 * The base URL is configured once in playwright.config.ts (baseURL).
 * All paths passed to these methods are relative (e.g. '/posts/1').
 */
export class ApiClient {
  private readonly headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };

  constructor(private readonly request: APIRequestContext) {}

  get(path: string): Promise<APIResponse> {
    return this.request.get(path, { headers: this.headers });
  }

  post(path: string, data: unknown): Promise<APIResponse> {
    return this.request.post(path, { data, headers: this.headers });
  }

  put(path: string, data: unknown): Promise<APIResponse> {
    return this.request.put(path, { data, headers: this.headers });
  }

  patch(path: string, data: unknown): Promise<APIResponse> {
    return this.request.patch(path, { data, headers: this.headers });
  }

  delete(path: string): Promise<APIResponse> {
    return this.request.delete(path, { headers: this.headers });
  }
}

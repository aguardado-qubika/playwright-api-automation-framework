import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { ENV } from '@config/environment';

export class ApiClient {
  private readonly headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    'x-api-key':    ENV.API_KEY,
  };

  // Build absolute URLs so Playwright's WHATWG resolver doesn't strip
  // sub-path prefixes (e.g. /mocks/<id>) from the base URL.
  private url(path: string): string {
    return `${ENV.BASE_URL}${path}`;
  }

  constructor(private readonly request: APIRequestContext) {}

  get(path: string): Promise<APIResponse> {
    return this.request.get(this.url(path), { headers: this.headers });
  }

  post(path: string, data: unknown): Promise<APIResponse> {
    return this.request.post(this.url(path), { data, headers: this.headers });
  }

  put(path: string, data: unknown): Promise<APIResponse> {
    return this.request.put(this.url(path), { data, headers: this.headers });
  }

  patch(path: string, data: unknown): Promise<APIResponse> {
    return this.request.patch(this.url(path), { data, headers: this.headers });
  }

  delete(path: string): Promise<APIResponse> {
    return this.request.delete(this.url(path), { headers: this.headers });
  }
}

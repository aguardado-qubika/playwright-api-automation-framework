import { APIRequestContext } from '@playwright/test';

/**
 * BaseController — the API equivalent of a Base Page Object.
 *
 * Every resource controller extends this class and inherits:
 *   - A scoped request context
 *   - The resource endpoint path
 *   - A consistent way to build URLs
 *
 * No test logic lives here. No assertions. Pure HTTP mechanics.
 */
export abstract class BaseController {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly basePath: string
  ) {}

  protected url(path: string = ''): string {
    return `${this.basePath}${path}`;
  }
}
import { ApiClient } from '@api/client';

/**
 * BaseController — shared URL construction for every resource controller.
 *
 * Rules:
 *   - No HTTP calls here — those live in the resource subclass.
 *   - No assertions — those live in the test spec.
 *   - Accepts ApiClient so all headers and transport are managed centrally.
 */
export abstract class BaseController {
  constructor(
    protected readonly client: ApiClient,
    protected readonly basePath: string
  ) {}

  protected url(path: string = ''): string {
    return `${this.basePath}${path}`;
  }
}

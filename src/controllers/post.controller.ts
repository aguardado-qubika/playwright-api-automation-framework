import { APIResponse } from '@playwright/test';
import { BaseController } from './base.controller';
import { CreatePostPayload, UpdatePostPayload } from '@models/post.model';

/**
 * PostController — encapsulates all HTTP operations for /posts.
 *
 * Responsibilities:
 *   - One method per API operation
 *   - Returns raw APIResponse — assertions stay in the test
 *   - No test logic, no expect() calls here
 */
export class PostController extends BaseController {

  constructor(request: any) {
    super(request, '/posts');
  }

  getAll(): Promise<APIResponse> {
    return this.request.get(this.url());
  }

  getById(id: number): Promise<APIResponse> {
    return this.request.get(this.url(`/${id}`));
  }

  create(payload: CreatePostPayload): Promise<APIResponse> {
    return this.request.post(this.url(), { data: payload });
  }

  update(id: number, payload: UpdatePostPayload): Promise<APIResponse> {
    return this.request.patch(this.url(`/${id}`), { data: payload });
  }

  delete(id: number): Promise<APIResponse> {
    return this.request.delete(this.url(`/${id}`));
  }
}
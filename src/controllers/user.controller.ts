import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { ApiClient } from '@api/client';
import { BaseController } from './base.controller';
import { type CreateUserPayload, type UpdateUserPayload } from '@models/user.model';

export class UserController extends BaseController {
  constructor(request: APIRequestContext) {
    super(new ApiClient(request), '/users');
  }

  getAll(): Promise<APIResponse> {
    return this.client.get(this.url());
  }

  getById(id: number): Promise<APIResponse> {
    return this.client.get(this.url(`/${id}`));
  }

  create(payload: CreateUserPayload): Promise<APIResponse> {
    return this.client.post(this.url(), payload);
  }

  replace(id: number, payload: CreateUserPayload): Promise<APIResponse> {
    return this.client.put(this.url(`/${id}`), payload);
  }

  update(id: number, payload: UpdateUserPayload): Promise<APIResponse> {
    return this.client.patch(this.url(`/${id}`), payload);
  }

  delete(id: number): Promise<APIResponse> {
    return this.client.delete(this.url(`/${id}`));
  }
}

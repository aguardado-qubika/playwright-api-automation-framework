import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { ApiClient } from '@api/client';
import { BaseController } from './base.controller';
import { type CreateTodoPayload, type UpdateTodoPayload } from '@models/todo.model';

export class TodoController extends BaseController {
  constructor(request: APIRequestContext) {
    super(new ApiClient(request), '/todos');
  }

  getAll(): Promise<APIResponse> {
    return this.client.get(this.url());
  }

  getById(id: number): Promise<APIResponse> {
    return this.client.get(this.url(`/${id}`));
  }

  create(payload: CreateTodoPayload): Promise<APIResponse> {
    return this.client.post(this.url(), payload);
  }

  update(id: number, payload: UpdateTodoPayload): Promise<APIResponse> {
    return this.client.patch(this.url(`/${id}`), payload);
  }

  delete(id: number): Promise<APIResponse> {
    return this.client.delete(this.url(`/${id}`));
  }
}

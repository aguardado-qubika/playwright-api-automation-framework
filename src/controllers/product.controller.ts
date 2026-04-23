import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { ApiClient } from '@api/client';
import { BaseController } from './base.controller';
import { type CreateProductPayload, type UpdateProductPayload } from '@models/product.model';

export class ProductController extends BaseController {
  constructor(request: APIRequestContext) {
    super(new ApiClient(request), '/products');
  }

  getById(id: number): Promise<APIResponse> {
    return this.client.get(this.url(`/${id}`));
  }

  create(payload: CreateProductPayload): Promise<APIResponse> {
    return this.client.post(this.url(), payload);
  }

  replace(id: number, payload: CreateProductPayload): Promise<APIResponse> {
    return this.client.put(this.url(`/${id}`), payload);
  }

  update(id: number, payload: UpdateProductPayload): Promise<APIResponse> {
    return this.client.patch(this.url(`/${id}`), payload);
  }

  delete(id: number): Promise<APIResponse> {
    return this.client.delete(this.url(`/${id}`));
  }
}

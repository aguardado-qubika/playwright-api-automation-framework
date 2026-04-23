import { test as base } from '@playwright/test';
import { ApiClient }         from '@api/client';
import { ProductController } from '@controllers/product.controller';

type ApiFixtures = {
  apiClient:         ApiClient;
  productController: ProductController;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  productController: async ({ request }, use) => {
    await use(new ProductController(request));
  },
});

export { expect } from '@playwright/test';

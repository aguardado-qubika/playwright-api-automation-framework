import { test as base } from '@playwright/test';
import { ApiClient }         from '@api/client';
import { PostController }    from '@controllers/post.controller';
import { UserController }    from '@controllers/user.controller';
import { TodoController }    from '@controllers/todo.controller';
import { ProductController } from '@controllers/product.controller';

type ApiFixtures = {
  apiClient:         ApiClient;
  postController:    PostController;
  userController:    UserController;
  todoController:    TodoController;
  productController: ProductController;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  postController: async ({ request }, use) => {
    await use(new PostController(request));
  },

  userController: async ({ request }, use) => {
    await use(new UserController(request));
  },

  todoController: async ({ request }, use) => {
    await use(new TodoController(request));
  },

  productController: async ({ request }, use) => {
    await use(new ProductController(request));
  },
});

export { expect } from '@playwright/test';

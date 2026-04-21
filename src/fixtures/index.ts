import { test as base } from '@playwright/test';
import { ApiClient }      from '@api/client';
import { PostController } from '@controllers/post.controller';
import { UserController } from '@controllers/user.controller';
import { TodoController } from '@controllers/todo.controller';

/**
 * ApiFixtures — the typed fixture bag injected into every API spec.
 *
 * Rules:
 *   - Add a new controller once here; every spec that declares it gets it free.
 *   - No browser context (Page, BrowserContext) ever appears here.
 *   - Fixtures compose: postController depends on apiClient automatically.
 */
type ApiFixtures = {
  apiClient:      ApiClient;
  postController: PostController;
  userController: UserController;
  todoController: TodoController;
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
});

export { expect } from '@playwright/test';

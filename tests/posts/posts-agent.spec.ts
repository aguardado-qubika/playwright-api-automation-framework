import { test, expect } from '@playwright/test';
import { PostController } from '@controllers/post.controller';
import { Post } from '@models/post.model';

test.describe('Posts API — Agent Tests (SAU-61)', () => {

  let posts: PostController;

  test.beforeEach(({ request }) => {
    posts = new PostController(request);
  });

  // JSONPlaceholder simulates POST (always returns id:101, not persisted).
  // The GET uses a seeded id to verify full Post schema independently.
  test('POST /posts creates a post and GET /posts/:id returns full schema', async () => {
    const createResponse = await posts.create({ userId: 1, title: 'test title', body: 'test body' });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json() as Post;
    expect(typeof created.id).toBe('number');
    expect(created.id).toBeGreaterThan(0);

    const getResponse = await posts.getById(1);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json() as Post;
    expect(typeof fetched.id).toBe('number');
    expect(typeof fetched.userId).toBe('number');
    expect(typeof fetched.title).toBe('string');
    expect(typeof fetched.body).toBe('string');
  });

});

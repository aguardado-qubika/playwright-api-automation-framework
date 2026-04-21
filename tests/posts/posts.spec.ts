import { test, expect } from '@playwright/test';
import { PostController } from '@controllers/post.controller';
import { Post } from '@models/post.model';

test.describe('Posts API', () => {

  let posts: PostController;

  test.beforeEach(({ request }) => {
    posts = new PostController(request);
  });

  test('GET /posts returns a list of posts', async () => {
    const response = await posts.getAll();
    const body = await response.json() as Post[];

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /posts/:id returns a single post', async () => {
    const response = await posts.getById(1);
    const body = await response.json() as Post;

    expect(response.status()).toBe(200);
    expect(body.id).toBe(1);
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('body');
  });

  test('POST /posts creates a new post', async () => {
    const response = await posts.create({
      userId: 1,
      title:  'test post',
      body:   'test body',
    });
    const body = await response.json() as Post;

    expect(response.status()).toBe(201);
    expect(body.title).toBe('test post');
    expect(body.id).toBeDefined();
  });

  test('PATCH /posts/:id updates a post', async () => {
    const response = await posts.update(1, { title: 'updated title' });
    const body = await response.json() as Post;

    expect(response.status()).toBe(200);
    expect(body.title).toBe('updated title');
  });

  test('DELETE /posts/:id deletes a post', async () => {
    const response = await posts.delete(1);

    expect(response.status()).toBe(200);
  });

});
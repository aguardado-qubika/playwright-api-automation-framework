import { test, expect }  from '@fixtures/index';
import { expectAPI }     from '@utils/expect.helper';
import { isPostArray } from '@utils/schema.helper';
import { STATUS }        from '@utils/constants';
import { type Post }     from '@models/post.model';

test.describe('API Tests', () => {

  test('POST /posts returns 201 with a numeric id and echoed payload', async ({ postController }) => {
    const payload = { userId: 1, title: 'test title', body: 'test body' };
    const response = await postController.create(payload);
    expect(response.status()).toBe(STATUS.CREATED);
    const body = await response.json() as Post;
    expect(typeof body.id).toBe('number');
    expect(body.id).toBeGreaterThan(0);
    expect(typeof body.title).toBe('string');
    expect(body.title).toBe(payload.title);
    expect(typeof body.body).toBe('string');
    expect(body.body).toBe(payload.body);
    expect(typeof body.userId).toBe('number');
    expect(body.userId).toBe(payload.userId);
  });

  test('GET /posts/:id returns a single post with matching id', async ({ postController }) => {
    const response = await postController.getById(1);
    expect(response.status()).toBe(STATUS.OK);

    const body = await response.json() as Post;
    expect(Array.isArray(body)).toBe(false);
    expect(body.id).toBe(1);
    expect(body).toHaveProperty('userId');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('body');
  });

  test('GET /posts returns a non-empty array of posts', async ({ postController }) => {
    const response = await postController.getAll();
    await expect(response).toBeOK();
    const body = await response.json() as Post[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    await expectAPI.bodyToMatchSchema(response, isPostArray);
  });

});

import { test, expect }  from '@fixtures/index';
import { expectAPI }     from '@utils/expect.helper';
import { isPost }        from '@utils/schema.helper';
import { STATUS }        from '@utils/constants';
import { type Post }     from '@models/post.model';

test.describe('Posts API — Contract Tests', () => {

  test('POST /posts returns 201 with a generated id', async ({ postController }) => {
    const response = await postController.create({ userId: 1, title: 'test title', body: 'test body' });
    expect(response.status()).toBe(STATUS.CREATED);
    const body = await response.json() as Post;
    expect(typeof body.id).toBe('number');
    expect(body.id).toBeGreaterThan(0);
  });

  test('GET /posts/:id returns full Post schema', async ({ postController }) => {
    const response = await postController.getById(1);
    await expect(response).toBeOK();
    await expectAPI.bodyToMatchSchema(response, isPost);
  });

});

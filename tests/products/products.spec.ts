import { test, expect }   from '@fixtures/index';
import { STATUS }          from '@utils/constants';
import { type CreateProductResponse } from '@models/product.model';
import { expectAPI }       from '@utils/expect.helper';
import { isProduct }       from '@utils/schema.helper';

test.describe('POST /products', () => {

  test('POST /products returns 201 with valid product shape', async ({ productController }) => {
    const payload = { name: 'Wireless Mouse', price: 29.99 };
    const response = await productController.create(payload);

    expect(response.status()).toBe(STATUS.CREATED);

    const body = await response.json() as CreateProductResponse;
    console.log('Response body:', JSON.stringify(body, null, 2));
    expect(typeof body.id).toBe('number');
    expect(body.id).toBeGreaterThan(0);
    expect(body.name).toBe(payload.name);
    expect(body.price).toBe(payload.price);
    expect(body.status).toBe('success');
  });

});

test.describe('GET /products/:id', () => {

  test('GET /products/:id returns 200 with correct Product shape', async ({ productController }) => {
    const response = await productController.getById(1);

    expect(response.status()).toBe(STATUS.OK);

    const body = await expectAPI.bodyToMatchSchema(response, isProduct);
    console.log('Response body:', JSON.stringify(body, null, 2));
    expect(body.id).toBe(1);
    expect(typeof body.name).toBe('string');
    expect(typeof body.price).toBe('number');
    expect(Array.isArray(body)).toBe(false);
  });

  // Blocked: Mockfly must be configured to return 404 for GET /products/9999.
  // Remove skip once the conditional response rule is added in the dashboard.
  test.skip('GET /products/:id returns 404 for non-existent id', async ({ productController }) => {
    const response = await productController.getById(9999);

    expect(response.status()).toBe(STATUS.NOT_FOUND);
  });

});

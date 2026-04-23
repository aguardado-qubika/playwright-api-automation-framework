import { test, expect }   from '@fixtures/index';
import { STATUS }          from '@utils/constants';
import { type CreateProductResponse } from '@models/product.model';

test.describe('POST /products', () => {

  test('POST /products returns 201 with valid product shape', async ({ productController }) => {
    const payload = { name: 'Test Product', price: 29.99 };
    const response = await productController.create(payload);

    expect(response.status()).toBe(STATUS.CREATED);

    const body = await response.json() as CreateProductResponse;
    expect(typeof body.id).toBe('number');
    expect(body.id).toBeGreaterThan(0);
    expect(typeof body.name).toBe('string');
    expect(typeof body.price).toBe('number');
    expect(typeof body.status).toBe('string');
    expect(body.status).toBe('success');
  });

  // Blocked: Mockfly must be configured to return 400 for empty-body POST.
  // Remove skip once the conditional response rule is added in the dashboard.
  test.skip('POST /products with empty body returns 400', async ({ productController }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await productController.create({} as any);

    expect(response.status()).toBe(STATUS.BAD_REQUEST);
  });

});

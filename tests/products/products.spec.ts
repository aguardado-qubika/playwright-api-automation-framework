import { test, expect }   from '@fixtures/index';
import { STATUS }          from '@utils/constants';
import { type CreateProductResponse, type Product, type CreateProductPayload, type PutProductResponse } from '@models/product.model';

test.describe.serial('Products API', () => {
  const payload = { name: 'Wireless Mouse', price: 29.99 };
  let createdProductId: string;

  test('POST /products returns 201 with valid product shape', async ({ productController }) => {
    const response = await productController.create(payload);

    expect(response.status()).toBe(STATUS.CREATED);

    const body = await response.json() as CreateProductResponse;
    console.log('POST Response body:', JSON.stringify(body, null, 2));
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThan(0);
    expect(body.name).toBe(payload.name);
    expect(body.price).toBe(payload.price);
    expect(body.status).toBe('success');

    createdProductId = body.id;
  });

  test('GET /products/:id returns 200 and includes the created product', async ({ productController }) => {
    const response = await productController.getById(createdProductId);

    expect(response.status()).toBe(STATUS.OK);

    const body = await response.json() as Product[];
    console.log('GET Response body:', JSON.stringify(body, null, 2));
    expect(Array.isArray(body)).toBe(true);

    const found = body.find(p => p.name === payload.name && p.price === payload.price);
    expect(found).toBeDefined();
    expect(typeof found!.id).toBe('number');
    expect(found!.id).toBeGreaterThan(0);
  });

  // Blocked: Mockfly must be configured to return 404 for GET /products/9999.
  // Remove skip once the conditional response rule is added in the dashboard.
  test.skip('GET /products/:id returns 404 for non-existent id', async ({ productController }) => {
    const response = await productController.getById(9999);

    expect(response.status()).toBe(STATUS.NOT_FOUND);
  });

});

test.describe('DELETE /products/:id', () => {
  test('DELETE /products/:id returns 204 with no body', async ({ productController }) => {
    const response = await productController.delete(1);

    expect(response.status()).toBe(STATUS.NO_CONTENT);
  });

  // Blocked: Mockfly must be configured to return 404 for GET /products/9999.
  // Remove skip once the conditional response rule is added in the dashboard.
  test.skip('GET /products/:id returns 404 after product is deleted', async ({ productController }) => {
    const deleteResponse = await productController.delete(1);
    expect(deleteResponse.status()).toBe(STATUS.NO_CONTENT);

    // id=9999 is pre-configured in Mockfly to return 404 unconditionally (stateless mock workaround)
    const getResponse = await productController.getById(9999);
    expect(getResponse.status()).toBe(STATUS.NOT_FOUND);
  });
});

test.describe('PUT /products/:id', () => {
  const payload: CreateProductPayload = { name: 'Updated Product', price: 49.99 };

  test('PUT /products/:id returns 200 with update confirmation', async ({ productController }) => {
    const response = await productController.replace(1, payload);

    expect(response.status()).toBe(STATUS.OK);

    const body = await response.json() as PutProductResponse;
    console.log('PUT Response body:', JSON.stringify(body, null, 2));
    expect(typeof body.message).toBe('string');
    expect(body.message).toBe('Product updated successfully');
  });

  // Blocked: Mockfly must be configured to return 404 for PUT /products/9999.
  // Remove skip once the conditional response rule is added in the dashboard.
  test.skip('PUT /products/:id returns 404 for non-existent id', async ({ productController }) => {
    const ghostPayload: CreateProductPayload = { name: 'Ghost Product', price: 0 };
    const response = await productController.replace(9999, ghostPayload);

    expect(response.status()).toBe(STATUS.NOT_FOUND);
  });
});

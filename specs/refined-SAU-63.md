# SAU-63: PUT /products/:id — Replace product returns 200 with confirmation, 404 for unknown id

> **Source**: Refined from `--from-input` via create-sdd-ticket skill
> **Linear**: https://linear.app/saucedemo-qa/issue/SAU-63

---

## 📋 User Story

**As a** QA engineer maintaining the api-automation-framework
**I want** to PUT `/products/:id` with a full replacement payload and assert the response
**So that** I can confirm Mockfly returns HTTP 200 with an update confirmation message, and HTTP 404 when the target product does not exist

---

## 🔑 Preconditions

- `ProductController` is instantiated with the Playwright `request` fixture
- Request header `Content-Type: application/json` is set on all outbound calls (injected by `ApiClient`)
- Request header `x-api-key: 39ce2e7d-b677-4f40-995e-fb43b96f46c1` is set on all outbound calls (injected by `ApiClient` via `ENV.API_KEY`)
- Target base URL: `https://api.mockfly.dev/mocks/cab5e087-09ad-424c-b618-52f3993993f0`
- `API_KEY` is present in `.env.local` and loaded by `playwright.config.ts` before tests run
- Mockfly mock is configured to return `{ id: ":id", message: "Product updated successfully" }` with status 200 for `PUT /products/:id`
- Mockfly mock is configured to return `404` for `PUT /products/:id` when the ID has no matching record (e.g. `id=9999`)

---

## 🎯 Success Criteria

1. PUT `/products/1` with `{ name: string, price: number }` returns status **200**
2. Response body contains `message: "Product updated successfully"`
3. PUT `/products/9999` returns status **404**
4. The test lives in `tests/products/products.spec.ts` and uses `ProductController.replace()` — no direct URL construction

**Metrics**: `npm run test:products` exits green

---

## ✅ Acceptance Criteria

### Scenario 1: PUT with valid payload returns 200 with confirmation message

```gherkin
Given the ProductController is instantiated with the Playwright request fixture
When I call productController.replace(1, { name: "Updated Product", price: 49.99 })
Then the response status is 200
```

**Assertions:**
- `response.status()` equals `200`
- `typeof body.message` equals `"string"`
- `body.message` equals `"Product updated successfully"`

### Scenario 2: Response body contains the expected confirmation shape

```gherkin
Given a PUT to /products/1 returned HTTP 200
When I parse the response body as PutProductResponse
Then the body contains a message field confirming the update
```

**Assertions:**
- `typeof body.message` equals `"string"`
- `body.message` equals `"Product updated successfully"`
- `body` has a `message` property (confirmed via `toHaveProperty`)

### Scenario 3: PUT with non-existent id returns 404

```gherkin
Given the ProductController is instantiated with the Playwright request fixture
When I call productController.replace(9999, { name: "Ghost Product", price: 0 })
Then the response status is 404
```

**Assertions:**
- `response.status()` equals `404`

---

## 🔧 Technical Context

### Current State

- `ProductController.replace(id: number, payload: CreateProductPayload)` exists at `src/controllers/product.controller.ts:19`
- `CreateProductPayload = Omit<Product, 'id'>` → `{ name: string, price: number }` at `src/models/product.model.ts:7`
- `PutProductResponse = { id: string, message: string }` at `src/models/product.model.ts:14`
- Mockfly PUT response returns `{ id: ":id", message: "Product updated successfully" }` — the `id` field contains the literal string `":id"` (Mockfly template variable, not interpolated with the actual path param)
- `STATUS.OK = 200` and `STATUS.NOT_FOUND = 404` defined at `src/utils/constants.ts`
- `tests/products/products.spec.ts` is currently empty — tests need to be written

### Proposed Changes

- Add test: `'PUT /products/:id returns 200 with update confirmation'`
- Add test: `'PUT /products/:id returns 404 for non-existent id'`
- Cast response body as `PutProductResponse` after `response.json()`

### Technical Constraints

- No `.json()` calls inside controllers — all parsing stays in the test spec
- Use `@controllers/product.controller` and `@models/product.model` aliases — no relative imports
- Assert `response.status()` before any body assertions (CLAUDE.md rule)
- PUT is a full-replacement operation — pass both `name` and `price` in every request; do not use partial payloads

### Architecture Decisions

- **Response type**: `PutProductResponse = { id: string, message: string }` — `id` is typed as `string` because Mockfly returns the literal `":id"` template string, not a numeric ID; do not assert `body.id` value
- **404 test**: do not call `response.json()` unless Mockfly is configured to return a structured error body for 404

---

## 🚫 Out of Scope

1. Partial updates (PATCH) — covered by a separate controller method and ticket
2. Verifying the product state after replacement via GET — no chained assertions
3. Response body field echo verification (`name`, `price`) — Mockfly returns a fixed confirmation message, not echoed payload

**Future Considerations**: A follow-on ticket can chain PUT → GET to assert the stored product reflects the replacement payload.

---

## ⚠️ Edge Cases & Error Handling

### Edge Cases

1. **Mockfly `id` field is literal `":id"`** — do not assert `body.id`; the mock returns an un-interpolated template string, not the actual numeric path param
2. **Full replacement semantics** — both `name` and `price` must be included in the request; omitting either would technically violate REST PUT contract even though Mockfly does not validate it
3. **Strict mode type casting** — cast with `as PutProductResponse` immediately after `response.json()` to satisfy TypeScript

### Data Validation Rules

- Request `name` → `typeof === 'string'` (required)
- Request `price` → `typeof === 'number'` (required)
- Response `message` → `typeof === 'string'` and equals `"Product updated successfully"`

### Error Scenarios

1. **Product not found** → expect `404`; do not call `response.json()` unless the mock returns a structured error body

---

## 📦 Dependencies

### Blocking

- Mockfly mock must be configured to return `404` for `PUT /products/9999` — verify in dashboard before implementing the negative test

### Related

- `tests/products/products.spec.ts` — file to add tests to
- `src/models/product.model.ts` — `CreateProductPayload` and `PutProductResponse` already defined
- `src/utils/constants.ts` — `STATUS.OK` and `STATUS.NOT_FOUND` already defined
- SAU-61 — sibling ticket covering POST /products
- SAU-62 — sibling ticket covering GET /products/:id

---

## 🎓 Definition of Done

### Code Quality

- [ ] `response.status()` asserted before any body assertions
- [ ] Only `@controllers/*`, `@models/*`, and `@utils/*` path aliases used — no relative imports
- [ ] No `.json()` calls inside the controller
- [ ] Full replacement payload `{ name, price }` passed on every PUT call

### Testing

- [ ] PUT test asserts status `200`
- [ ] PUT test asserts `body.message === "Product updated successfully"`
- [ ] PUT test asserts `typeof body.message === 'string'`
- [ ] 404 test asserts status `404` for `replace(9999, payload)`
- [ ] `npm run test:products` exits green

### Review

- [ ] Code reviewed and approved
- [ ] PR merged to main

---

## 📝 Implementation Notes

**File to edit**: `tests/products/products.spec.ts`

**Happy path test skeleton**:

```typescript
test('PUT /products/:id returns 200 with update confirmation', async ({ productController }) => {
  const payload: CreateProductPayload = { name: 'Updated Product', price: 49.99 };
  const response = await productController.replace(1, payload);

  expect(response.status()).toBe(STATUS.OK);

  const body = await response.json() as PutProductResponse;
  expect(typeof body.message).toBe('string');
  expect(body.message).toBe('Product updated successfully');
});
```

**404 test skeleton**:

```typescript
test('PUT /products/:id returns 404 for non-existent id', async ({ productController }) => {
  const payload: CreateProductPayload = { name: 'Ghost Product', price: 0 };
  const response = await productController.replace(9999, payload);

  expect(response.status()).toBe(STATUS.NOT_FOUND);
});
```

---

**Created**: 2026-04-23
**Refined from**: `--from-input` via create-sdd-ticket skill
**INVEST Validated**: ✅
**BDD Scenarios**: 3
**Autonomous Inference Rate**: 100%
**Questions Asked**: 0
**Priority**: High

# SAU-62: GET /products/:id — Retrieve product returns 200 with Product shape, 404 for unknown id

> **Source**: Refined from `--from-input` via create-sdd-ticket skill
> **Linear**: https://linear.app/saucedemo-qa/issue/SAU-62

---

## 📋 User Story

**As a** QA engineer maintaining the api-automation-framework
**I want** to GET `/products/:id` and assert the response shape and status code
**So that** I can confirm Mockfly returns HTTP 200 with a well-typed Product object, and HTTP 404 when the requested ID does not exist

---

## 🔑 Preconditions

- `ProductController` is instantiated with the Playwright `request` fixture
- Request header `Accept: application/json` is set on all outbound calls (injected by `ApiClient`)
- Request header `x-api-key: 39ce2e7d-b677-4f40-995e-fb43b96f46c1` is set on all outbound calls (injected by `ApiClient` via `ENV.API_KEY`)
- Target base URL: `https://api.mockfly.dev/mocks/cab5e087-09ad-424c-b618-52f3993993f0`
- `API_KEY` is present in `.env.local` and loaded by `playwright.config.ts` before tests run
- Mockfly mock is configured to return `{ id: 1, name: "Test Product", price: 10.99 }` for `GET /products/1`
- Mockfly mock is configured to return `404` for `GET /products/:id` when the ID has no matching record (e.g. `id=9999`)

---

## 🎯 Success Criteria

1. GET `/products/1` returns status **200**
2. Response body matches `Product` shape: `{ id: number, name: string, price: number }`
3. `body.id` equals the requested ID (`1`)
4. GET `/products/9999` returns status **404**
5. The test lives in `tests/products/products.spec.ts` and uses `ProductController.getById()` — no direct URL construction

**Metrics**: `npm run test:products` exits green

---

## ✅ Acceptance Criteria

### Scenario 1: GET /products/:id with existing id returns 200

```gherkin
Given the ProductController is instantiated with the Playwright request fixture
When I call productController.getById(1)
Then the response status is 200
```

**Assertions:**
- `response.status()` equals `200`
- `isProduct(body)` returns `true` (schema guard passes)
- `body.id` equals `1`
- `typeof body.name` equals `"string"`
- `typeof body.price` equals `"number"`

### Scenario 2: Response body matches the Product schema

```gherkin
Given a GET to /products/1 returned HTTP 200
When I parse the response body as Product
Then the body contains id, name, and price fields with correct types
```

**Assertions:**
- `typeof body.id` equals `"number"`
- `typeof body.name` equals `"string"`
- `typeof body.price` equals `"number"`
- `Array.isArray(body)` equals `false` (not a list)

---

## 🔧 Technical Context

### Current State

- `ProductController.getById(id: number)` exists at `src/controllers/product.controller.ts:11`
- `Product` interface at `src/models/product.model.ts:1` → `{ id: number, name: string, price: number }`
- `isProduct(value)` type guard at `src/utils/schema.helper.ts` — validates all three fields
- `expectAPI.bodyToMatchSchema(response, isProduct)` helper at `src/utils/expect.helper.ts:25` — parses and validates in one call
- `STATUS.OK = 200` and `STATUS.NOT_FOUND = 404` defined at `src/utils/constants.ts`
- `tests/products/products.spec.ts` is currently empty — tests need to be written

### Proposed Changes

- Add test: `'GET /products/:id returns 200 with correct Product shape'`
- Add test: `'GET /products/:id returns 404 for non-existent id'`
- Use `expectAPI.bodyToMatchSchema(response, isProduct)` for schema assertion on the 200 path

### Technical Constraints

- No `.json()` calls inside controllers — all parsing stays in the test spec
- Use `@controllers/product.controller` and `@models/product.model` aliases — no relative imports
- Assert `response.status()` before any body assertions (CLAUDE.md rule)
- Cast response body with `as Product` immediately after `response.json()` when not using `bodyToMatchSchema`

### Architecture Decisions

- **Schema validation pattern**: use `expectAPI.bodyToMatchSchema(response, isProduct)` — it parses, validates, and returns the typed body in one call; avoids duplicate `response.json()` calls
- **404 test**: call `productController.getById(9999)` with a high numeric ID unlikely to exist; do not call `response.json()` unless the mock returns a structured error body

---

## 🚫 Out of Scope

1. GET `/products` (list all) — no such endpoint defined in the Mockfly mock
2. Response time / performance assertions
3. Authenticated vs unauthenticated access differentiation

**Future Considerations**: A follow-on ticket can chain POST → GET to verify a freshly created product is retrievable.

---

## ⚠️ Edge Cases & Error Handling

### Edge Cases

1. **Mockfly returns fixed `id: 1` regardless of path param** — assert `body.id === 1` only because that is the mock's configured value; do not assume the API echoes the requested ID dynamically
2. **Strict mode type casting** — use `as Product` immediately after `response.json()` when not going through `bodyToMatchSchema`
3. **Non-existent ID mock configuration** — if Mockfly is not yet configured for 404, the 404 test will fail; configure a conditional response rule in the dashboard first

### Data Validation Rules

- `id` → `typeof === 'number'`
- `name` → `typeof === 'string'`
- `price` → `typeof === 'number'`

### Error Scenarios

1. **ID not found** → expect `404`; do not call `response.json()` unless the mock returns a structured error body

---

## 📦 Dependencies

### Blocking

- Mockfly mock must be configured to return `404` for `GET /products/9999` (or any non-existing ID) — verify in dashboard before implementing the negative test

### Related

- `tests/products/products.spec.ts` — file to add tests to
- `src/models/product.model.ts` — `Product` type already defined
- `src/utils/schema.helper.ts` — `isProduct` guard already defined
- `src/utils/constants.ts` — `STATUS.OK` and `STATUS.NOT_FOUND` already defined
- SAU-61 — sibling ticket covering POST /products

---

## 🎓 Definition of Done

### Code Quality

- [ ] `response.status()` asserted before any body assertions
- [ ] Only `@controllers/*`, `@models/*`, and `@utils/*` path aliases used — no relative imports
- [ ] No `.json()` calls inside the controller

### Testing

- [ ] GET test asserts status `200`
- [ ] GET test asserts `isProduct(body)` passes via `bodyToMatchSchema`
- [ ] GET test asserts `body.id === 1`
- [ ] GET test asserts `typeof body.name === 'string'` and `typeof body.price === 'number'`
- [ ] 404 test asserts status `404` for `getById(9999)`
- [ ] `npm run test:products` exits green

### Review

- [ ] Code reviewed and approved
- [ ] PR merged to main

---

## 📝 Implementation Notes

**File to edit**: `tests/products/products.spec.ts`

**Happy path test skeleton**:

```typescript
test('GET /products/:id returns 200 with correct Product shape', async ({ productController }) => {
  const response = await productController.getById(1);

  expect(response.status()).toBe(STATUS.OK);

  const body = await expectAPI.bodyToMatchSchema(response, isProduct);
  expect(body.id).toBe(1);
  expect(typeof body.name).toBe('string');
  expect(typeof body.price).toBe('number');
});
```

**404 test skeleton**:

```typescript
test('GET /products/:id returns 404 for non-existent id', async ({ productController }) => {
  const response = await productController.getById(9999);

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

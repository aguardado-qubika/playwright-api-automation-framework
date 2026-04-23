# SAU-61: POST /products — Create product returns 201 with valid body, 400 on empty body

> **Source**: Refined from `--from-input` via create-sdd-ticket skill
> **Linear**: https://linear.app/saucedemo-qa/issue/SAU-61

---

## 📋 User Story

**As a** QA engineer maintaining the api-automation-framework
**I want** to POST `/products` with `{ name, price }` and assert the response
**So that** I can confirm Mockfly returns HTTP 201 with a valid product object and HTTP 400 when the body is empty

---

## 🔑 Preconditions

- `ProductController` is instantiated with the Playwright `request` fixture
- Request header `Content-Type: application/json` is set on all outbound calls (injected by `ApiClient`)
- Request header `x-api-key: 39ce2e7d-b677-4f40-995e-fb43b96f46c1` is set on all outbound calls (injected by `ApiClient` via `ENV.API_KEY`)
- Target base URL: `https://api.mockfly.dev/mocks/cab5e087-09ad-424c-b618-52f3993993f0`
- `API_KEY` is present in `.env.local` and loaded by `playwright.config.ts` before tests run

---

## 🎯 Success Criteria

1. POST `/products` with `{ name: string, price: number }` returns status **201**
2. Response body contains `id` (positive integer), `name` (string), `price` (number), `status: "success"`
3. POST `/products` with an empty body returns status **400**
4. The test lives in `tests/products/products.spec.ts` and uses `ProductController.create()` — no direct URL construction

**Metrics**: `npm run test:products` exits green

---

## ✅ Acceptance Criteria

### Scenario 1: POST with valid payload returns 201

```gherkin
Given the ProductController is instantiated with the Playwright request fixture
When I call productController.create({ name: "Test Product", price: 29.99 })
Then the response status is 201
```

**Assertions:**
- `response.status()` equals `201`
- `body.id` is of type `number`
- `body.id` is greater than `0`
- `body.status` equals `"success"`

### Scenario 2: Response body contains required fields

```gherkin
Given a POST to /products returned HTTP 201
When I parse the response body as CreateProductResponse
Then the body contains id, name, price, and status fields
```

**Assertions:**
- `typeof body.id` equals `"number"`
- `typeof body.name` equals `"string"`
- `typeof body.price` equals `"number"`
- `typeof body.status` equals `"string"`

### Scenario 3: POST with empty body returns 400

```gherkin
Given the ProductController is instantiated with the Playwright request fixture
When I call productController.create({} as any) or send an empty payload
Then the response status is 400
```

**Assertions:**
- `response.status()` equals `400`

---

## 🔧 Technical Context

### Current State

- `ProductController.create(payload: CreateProductPayload)` exists at `src/controllers/product.controller.ts:15`
- `CreateProductPayload = Omit<Product, 'id'>` → `{ name: string, price: number }`
- `CreateProductResponse extends Product` → `{ id: number, name: string, price: number, status: string }` at `src/models/product.model.ts`
- Existing POST test in `tests/products/products.spec.ts` asserts 201 + `body.id` + `body.status` — does **not** cover the 400 case
- `STATUS.BAD_REQUEST = 400` is defined in `src/utils/constants.ts`

### Proposed Changes

- Enhance the existing `'POST /products returns 201 with id and status field'` test to add explicit `typeof` checks for all response fields
- Add a new test: `'POST /products with empty body returns 400'`
- The 400 scenario requires the Mockfly mock to be configured to return 400 for empty-body POST requests

### Technical Constraints

- No `.json()` calls inside controllers — all parsing stays in the test spec
- Use `@controllers/product.controller` and `@models/product.model` aliases — no relative imports
- Assert `response.status()` before any body assertions (CLAUDE.md rule)
- Cast response body with `as CreateProductResponse` immediately after `response.json()`

### Architecture Decisions

- **Type assertion pattern**: cast with `as CreateProductResponse`; validate field types with `typeof` checks — no runtime schema library per CLAUDE.md
- **400 test payload**: pass an empty object cast as `any` to bypass TypeScript compile-time enforcement; the intent is to test the API boundary, not the type system

---

## 🚫 Out of Scope

1. Payload field validation beyond empty-body (e.g. missing only `name`, or negative `price`)
2. Authentication failure scenarios (wrong or missing API key)
3. Persistence or retrieval verification after creation

**Future Considerations**: A follow-on ticket can chain POST → GET to verify the created product is retrievable.

---

## ⚠️ Edge Cases & Error Handling

### Edge Cases

1. **Mockfly returns fixed `id: 123`** — use `body.id` dynamically; do not assert a specific value like `toBe(123)`
2. **Mockfly fixed `name: "New Product"` / `price: 0`** — do not assert echoed payload fields; the mock overrides them with its configured response
3. **Strict mode type casting** — cast with `as CreateProductResponse` immediately after `response.json()` to satisfy TypeScript

### Data Validation Rules

- `id` → `typeof === 'number'` and `> 0`
- `name` → `typeof === 'string'`
- `price` → `typeof === 'number'`
- `status` → `typeof === 'string'` and `=== 'success'`

### Error Scenarios

1. **Empty body POST** → expect `400 Bad Request`; do not call `response.json()` unless the mock returns a structured error body

---

## 📦 Dependencies

### Blocking

- Mockfly mock must be configured to return `400` for POST `/products` with empty body — verify in dashboard before implementing the negative test

### Related

- `tests/products/products.spec.ts` — file to edit
- `src/models/product.model.ts` — `CreateProductResponse` type already defined
- `src/utils/constants.ts` — `STATUS.CREATED` and `STATUS.BAD_REQUEST` already defined

---

## 🎓 Definition of Done

### Code Quality

- [ ] `response.status()` asserted before any body assertions
- [ ] Only `@controllers/*` and `@models/*` path aliases used — no relative imports
- [ ] No `.json()` calls inside the controller

### Testing

- [ ] POST test asserts status `201`
- [ ] POST test asserts `typeof body.id === 'number'` and `body.id > 0`
- [ ] POST test asserts `body.status === 'success'`
- [ ] POST test asserts `typeof body.name === 'string'` and `typeof body.price === 'number'`
- [ ] Empty-body POST test asserts status `400`
- [ ] `npm run test:products` exits green

### Review

- [ ] Code reviewed and approved
- [ ] PR merged to main

---

## 📝 Implementation Notes

**File to edit**: `tests/products/products.spec.ts`

**Enhance existing test** — add `typeof` assertions for `name` and `price`:

```typescript
test('POST /products returns 201 with id and status field', async ({ productController }) => {
  const payload = { name: 'Test Product', price: 29.99 };
  const response = await productController.create(payload);

  expect(response.status()).toBe(STATUS.CREATED);

  const body = await response.json() as CreateProductResponse;
  expect(typeof body.id).toBe('number');
  expect(body.id).toBeGreaterThan(0);
  expect(typeof body.name).toBe('string');
  expect(typeof body.price).toBe('number');
  expect(body.status).toBe('success');
});
```

**New test** — empty body returns 400:

```typescript
test('POST /products with empty body returns 400', async ({ productController }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await productController.create({} as any);

  expect(response.status()).toBe(STATUS.BAD_REQUEST);
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

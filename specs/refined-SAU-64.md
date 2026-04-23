# SAU-64: DELETE /products/:id — Remove product returns 204, subsequent GET returns 404

> **Source**: Refined from `--from-input` via create-sdd-ticket skill
> **Linear**: https://linear.app/saucedemo-qa/issue/SAU-64

---

## 📋 User Story

**As a** QA engineer maintaining the api-automation-framework
**I want** to DELETE `/products/:id` and verify the product is no longer accessible
**So that** I can confirm Mockfly returns HTTP 204 on deletion and HTTP 404 on a subsequent GET for the same ID

---

## 🔑 Preconditions

- `ProductController` is instantiated with the Playwright `request` fixture
- Request header `x-api-key: 39ce2e7d-b677-4f40-995e-fb43b96f46c1` is set on all outbound calls (injected by `ApiClient` via `ENV.API_KEY`)
- No `Content-Type` header is required on DELETE requests (no request body)
- Target base URL: `https://api.mockfly.dev/mocks/cab5e087-09ad-424c-b618-52f3993993f0`
- `API_KEY` is present in `.env.local` and loaded by `playwright.config.ts` before tests run
- Mockfly mock is configured to return `204` with empty body for `DELETE /products/:id`
- Mockfly mock is configured to return `404` for `GET /products/9999` (a pre-designated "deleted/absent" ID used to simulate post-deletion state, since Mockfly is stateless)

---

## 🎯 Success Criteria

1. DELETE `/products/1` returns status **204** with no response body
2. A subsequent GET for a product ID that no longer exists returns status **404**
3. The test lives in `tests/products/products.spec.ts` and uses `ProductController.delete()` and `ProductController.getById()` — no direct URL construction

**Metrics**: `npm run test:products` exits green

---

## ✅ Acceptance Criteria

### Scenario 1: DELETE /products/:id with existing id returns 204

```gherkin
Given the ProductController is instantiated with the Playwright request fixture
When I call productController.delete(1)
Then the response status is 204
And the response has no parseable body
```

**Assertions:**
- `response.status()` equals `204`
- `response.json()` is NOT called (204 No Content carries no body)

### Scenario 2: GET /products/:id after deletion returns 404

```gherkin
Given a product ID that Mockfly is configured to return 404 for (e.g. id=9999)
When I call productController.getById(9999) after a DELETE operation
Then the response status is 404
```

**Assertions:**
- `response.status()` equals `404`

> **Note on mock statefulness**: Mockfly is a stateless mock — DELETE does not remove the product record server-side. The post-deletion GET is validated using a pre-configured ID (`9999`) that Mockfly is set to return 404 for unconditionally. This simulates the expected API contract without requiring real persistence.

### Scenario 3: Sequential DELETE → GET contract test

```gherkin
Given the ProductController is instantiated with the Playwright request fixture
When I call productController.delete(1)
Then the response status is 204
When I call productController.getById(9999)
Then the response status is 404
```

**Assertions:**
- First `response.status()` equals `204`
- Second `response.status()` equals `404`

---

## 🔧 Technical Context

### Current State

- `ProductController.delete(id: number)` exists at `src/controllers/product.controller.ts:27`
- `ProductController.getById(id: number)` exists at `src/controllers/product.controller.ts:11` — used for the follow-up GET assertion
- `STATUS.NO_CONTENT = 204` and `STATUS.NOT_FOUND = 404` defined at `src/utils/constants.ts`
- Mockfly DELETE `/products/:id` returns `204` with empty body (confirmed from Mockfly JSON export)
- `tests/products/products.spec.ts` is currently empty — tests need to be written

### Proposed Changes

- Add test: `'DELETE /products/:id returns 204 with no body'`
- Add test: `'GET /products/:id returns 404 after product is deleted'` using `getById(9999)` against a pre-configured 404 mock response
- Optionally: one sequential test combining both assertions within a single `test()` block

### Technical Constraints

- Do NOT call `response.json()` after a 204 response — there is no body to parse
- Use `@controllers/product.controller` and `@utils/*` aliases — no relative imports
- Assert `response.status()` is the only assertion needed on DELETE (no body)
- Mockfly is stateless: the GET 404 post-deletion scenario must use a pre-designated absent ID, not the same ID passed to DELETE

### Architecture Decisions

- **Stateless mock workaround**: use `id=9999` (configured in Mockfly to always 404) as the proxy for a "deleted" resource — this tests the API contract, not mock persistence
- **Sequential test**: combining DELETE + GET in one `test()` block is acceptable here because the GET assertion directly validates the post-deletion contract; these are not independent operations

---

## 🚫 Out of Scope

1. Verifying that the product is truly removed from a real database (Mockfly is stateless)
2. DELETE followed by re-creation (POST) of the same resource
3. Cascade deletion of related resources

**Future Considerations**: If the target API is replaced with a real backend, the follow-up GET should use the same `id` passed to DELETE to test true persistence removal.

---

## ⚠️ Edge Cases & Error Handling

### Edge Cases

1. **204 response has no body** — calling `response.json()` will throw; assert only `response.status()` for the DELETE test
2. **Mockfly is stateless** — DELETE `/products/1` does not remove the record; a subsequent `getById(1)` would still return 200; use `getById(9999)` (a pre-configured 404 ID) to simulate the post-deletion GET check
3. **Idempotent DELETE** — a second DELETE for the same ID may still return 204 or 404 depending on Mockfly configuration; this is not currently covered

### Data Validation Rules

- DELETE response: no body expected; status `204` is the complete assertion
- GET response after deletion: status `404`; no body assertions required

### Error Scenarios

1. **Product not found on DELETE** → depending on Mockfly config, may return 404 or still 204; document whichever the mock returns

---

## 📦 Dependencies

### Blocking

- Mockfly mock must be configured to return `404` for `GET /products/9999` — this is the designated "absent ID" for the post-deletion contract test
- SAU-62 (GET /products/:id) should be implemented and passing before this ticket — the follow-up GET reuses the same controller method

### Related

- `tests/products/products.spec.ts` — file to add tests to
- `src/controllers/product.controller.ts` — `delete()` and `getById()` both already implemented
- `src/utils/constants.ts` — `STATUS.NO_CONTENT` and `STATUS.NOT_FOUND` already defined
- SAU-61 — sibling ticket covering POST /products
- SAU-62 — sibling ticket covering GET /products/:id
- SAU-63 — sibling ticket covering PUT /products/:id

---

## 🎓 Definition of Done

### Code Quality

- [ ] `response.status()` is the only assertion on the DELETE response (no body parsing)
- [ ] Only `@controllers/*` and `@utils/*` path aliases used — no relative imports
- [ ] No `.json()` call after the 204 DELETE response

### Testing

- [ ] DELETE test asserts status `204`
- [ ] Follow-up GET test asserts status `404` using `getById(9999)`
- [ ] `npm run test:products` exits green

### Review

- [ ] Code reviewed and approved
- [ ] PR merged to main

---

## 📝 Implementation Notes

**File to edit**: `tests/products/products.spec.ts`

**DELETE 204 test skeleton**:

```typescript
test('DELETE /products/:id returns 204 with no body', async ({ productController }) => {
  const response = await productController.delete(1);

  expect(response.status()).toBe(STATUS.NO_CONTENT);
});
```

**Sequential DELETE → GET test skeleton**:

```typescript
test('GET /products/:id returns 404 after product is deleted', async ({ productController }) => {
  // Step 1: delete a known product
  const deleteResponse = await productController.delete(1);
  expect(deleteResponse.status()).toBe(STATUS.NO_CONTENT);

  // Step 2: GET a pre-configured absent ID (Mockfly stateless workaround)
  // id=9999 must be configured in Mockfly to return 404 unconditionally
  const getResponse = await productController.getById(9999);
  expect(getResponse.status()).toBe(STATUS.NOT_FOUND);
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

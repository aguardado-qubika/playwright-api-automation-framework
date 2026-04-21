# SAU-61: Test POST /posts returns HTTP 201 with id field

> **Source**: Refined from SAU-61 + `--from-input` scope reduction
> **Linear**: https://linear.app/saucedemo-qa/issue/SAU-61

---

## 📋 User Story

**As a** QA engineer maintaining the api-automation-framework
**I want** to send POST `/posts` with `{ title, body, userId }` and assert the response
**So that** I can confirm JSONPlaceholder returns HTTP 201 and includes a valid numeric `id` in the response body

---

## 🎯 Success Criteria

1. POST `/posts` with a complete `CreatePostPayload` returns status 201
2. The response body contains an `id` field that is a positive integer
3. The test lives in `tests/posts/posts.spec.ts` and uses `PostController.create()` — no direct URL construction

**Metrics**: `npm run test:posts` exits green

---

## ✅ Acceptance Criteria

### Scenario 1: POST /posts with valid payload returns HTTP 201

```gherkin
Given the PostController is instantiated with the Playwright request fixture
When I call posts.create({ userId: 1, title: "test title", body: "test body" })
Then the response status is 201
```

### Scenario 2: Response body contains a numeric id field

```gherkin
Given a POST to /posts returned HTTP 201
When I parse the response body as Post
Then the body contains an `id` field
And `typeof body.id` equals "number"
And `body.id` is greater than 0
```

### Scenario 3: Payload fields are echoed in the response body

```gherkin
Given I called posts.create({ userId: 1, title: "test title", body: "test body" })
When I parse the response body as Post
Then `body.title` equals "test title"
And `body.body` equals "test body"
And `body.userId` equals 1
```

---

## 🔧 Technical Context

### Current State

- `PostController` exists at `src/controllers/post.controller.ts` with a `create(payload: CreatePostPayload)` method
- `Post` model at `src/models/post.model.ts` defines `{ id, userId, title, body }` and `CreatePostPayload = Omit<Post, 'id'>`
- The existing `'POST /posts creates a new post'` test in `tests/posts/posts.spec.ts` checks status 201 and `body.id` is defined — but does **not** assert `id` is type `number` or that all payload fields are echoed

### Proposed Changes

- Enhance or replace the existing POST test to add:
  - `expect(typeof body.id).toBe('number')`
  - `expect(body.id).toBeGreaterThan(0)`
  - Payload echo assertions: `title`, `body`, `userId`
- Fix `PostController` constructor: `request: any` → `request: APIRequestContext` (CLAUDE.md rule #1)

### Technical Constraints

- JSONPlaceholder always returns `id: 101` for POST — assertions must still use the dynamic value from the response, not a hardcoded constant
- No `.json()` calls inside the controller — all parsing stays in the test spec
- Use `@controllers/post.controller` and `@models/post.model` aliases — no relative imports

### Architecture Decisions

- **Type assertion pattern**: cast response body with `as Post`; validate individual field types with `typeof` checks — no runtime schema library per CLAUDE.md

---

## 🚫 Out of Scope

1. GET /posts/{id} — covered separately in SAU-61 (sequential flow ticket)
2. Negative cases (missing fields, wrong types) — JSONPlaceholder ignores input validation
3. Persistence verification

**Future Considerations**: A follow-on test (as originally described in SAU-61) can chain this POST into a GET to verify full schema on retrieval.

---

## ⚠️ Edge Cases & Error Handling

### Edge Cases

1. **JSONPlaceholder always returns id: 101** — use `body.id` dynamically; do not assert a specific value like `toBe(101)`
2. **Strict mode type casting** — cast with `as Post` immediately after `response.json()` to satisfy TypeScript

### Data Validation Rules

- `id` → `typeof === 'number'` and `> 0`
- `title` → `typeof === 'string'`
- `body` → `typeof === 'string'`
- `userId` → `typeof === 'number'`

---

## 📦 Dependencies

### Blocking

- None — `PostController.create()` and `Post` model are already in place

### Related

- SAU-61 (Linear) — parent ticket covering the broader POST→GET sequential flow

---

## 🎓 Definition of Done

### Code Quality

- [ ] `PostController` constructor types `request` as `APIRequestContext` (not `any`)
- [ ] `response.status()` asserted before any body assertions (CLAUDE.md rule)
- [ ] Only `@controllers/*` and `@models/*` path aliases used — no relative imports
- [ ] No `.json()` calls inside the controller

### Testing

- [ ] POST test asserts status 201
- [ ] POST test asserts `typeof body.id === 'number'` and `body.id > 0`
- [ ] POST test asserts payload echo: `title`, `body`, `userId` match input
- [ ] `npm run test:posts` exits green

### Review

- [ ] Code reviewed and approved
- [ ] PR merged to main

---

## 📝 Implementation Notes

**File to edit**: `tests/posts/posts.spec.ts` — enhance the existing `'POST /posts creates a new post'` test block.

**Fix required**: `src/controllers/post.controller.ts` line 10 — change `constructor(request: any)` to `constructor(request: APIRequestContext)` and add `import { APIRequestContext, APIResponse } from '@playwright/test';`.

**Test skeleton**:

```typescript
test('POST /posts returns 201 with a numeric id and echoed payload', async () => {
  const payload = { userId: 1, title: 'test title', body: 'test body' };
  const response = await posts.create(payload);

  expect(response.status()).toBe(201);

  const body = await response.json() as Post;
  expect(typeof body.id).toBe('number');
  expect(body.id).toBeGreaterThan(0);
  expect(body.title).toBe(payload.title);
  expect(body.body).toBe(payload.body);
  expect(body.userId).toBe(payload.userId);
});
```

---

**Created**: 2026-04-21
**Refined from**: SAU-61 (Linear) + `--from-input` scope reduction
**INVEST Validated**: ✅
**BDD Scenarios**: 3
**Priority**: High

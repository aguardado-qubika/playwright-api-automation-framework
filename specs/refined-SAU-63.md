# SAU-63: Update Post — PUT /posts/:id replaces a post and returns HTTP 200 with the updated title

## 📋 User Story

**As a** QA engineer maintaining the api-automation-framework
**I want** a test that calls `PostController.replace()` and asserts the response
**So that** the PUT contract with JSONPlaceholder is verified and protected against regression

---

## 👥 Stakeholders

| Role          | Name             | Responsibility                          |
| ------------- | ---------------- | --------------------------------------- |
| QA Engineer   | Alexis Guardado  | Implementation, test authoring          |
| Product Owner | SauceDemo QA Team| Acceptance against Definition of Done  |

---

## 🎯 Success Criteria

1. `tests/posts/posts-agent.spec.ts` contains a new test: `'PUT /posts/:id replaces a post and returns updated title'`
2. The test calls `postController.replace(1, payload)` — no direct URL construction
3. `response.status()` is asserted as `STATUS.OK` (200) before any body assertions
4. `body.title`, `body.userId`, and `body.body` each equal the corresponding values sent in the payload
5. The response body passes the `isPost` schema guard via `expectAPI.bodyToMatchSchema`
6. `npm run test:posts` exits green

**Metrics**: Zero failing tests in the `test:posts` script after the change

---

## ✅ Acceptance Criteria

### Scenario 1: PUT /posts/1 with a full payload returns HTTP 200

```gherkin
Given the postController fixture is injected by Playwright
When I call postController.replace(1, { userId: 1, title: "replaced title", body: "replaced body" })
Then response.status() equals 200
```

### Scenario 2: Response body reflects every sent field exactly

```gherkin
Given a PUT to /posts/1 returned HTTP 200
When I parse the response body through the isPost schema guard
Then body.title equals "replaced title"
And body.userId equals 1
And body.body equals "replaced body"
```

### Scenario 3: Response body passes the full Post schema

```gherkin
Given a PUT to /posts/1 returned HTTP 200
When I call expectAPI.bodyToMatchSchema(response, isPost)
Then no schema validation error is thrown
And the returned body is typed as Post
```

---

## 🔧 Technical Context

### Current State (as of 2026-04-23)

- `PostController.replace(id: number, payload: CreatePostPayload): Promise<APIResponse>` **already exists** at `src/controllers/post.controller.ts:23` — it calls `this.client.put(this.url(`/${id}`), payload)`
- `PostController` constructor already accepts `APIRequestContext` (no `any` typing fix needed)
- `tests/posts/posts-agent.spec.ts` has 3 active tests (POST, GET /id, GET /all) — **no PUT test exists**
- `tests/posts/posts.spec.ts` is entirely commented out as a historical reference; do not edit it
- `STATUS.OK = 200` is defined in `src/utils/constants.ts`
- `isPost(value)` type guard is defined in `src/utils/schema.helper.ts`
- `expectAPI.bodyToMatchSchema(response, guard)` is defined in `src/utils/expect.helper.ts`; it parses `response.json()` internally and returns the typed body

### Proposed Changes

1. **Add one new test block** to `tests/posts/posts-agent.spec.ts`:

```typescript
test('PUT /posts/:id replaces a post and returns updated title', async ({ postController }) => {
  const payload: CreatePostPayload = { userId: 1, title: 'replaced title', body: 'replaced body' };
  const response = await postController.replace(1, payload);

  expect(response.status()).toBe(STATUS.OK);

  const body = await expectAPI.bodyToMatchSchema(response, isPost);
  expect(body.title).toBe(payload.title);
  expect(body.userId).toBe(payload.userId);
  expect(body.body).toBe(payload.body);
});
```

2. **Add missing imports** to the top of `tests/posts/posts-agent.spec.ts`:

```typescript
import { isPost } from '@utils/schema.helper';
import { CreatePostPayload } from '@models/post.model';
```

   (`STATUS`, `expectAPI`, and `Post` are already imported in the file.)

### Technical Constraints

- JSONPlaceholder does not persist PUT changes — a follow-up GET will return the original post; do not chain a GET assertion after PUT in this test
- `expectAPI.bodyToMatchSchema` calls `response.json()` internally — do **not** also call `response.json()` manually in the same test; doing so will throw because the response body can only be consumed once
- Use `@controllers/*`, `@models/*`, and `@utils/*` path aliases — no relative imports
- `PostController.replace()` uses `this.client.put()` (via `ApiClient`) — the controller must not be edited for this ticket

### Architecture Decisions

- **Fixture injection over `beforeEach`**: The active spec file uses `{ postController }` fixture injection from `@fixtures/index` (not `test.beforeEach`). Follow the same pattern; do not introduce a `beforeEach` block.
- **`isPost` + `expectAPI.bodyToMatchSchema` over raw cast**: The codebase has `isPost` and `expectAPI.bodyToMatchSchema` specifically to validate response shape. Use them so the schema contract is enforced, not just cast.
- **`STATUS.OK` over the literal `200`**: All status assertions in `posts-agent.spec.ts` use `STATUS.*` constants. Keep that consistency.
- **`CreatePostPayload` type annotation on payload**: Explicitly typing the payload as `CreatePostPayload` makes the contract visible at the call site and fails at compile time if a field is missing.

---

## 🚫 Out of Scope

1. Modifying `PostController.replace()` — it is already correct
2. Editing `tests/posts/posts.spec.ts` — it is intentionally commented out
3. Modifying the existing `update()` PATCH method
4. Asserting field types separately (e.g. `typeof body.title === 'string'`) — `isPost` already validates types
5. Negative-case tests (PUT with missing required fields) — follow-on ticket

**Future Considerations**: A negative-case test for PUT with an incomplete payload could be a follow-on ticket. JSONPlaceholder still returns 200 in those cases, so the assertion would verify that behavior explicitly.

---

## ⚠️ Edge Cases & Error Handling

### Edge Cases

1. **JSONPlaceholder does not persist PUT**: A subsequent `GET /posts/1` will return the original data, not the replaced data. Do not chain a GET assertion after PUT — the test would fail unpredictably.
2. **Double `response.json()` consumption**: `expectAPI.bodyToMatchSchema` already calls `response.json()`. Calling it again in the same test will throw. Use the returned `body` from `bodyToMatchSchema` for all field assertions.

### Data Validation Rules

- `response.status()` must equal `200` — not `201` (PUT to an existing resource returns 200, not Created)
- `body.title` must equal the exact string sent (`'replaced title'`)
- `body.userId` must equal `1` (the integer sent, not a string)
- `body.body` must equal `'replaced body'`

---

## 📦 Dependencies

### Blocking

- None — `PostController.replace()`, `isPost`, `STATUS.OK`, and `expectAPI.bodyToMatchSchema` are all already in place

### Related

- SAU-62 — GET /posts/:id test (same resource, same fixture pattern — reference for test style)
- SAU-64 — DELETE /posts/:id test (adjacent ticket in the same spec file)
- Existing `update()` PATCH method in `PostController` — similar shape, different verb and payload type

---

## 🎓 Definition of Done

### Code Quality

- [ ] `response.status()` asserted before any body assertions
- [ ] `expectAPI.bodyToMatchSchema(response, isPost)` used (not raw `as Post` cast)
- [ ] Payload typed as `CreatePostPayload` (not `{ userId, title, body }` inferred literal)
- [ ] Only `@controllers/*`, `@models/*`, `@utils/*`, `@fixtures/*` path aliases used
- [ ] No direct URL string construction in the test spec

### Testing

- [ ] New test: `'PUT /posts/:id replaces a post and returns updated title'` added to `tests/posts/posts-agent.spec.ts`
- [ ] `body.title`, `body.userId`, and `body.body` each asserted against payload values
- [ ] `npm run test:posts` exits green with all tests passing (existing 3 + new 1 = 4 total)

### Review

- [ ] Code reviewed and approved
- [ ] PR merged to main

---

## 📝 Implementation Notes

**File to edit**: `tests/posts/posts-agent.spec.ts` only

**Full updated import block** (replace existing imports at top of file):

```typescript
import { test, expect }    from '@fixtures/index';
import { expectAPI }       from '@utils/expect.helper';
import { isPost, isPostArray } from '@utils/schema.helper';
import { STATUS }          from '@utils/constants';
import { type Post, type CreatePostPayload } from '@models/post.model';
```

**Why `CreatePostPayload` and not `UpdatePostPayload`**: PUT replaces the full resource, so the payload must include all fields (`userId`, `title`, `body`). `UpdatePostPayload` is `Partial<CreatePostPayload>` — using it here would allow accidentally omitting required fields.

**Do not edit** `src/controllers/post.controller.ts` — `replace()` is already present and correct.

---

## 🔗 References

- `src/controllers/post.controller.ts:23` — existing `replace()` implementation
- `src/utils/schema.helper.ts` — `isPost` type guard
- `src/utils/expect.helper.ts` — `expectAPI.bodyToMatchSchema`
- `src/utils/constants.ts` — `STATUS.OK`
- `tests/posts/posts-agent.spec.ts` — file to edit; follow existing test style
- [JSONPlaceholder PUT /posts/1 docs](https://jsonplaceholder.typicode.com/guide/)

---

**Original Ticket**: SAU-63
**Refined**: 2026-04-23
**Refined By**: Claude (create-sdd-ticket skill)
**INVEST Validated**: ✅
**BDD Scenarios**: 3
**Priority**: High
**Estimation**: ~30 minutes (1 file, 1 test block, 2 imports)

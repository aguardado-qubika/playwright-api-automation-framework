# API Automation Framework

Contract test suite for REST APIs using the **API Controller Pattern** — the HTTP-layer equivalent of Page Object Model.

## Tech Stack

- **TypeScript** 5.4.5 — strict mode, ES2022, CommonJS modules
- **Playwright Test** 1.59.1 — test runner and HTTP client
- **Node.js** >=20
- **Target API** — [Mockfly](https://mockfly.dev) mock server

## Architecture

```
src/
├── api/
│   └── client.ts              # Low-level HTTP wrapper (ApiClient)
├── config/
│   └── environment.ts         # ENV config — reads process.env with defaults
├── controllers/
│   ├── base.controller.ts     # Abstract base: URL construction only
│   └── product.controller.ts  # Resource-specific HTTP methods
├── fixtures/
│   └── index.ts               # Playwright fixture extensions
├── models/
│   └── product.model.ts       # TypeScript interfaces and payload types
└── utils/
    ├── constants.ts           # ENDPOINTS and STATUS code maps
    ├── env.helper.ts
    ├── expect.helper.ts
    └── schema.helper.ts

tests/
└── products/
    └── products.spec.ts       # Assertions only — no URL construction
```

### Layer responsibilities

| Layer | Responsibility | What it never does |
|---|---|---|
| `ApiClient` | HTTP transport, headers | Build resource URLs |
| `BaseController` | URL construction | Fire HTTP requests or assert |
| Resource controller | Compose URL + delegate to client | Call `expect()` |
| Test spec | Assert status + body | Build URLs directly |
| Model | TypeScript types at compile time | Runtime validation |

## Setup

```bash
npm install
```

Create a `.env.local` file (gitignored) for local overrides:

```bash
BASE_URL=https://api.mockfly.dev/mocks/<your-mock-id>
API_KEY=your-api-key
```

If `.env.local` is absent, `playwright.config.ts` falls back to the default Mockfly endpoint.

## Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all tests |
| `npm run test:products` | Run products tests only |
| `npm run report` | Open the HTML report |

### CI behavior

When `process.env.CI` is set, the runner uses **2 workers** and **1 retry**. Locally it uses 4 workers and no retries.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | Mockfly endpoint | Target API base URL |
| `API_KEY` | `""` | API key sent as `x-api-key` header |
| `TIMEOUT_MS` | `10000` | Request timeout in ms (used by `ENV`) |
| `LOG_LEVEL` | `"info"` | Log verbosity: `silent`, `info`, `debug` |

> **Note:** `playwright.config.ts` has a 15,000ms test timeout and reads `BASE_URL` directly from `process.env`. `ENV.TIMEOUT_MS` defaults to 10,000ms. These are intentionally separate knobs.

## Adding a New Resource

1. **Model** — add `src/models/<resource>.model.ts` with a base interface, `CreatePayload`, and `UpdatePayload`:

```typescript
export interface Widget { id: number; name: string; }
export type CreateWidgetPayload = Omit<Widget, 'id'>;
export type UpdateWidgetPayload = Partial<CreateWidgetPayload>;
```

2. **Controller** — add `src/controllers/widget.controller.ts` extending `BaseController`:

```typescript
export class WidgetController extends BaseController {
  constructor(request: APIRequestContext) {
    super(new ApiClient(request), '/widgets');
  }
  getAll(): Promise<APIResponse> { return this.client.get(this.url()); }
}
```

3. **Fixture** — register the controller in `src/fixtures/index.ts`.

4. **Spec** — add `tests/widgets/widgets.spec.ts`. Assert status first, then body.

## Path Aliases

Configured in `tsconfig.json` and resolved by Playwright at runtime — always use aliases, never relative `../../` paths.

| Alias | Resolves to |
|---|---|
| `@api/*` | `src/api/*` |
| `@controllers/*` | `src/controllers/*` |
| `@models/*` | `src/models/*` |
| `@config/*` | `src/config/*` |
| `@utils/*` | `src/utils/*` |
| `@fixtures/*` | `src/fixtures/*` |

## Reports

Playwright writes three report formats after every run:

- **Console** — `list` reporter (real-time)
- **JSON** — `reports/results.json`
- **HTML** — `reports/html/index.html` (open with `npm run report`)

Traces are captured `on-first-retry` only.

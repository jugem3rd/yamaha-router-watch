# Phase 1 Summary

Phase 1: Workers API MVP is complete.

## Completed Scope

- Implemented Cloudflare Workers API with Hono and TypeScript.
- Added Cloudflare D1 schema migrations.
- Implemented event ingestion with `POST /api/v1/events`.
- Implemented heartbeat ingestion with `POST /api/v1/heartbeat`.
- Implemented read endpoints for recent events and heartbeats.
- Added `source_ip` observation using Cloudflare's `CF-Connecting-IP` header.
- Added local test scripts for event and heartbeat submission.
- Verified local D1 migration and local Workers API.
- Verified remote D1 migration and deployed Workers API.
- Added architecture, API, schema, security, Lua design, and roadmap docs.

## Current Deployed Development Environment

Worker URL:

```text
https://yamaha-router-watch-api.snow1606hawk.workers.dev
```

D1 database name:

```text
yamaha-router-watch-db
```

Current development `database_id`:

```text
226f766e-6d57-4e81-b936-ff8f2330ee0a
```

The current deployed URL and D1 database belong to the present development Cloudflare account. They should be treated as replaceable development resources.

## Verification Commands

Local:

```bash
cd apps/api
npm install
cp wrangler.toml.example wrangler.toml
npm run d1:migrate:local
npm run dev
```

In another terminal from the repository root:

```bash
bash scripts/send-test-event.sh
bash scripts/send-test-heartbeat.sh
bash scripts/get-test-events.sh
bash scripts/get-test-heartbeats.sh
```

Remote:

```bash
API_BASE_URL=https://yamaha-router-watch-api.snow1606hawk.workers.dev bash scripts/send-test-event.sh
API_BASE_URL=https://yamaha-router-watch-api.snow1606hawk.workers.dev bash scripts/send-test-heartbeat.sh
API_BASE_URL=https://yamaha-router-watch-api.snow1606hawk.workers.dev ADMIN_API_TOKEN=your-admin-token bash scripts/get-test-events.sh
API_BASE_URL=https://yamaha-router-watch-api.snow1606hawk.workers.dev ADMIN_API_TOKEN=your-admin-token bash scripts/get-test-heartbeats.sh
```

## Recreating Cloudflare Resources

When moving to a service-dedicated Cloudflare account:

1. Log in to Wrangler with the dedicated account, or set a dedicated `CLOUDFLARE_API_TOKEN`.
2. Create a new D1 database.
3. Copy the new `database_id` into local `apps/api/wrangler.toml`.
4. Apply remote migrations.
5. Insert a test device into remote D1.
6. Deploy the Worker.
7. Replace documented and operational test URLs with the new Workers URL.

Commands:

```bash
cd apps/api
npx wrangler d1 create yamaha-router-watch-db
npm run d1:migrate:remote
npx wrangler d1 execute yamaha-router-watch-db --remote --command "INSERT OR IGNORE INTO devices (device_id, label, token_hash, enabled) VALUES ('test-rtx1210-001', '検証用 RTX1210', 'test-token', 1);"
npm run deploy
```

Account-specific values must stay out of git:

- `apps/api/wrangler.toml`
- Cloudflare API tokens
- future custom domain route settings when they include account-specific context

## Remaining Work

These are intentionally outside Phase 1:

- Replace MVP plaintext token comparison with secure hash verification.
- Add administrator authentication for read endpoints.
- Add rate limiting.
- Add Resend notification delivery.
- Build Yamaha Lua PoC.
- Build Cloudflare Pages dashboard.

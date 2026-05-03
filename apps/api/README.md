# Yamaha Router Watch API

Cloudflare Workers, Hono, and Cloudflare D1 based API for the Yamaha Router Watch MVP.

## Setup

```bash
npm install
cp wrangler.toml.example wrangler.toml
```

Create a D1 database if needed:

```bash
npx wrangler d1 create yamaha-router-watch-db
```

Copy the returned `database_id` into `wrangler.toml`.

Apply migrations:

```bash
npm run d1:migrate:local
npm run d1:migrate:remote
```

Start the local worker:

```bash
npm run dev
```

Run a type check:

```bash
npm run typecheck
```

## Test Device

Insert this row into local D1 before sending test requests:

```sql
INSERT INTO devices (
  device_id,
  label,
  token_hash,
  enabled
) VALUES (
  'test-rtx1210-001',
  '検証用 RTX1210',
  'test-token',
  1
);
```

For local D1, one option is:

```bash
npx wrangler d1 execute yamaha-router-watch-db --local --command "INSERT INTO devices (device_id, label, token_hash, enabled) VALUES ('test-rtx1210-001', '検証用 RTX1210', 'test-token', 1);"
```

## Local Verification

From the repository root, while `npm run dev` is running:

```bash
bash scripts/send-test-event.sh
bash scripts/send-test-heartbeat.sh
curl http://localhost:8787/api/v1/events
curl http://localhost:8787/api/v1/heartbeats
```

The POST responses should include `event_id` or `heartbeat_id`.

## Remote Deployment

Create the D1 database in the active Cloudflare account:

```bash
npx wrangler d1 create yamaha-router-watch-db
```

Copy the returned `database_id` into `wrangler.toml`, then apply migrations and deploy:

```bash
npm run d1:migrate:remote
npm run deploy
```

Insert the test device into remote D1:

```bash
npx wrangler d1 execute yamaha-router-watch-db --remote --command "INSERT OR IGNORE INTO devices (device_id, label, token_hash, enabled) VALUES ('test-rtx1210-001', '検証用 RTX1210', 'test-token', 1);"
```

Verify the deployed Worker from the repository root:

```bash
API_BASE_URL=https://your-worker-url.example.workers.dev bash scripts/send-test-event.sh
API_BASE_URL=https://your-worker-url.example.workers.dev bash scripts/send-test-heartbeat.sh
curl https://your-worker-url.example.workers.dev/api/v1/events
curl https://your-worker-url.example.workers.dev/api/v1/heartbeats
```

## Recreating Cloudflare Resources

If the service moves to a dedicated Cloudflare account, recreate D1 and Workers from that account instead of reusing the current development account.

Keep these values account-specific:

- `database_id` in `wrangler.toml`
- deployed Workers URL
- Cloudflare API tokens
- future custom domain or route settings

Do not commit `wrangler.toml` after setting account-specific values.

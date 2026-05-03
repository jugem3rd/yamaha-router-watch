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

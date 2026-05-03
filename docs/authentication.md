# Authentication

Phase 2 introduces token-based authentication for device writes and administrator reads.

## Device Authentication

Device write endpoints:

- `POST /api/v1/events`
- `POST /api/v1/heartbeat`

Preferred request header:

```http
Authorization: Bearer <device_token>
```

Compatibility fallback:

```json
{
  "device_id": "test-rtx1210-001",
  "token": "test-token"
}
```

The fallback exists to keep Yamaha Lua PoC work flexible. Prefer the Bearer header when the router firmware supports it.

## Token Storage

`devices.token_hash` stores a SHA-256 hex digest of the device token.

Example for the development token `test-token`:

```text
4c5dc9b7708905f77f5e5d16316b5dfb425e68cb326dcd55a860e90a7707031e
```

Generate a token:

```bash
openssl rand -hex 32
```

Generate its SHA-256 hex digest:

```bash
printf %s "your-device-token" | shasum -a 256
```

Register a device:

```bash
npx wrangler d1 execute yamaha-router-watch-db --remote --command "INSERT INTO devices (device_id, label, token_hash, enabled) VALUES ('device-001', 'Device 001', 'sha256_hex_digest_here', 1);"
```

Rotate a token:

```bash
npx wrangler d1 execute yamaha-router-watch-db --remote --command "UPDATE devices SET token_hash = 'new_sha256_hex_digest_here' WHERE device_id = 'device-001';"
```

Disable a device:

```bash
npx wrangler d1 execute yamaha-router-watch-db --remote --command "UPDATE devices SET enabled = 0 WHERE device_id = 'device-001';"
```

## Administrator Authentication

Read endpoints require an administrator token:

- `GET /api/v1/events`
- `GET /api/v1/heartbeats`

Request header:

```http
Authorization: Bearer <admin_api_token>
```

For local development, `ADMIN_API_TOKEN` may be set in `wrangler.toml` under `[vars]`.

For shared or deployed environments, use an environment-specific token and keep it out of git.

## Remaining Hardening

These items remain future work:

- Timing-safe comparison for secrets.
- Token rotation workflow in the application.
- Request rate limiting.
- Optional HMAC request signing after Yamaha Lua compatibility is verified.

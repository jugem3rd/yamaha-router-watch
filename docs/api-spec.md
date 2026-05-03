# API Spec

Base URL:

```text
http://localhost:8787
```

Production base URLs depend on the deployed Cloudflare Workers route.

## GET /

Health check.

Response:

```json
{
  "name": "yamaha-router-watch-api",
  "status": "ok"
}
```

## POST /api/v1/events

Receives a summarized router event.

Required fields:

- `device_id`
- `event_type`
- `severity`
- `summary`

Authentication:

- Preferred: `Authorization: Bearer <device_token>`
- Compatibility fallback: JSON body `token`

Request:

```json
{
  "device_id": "test-rtx1210-001",
  "token": "test-token",
  "event_type": "vpn_tunnel_down",
  "severity": "warning",
  "target": "tunnel 1",
  "summary": "Tunnel 1 appears down",
  "occurred_at": "2026-04-30T12:00:00+09:00"
}
```

Response:

```json
{
  "ok": true,
  "event_id": 1
}
```

## POST /api/v1/heartbeat

Receives a router heartbeat snapshot.

Required fields:

- `device_id`
- `status`

Authentication:

- Preferred: `Authorization: Bearer <device_token>`
- Compatibility fallback: JSON body `token`

Request:

```json
{
  "device_id": "test-rtx1210-001",
  "token": "test-token",
  "status": "ok",
  "pp_status": "connected",
  "tunnel_summary": "3/3 up",
  "firmware": "Rev.14.01.xx"
}
```

Response:

```json
{
  "ok": true,
  "heartbeat_id": 1
}
```

## GET /api/v1/events

Returns the latest 50 events.

Requires administrator authentication:

```http
Authorization: Bearer <admin_api_token>
```

Response:

```json
{
  "ok": true,
  "events": [
    {
      "id": 1,
      "device_id": "test-rtx1210-001",
      "event_type": "vpn_tunnel_down",
      "severity": "warning",
      "target": "tunnel 1",
      "summary": "Tunnel 1 appears down",
      "occurred_at": "2026-04-30T12:00:00+09:00",
      "source_ip": "203.0.113.10",
      "received_at": "2026-04-30 03:00:01"
    }
  ]
}
```

## GET /api/v1/heartbeats

Returns the latest 50 heartbeats.

Requires administrator authentication:

```http
Authorization: Bearer <admin_api_token>
```

Response:

```json
{
  "ok": true,
  "heartbeats": [
    {
      "id": 1,
      "device_id": "test-rtx1210-001",
      "status": "ok",
      "pp_status": "connected",
      "tunnel_summary": "3/3 up",
      "firmware": "Rev.14.01.xx",
      "source_ip": "203.0.113.10",
      "received_at": "2026-04-30 03:00:01"
    }
  ]
}
```

## Severity

- `info`: normal informational event.
- `warning`: degraded state or condition that may need attention.
- `critical`: outage or security-relevant event that should notify operators.

## Source IP

`source_ip` is observed by Workers from Cloudflare's `CF-Connecting-IP` header and stored as diagnostic metadata. It can help identify WAN IP changes or unexpected uplink paths, but it should not be treated as an authentication factor.

## Authentication

Device write endpoints prefer Bearer token authentication. The body `token` field remains supported as a temporary compatibility path for Yamaha Lua PoC work.

The API stores SHA-256 hex digests in `devices.token_hash`, not plaintext device tokens.

Read endpoints are operator-facing and require `ADMIN_API_TOKEN` via Bearer token.

# Security Policy

## Data Handling

- Do not send raw syslog streams outside the customer environment.
- Do not send full `show config` output.
- Send only summarized events and heartbeat snapshots.
- Avoid payload fields that may contain passwords, pre-shared keys, user secrets, or full internal topology.

## Network Model

- Customer sites do not need inbound port openings.
- Yamaha routers communicate with the API using HTTPS outbound requests only.
- The API should reject disabled or unknown devices.

## Device Authentication

- Each device has a device-specific API token.
- Device write endpoints prefer `Authorization: Bearer <device_token>`.
- The JSON body `token` field remains as a temporary compatibility fallback for Yamaha Lua PoC work.
- `devices.token_hash` stores the SHA-256 hex digest of the device token.
- Before production, consider a stronger password hashing or HMAC-based request signing strategy after Yamaha Lua compatibility is verified.
- Token rotation and revocation should be implemented before customer rollout.

## Administrator Authentication

- `GET /api/v1/events` and `GET /api/v1/heartbeats` require `Authorization: Bearer <admin_api_token>`.
- `ADMIN_API_TOKEN` is an environment-specific secret and must not be committed.
- Customer-facing dashboard authentication is out of scope for the current API MVP.

## Notification Controls

- Notification rules should suppress duplicate alerts for the same ongoing incident.
- Recovery notifications should be paired with abnormal event notifications where possible.
- Rate limits should protect both the API and notification provider.

## Data Retention

- Define retention periods before production.
- Suggested MVP defaults:
  - Events: 90 days.
  - Heartbeats: 30 days.
  - Notifications: 180 days.
- Retention deletion jobs are out of scope for the initial MVP.

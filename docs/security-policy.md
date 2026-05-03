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
- The MVP compares `devices.token_hash` with the request `token` as a temporary placeholder.
- Before production, store only secure token hashes and verify using a timing-safe strategy supported by the Workers runtime.
- Token rotation and revocation should be implemented before customer rollout.

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

# Development Roadmap

## Phase 0: Repository Setup

- Create initial directory structure.
- Add `.gitignore` and `.env.example`.
- Add API, dashboard, docs, and scripts directories.

## Phase 1: Workers API MVP

- Implement health check endpoint.
- Implement event ingestion endpoint.
- Implement heartbeat ingestion endpoint.
- Implement latest event and heartbeat read endpoints.
- Add local send scripts.

## Phase 2: Authentication

- Replace MVP plaintext token comparison with secure token hash verification.
- Add token rotation flow.
- Add request rate limiting.

## Phase 3: Notification

- Add notification rules for critical events.
- Integrate Resend.
- Add duplicate suppression and recovery notifications.

## Phase 4: Dashboard

- Build Cloudflare Pages dashboard.
- Add events, heartbeats, devices, and reports pages.
- Add operator-facing filters and device status summaries.

## Phase 5: Yamaha Lua PoC

- Build Lua script for representative Yamaha models.
- Verify command parsing on real devices.
- Validate retry, timeout, and scheduling behavior.

## Phase 6: Service Packaging

- Define customer onboarding flow.
- Add operational runbooks.
- Finalize data retention policy.
- Prepare service documentation.

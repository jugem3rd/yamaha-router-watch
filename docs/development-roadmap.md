# Development Roadmap

## Phase 0: Repository Setup - Done

- Create initial directory structure.
- Add `.gitignore` and `.env.example`.
- Add API, dashboard, docs, and scripts directories.

## Phase 1: Workers API MVP - Done

- Implement health check endpoint.
- Implement event ingestion endpoint.
- Implement heartbeat ingestion endpoint.
- Implement latest event and heartbeat read endpoints.
- Add local send scripts.
- Add D1 migrations for MVP tables and `source_ip` observation.
- Verify local D1 migration and local Workers API.
- Verify remote D1 migration and deployed Workers API.
- Document Cloudflare resource recreation steps for a future service-dedicated account.

## Phase 2: Authentication - Next

- Replace MVP plaintext token comparison with secure token hash verification.
- Add token rotation flow.
- Add request rate limiting.
- Add administrator authentication for read endpoints.

## Phase 3: Notification - Planned

- Add notification rules for critical events.
- Integrate Resend.
- Add duplicate suppression and recovery notifications.

## Phase 4: Dashboard - Planned

- Build Cloudflare Pages dashboard.
- Add events, heartbeats, devices, and reports pages.
- Add operator-facing filters and device status summaries.

## Phase 5: Yamaha Lua PoC - Planned

- Build Lua script for representative Yamaha models.
- Verify command parsing on real devices.
- Validate retry, timeout, and scheduling behavior.

## Phase 6: Service Packaging - Planned

- Define customer onboarding flow.
- Add operational runbooks.
- Finalize data retention policy.
- Prepare service documentation.

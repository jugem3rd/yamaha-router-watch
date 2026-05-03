# Database Schema

Cloudflare D1 migration file:

```text
apps/api/migrations/0001_init.sql
apps/api/migrations/0002_add_source_ip.sql
```

## Schema

```sql
CREATE TABLE devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL UNIQUE,
  label TEXT,
  token_hash TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  target TEXT,
  summary TEXT NOT NULL,
  occurred_at TEXT,
  source_ip TEXT,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE heartbeats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  status TEXT NOT NULL,
  pp_status TEXT,
  tunnel_summary TEXT,
  firmware TEXT,
  source_ip TEXT,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_device_id ON events(device_id);
CREATE INDEX idx_events_received_at ON events(received_at);
CREATE INDEX idx_heartbeats_device_id ON heartbeats(device_id);
CREATE INDEX idx_heartbeats_received_at ON heartbeats(received_at);
```

`source_ip` is observed from the Cloudflare `CF-Connecting-IP` request header. It is stored as diagnostic metadata, not as authentication data.

## Test Device

```sql
INSERT INTO devices (
  device_id,
  label,
  token_hash,
  enabled
) VALUES (
  'test-rtx1210-001',
  '検証用 RTX1210',
  '4c5dc9b7708905f77f5e5d16316b5dfb425e68cb326dcd55a860e90a7707031e',
  1
);
```

The test `token_hash` above is the SHA-256 hex digest of `test-token`.

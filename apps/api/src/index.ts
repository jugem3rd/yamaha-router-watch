import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  ADMIN_API_TOKEN?: string;
  ALERT_FROM?: string;
  ALERT_TO?: string;
};

type EventPayload = {
  device_id?: unknown;
  token?: unknown;
  event_type?: unknown;
  severity?: unknown;
  target?: unknown;
  summary?: unknown;
  occurred_at?: unknown;
};

type HeartbeatPayload = {
  device_id?: unknown;
  token?: unknown;
  status?: unknown;
  pp_status?: unknown;
  tunnel_summary?: unknown;
  firmware?: unknown;
};

type DeviceRecord = {
  device_id: string;
  token_hash: string;
  enabled: number;
};

type D1WriteResult = D1Result<unknown> & {
  meta?: D1Result<unknown>["meta"] & {
    last_row_id?: number;
  };
};

const app = new Hono<{ Bindings: Bindings }>();

const requiredEventFields = [
  "device_id",
  "event_type",
  "severity",
  "summary"
] as const;

const requiredHeartbeatFields = ["device_id", "status"] as const;

app.get("/", (c) => {
  return c.json({
    name: "yamaha-router-watch-api",
    status: "ok"
  });
});

app.post("/api/v1/events", async (c) => {
  const payload = await readJson<EventPayload>(c.req.raw);
  if (!payload.ok) {
    return c.json({ ok: false, error: payload.error }, 400);
  }

  const validationError = validateRequiredFields(
    payload.value,
    requiredEventFields
  );
  if (validationError) {
    return c.json({ ok: false, error: validationError }, 400);
  }

  const auth = await authenticateDevice(c.env.DB, c.req.raw, payload.value);
  if (!auth.ok) {
    return c.json({ ok: false, error: auth.error }, auth.status);
  }

  const sourceIp = getSourceIp(c.req.raw);

  const result = (await c.env.DB.prepare(
    `INSERT INTO events (
      device_id,
      event_type,
      severity,
      target,
      summary,
      occurred_at,
      source_ip
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      payload.value.device_id,
      payload.value.event_type,
      payload.value.severity,
      asNullableString(payload.value.target),
      payload.value.summary,
      asNullableString(payload.value.occurred_at),
      sourceIp
    )
    .run()) as D1WriteResult;

  return c.json({
    ok: true,
    event_id: result.meta?.last_row_id ?? null
  });
});

app.post("/api/v1/heartbeat", async (c) => {
  const payload = await readJson<HeartbeatPayload>(c.req.raw);
  if (!payload.ok) {
    return c.json({ ok: false, error: payload.error }, 400);
  }

  const validationError = validateRequiredFields(
    payload.value,
    requiredHeartbeatFields
  );
  if (validationError) {
    return c.json({ ok: false, error: validationError }, 400);
  }

  const auth = await authenticateDevice(c.env.DB, c.req.raw, payload.value);
  if (!auth.ok) {
    return c.json({ ok: false, error: auth.error }, auth.status);
  }

  const sourceIp = getSourceIp(c.req.raw);

  const result = (await c.env.DB.prepare(
    `INSERT INTO heartbeats (
      device_id,
      status,
      pp_status,
      tunnel_summary,
      firmware,
      source_ip
    ) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      payload.value.device_id,
      payload.value.status,
      asNullableString(payload.value.pp_status),
      asNullableString(payload.value.tunnel_summary),
      asNullableString(payload.value.firmware),
      sourceIp
    )
    .run()) as D1WriteResult;

  return c.json({
    ok: true,
    heartbeat_id: result.meta?.last_row_id ?? null
  });
});

app.get("/api/v1/events", async (c) => {
  if (!authenticateAdmin(c.env, c.req.raw)) {
    return c.json({ ok: false, error: "invalid_admin_credentials" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT
      id,
      device_id,
      event_type,
      severity,
      target,
      summary,
      occurred_at,
      source_ip,
      received_at
    FROM events
    ORDER BY received_at DESC, id DESC
    LIMIT 50`
  ).all();

  return c.json({
    ok: true,
    events: results
  });
});

app.get("/api/v1/heartbeats", async (c) => {
  if (!authenticateAdmin(c.env, c.req.raw)) {
    return c.json({ ok: false, error: "invalid_admin_credentials" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT
      id,
      device_id,
      status,
      pp_status,
      tunnel_summary,
      firmware,
      source_ip,
      received_at
    FROM heartbeats
    ORDER BY received_at DESC, id DESC
    LIMIT 50`
  ).all();

  return c.json({
    ok: true,
    heartbeats: results
  });
});

app.notFound((c) => {
  return c.json({ ok: false, error: "not_found" }, 404);
});

async function readJson<T>(
  request: Request
): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  try {
    const value = await request.json<T>();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, error: "request_body_must_be_json_object" };
    }

    return { ok: true, value };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}

function validateRequiredFields<T extends Record<string, unknown>>(
  payload: T,
  fields: readonly (keyof T & string)[]
): string | null {
  for (const field of fields) {
    if (typeof payload[field] !== "string" || payload[field].trim() === "") {
      return `missing_or_invalid_${field}`;
    }
  }

  return null;
}

async function authenticateDevice(
  db: D1Database,
  request: Request,
  payload: { device_id?: unknown; token?: unknown }
): Promise<{ ok: true } | { ok: false; status: 401 | 403; error: string }> {
  const token = getBearerToken(request) ?? getBodyToken(payload);

  if (typeof payload.device_id !== "string" || !token) {
    return { ok: false, status: 401, error: "invalid_credentials" };
  }

  const device = await db
    .prepare(
      `SELECT device_id, token_hash, enabled
      FROM devices
      WHERE device_id = ?
      LIMIT 1`
    )
    .bind(payload.device_id)
    .first<DeviceRecord>();

  if (!device) {
    return { ok: false, status: 401, error: "invalid_credentials" };
  }

  if (device.enabled !== 1) {
    return { ok: false, status: 403, error: "device_disabled" };
  }

  const tokenHash = await sha256Hex(token);
  if (device.token_hash !== tokenHash) {
    return { ok: false, status: 401, error: "invalid_credentials" };
  }

  return { ok: true };
}

function authenticateAdmin(env: Bindings, request: Request): boolean {
  const expectedToken = env.ADMIN_API_TOKEN;
  const token = getBearerToken(request);

  if (!expectedToken || !token) {
    return false;
  }

  return token === expectedToken;
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) {
    return null;
  }

  return match[1];
}

function getBodyToken(payload: { token?: unknown }): string | null {
  if (typeof payload.token !== "string") {
    return null;
  }

  const trimmed = payload.token.trim();
  return trimmed === "" ? null : trimmed;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function getSourceIp(request: Request): string | null {
  return request.headers.get("CF-Connecting-IP");
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default app;

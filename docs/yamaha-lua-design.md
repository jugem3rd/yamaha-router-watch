# Yamaha Lua Design

## Purpose

The Yamaha Lua script will run on Yamaha RTX / NVR routers and send compact monitoring data to the Workers API.

The script should detect meaningful state changes and avoid sending raw logs or full configuration output.

## Candidate Commands

- `show status pp`
- `show status tunnel`
- `show ipsec sa`
- `show log`
- `show environment`

## Event Example

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

## Heartbeat Example

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

## Real Device Verification Items

- Confirm HTTPS POST support and TLS compatibility on target firmware.
- Confirm Lua scheduling behavior and retry strategy.
- Confirm command output format differences across RTX / NVR models.
- Confirm how to parse PPPoE, tunnel, and IPsec states robustly.
- Confirm payload size limits and timeout behavior.
- Confirm that no secrets are included in event summaries.

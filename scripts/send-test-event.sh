#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:8787}"
TEST_DEVICE_ID="${TEST_DEVICE_ID:-test-rtx1210-001}"
TEST_DEVICE_TOKEN="${TEST_DEVICE_TOKEN:-test-token}"

curl -sS \
  -X POST "${API_BASE_URL}/api/v1/events" \
  -H "content-type: application/json" \
  -H "authorization: Bearer ${TEST_DEVICE_TOKEN}" \
  --data "{
    \"device_id\": \"${TEST_DEVICE_ID}\",
    \"token\": \"${TEST_DEVICE_TOKEN}\",
    \"event_type\": \"vpn_tunnel_down\",
    \"severity\": \"warning\",
    \"target\": \"tunnel 1\",
    \"summary\": \"Tunnel 1 appears down\",
    \"occurred_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"

printf "\n"

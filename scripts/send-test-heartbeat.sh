#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:8787}"
TEST_DEVICE_ID="${TEST_DEVICE_ID:-test-rtx1210-001}"
TEST_DEVICE_TOKEN="${TEST_DEVICE_TOKEN:-test-token}"

curl -sS \
  -X POST "${API_BASE_URL}/api/v1/heartbeat" \
  -H "content-type: application/json" \
  -H "authorization: Bearer ${TEST_DEVICE_TOKEN}" \
  --data "{
    \"device_id\": \"${TEST_DEVICE_ID}\",
    \"token\": \"${TEST_DEVICE_TOKEN}\",
    \"status\": \"ok\",
    \"pp_status\": \"connected\",
    \"tunnel_summary\": \"3/3 up\",
    \"firmware\": \"Rev.14.01.xx\"
  }"

printf "\n"

#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:8787}"
ADMIN_API_TOKEN="${ADMIN_API_TOKEN:-dev-admin-token}"

curl -sS \
  -H "authorization: Bearer ${ADMIN_API_TOKEN}" \
  "${API_BASE_URL}/api/v1/events"

printf "\n"

#!/usr/bin/env bash
set -euo pipefail
docker compose --profile dev up -d --build
docker compose --profile dev ps

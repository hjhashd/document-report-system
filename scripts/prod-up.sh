#!/usr/bin/env bash
set -euo pipefail
docker compose --profile prod up -d --build
docker compose --profile prod ps

#!/usr/bin/env bash
# Deployment health and readiness check script

echo "=== Running Pre-deployment Readiness Checks ==="

# Check environment file
if [ ! -f .env ]; then
    echo "[!] Warning: .env file missing. Copying from .env.example..."
    cp .env.example .env
fi

echo "[*] Checking Python environment..."
python --version

echo "[*] Checking Docker availability..."
docker --version || echo "[!] Docker is not running"

echo "[✓] Deployment readiness check complete."

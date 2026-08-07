# Track C — DevOps Engineer Workspace

**Owner:** DevOps Engineer  
**Scope:** Containerization, CI/CD pipeline, environment configurations, deployment automation, structured logging, and observability.

---

## 🎯 Primary Responsibilities

1. **Containers**:
   - Manage [`backend/Dockerfile`](file:///d:/Project/AB_talks/backend/Dockerfile) and [`docker-compose.yml`](file:///d:/Project/AB_talks/docker-compose.yml).
2. **CI Pipeline**:
   - Maintain GitHub Actions configuration in [`.github/workflows/ci.yml`](file:///d:/Project/AB_talks/.github/workflows/ci.yml).
3. **Observability**:
   - Monitor container logs and health probes at `/health`.

---

## 🚀 Operations

```bash
# Validate local container build
docker-compose build

# Run deployment readiness verification
bash team/devops_engineer/deploy/deploy_check.sh
```

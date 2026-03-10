# Load Testing — tribai.co

k6 load tests for the tribai.co backend API endpoints.

## Prerequisites

### Install k6

```bash
# macOS
brew install k6

# Windows
choco install k6

# Debian / Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Docker
docker pull grafana/k6
```

Verify installation:

```bash
k6 version
```

## Running the Tests

All commands should be run from the project root (`tribai/`).

### Run all scenarios sequentially

```bash
k6 run tests/load/k6-load-test.js
```

### Run a single scenario

```bash
# Scenario 1: Health check smoke test (50 VUs, 30s)
k6 run tests/load/k6-load-test.js --env SCENARIO=health_smoke

# Scenario 2: Chat endpoint load test (ramp 0->100 VUs, ~7 min)
k6 run tests/load/k6-load-test.js --env SCENARIO=chat_load

# Scenario 3: Mixed load (100 VUs, 3 min, 70/30 split)
k6 run tests/load/k6-load-test.js --env SCENARIO=mixed_load
```

### Override the target URL

By default the test targets the Vercel production deployment. To test against a local or staging environment:

```bash
# Local development server
k6 run tests/load/k6-load-test.js --env BASE_URL=http://localhost:3000

# Staging / preview deployment
k6 run tests/load/k6-load-test.js --env BASE_URL=https://my-preview-url.vercel.app
```

### Export results

```bash
# JSON output
k6 run tests/load/k6-load-test.js --out json=tests/load/results.json

# CSV output
k6 run tests/load/k6-load-test.js --out csv=tests/load/results.csv

# InfluxDB (for Grafana dashboards)
k6 run tests/load/k6-load-test.js --out influxdb=http://localhost:8086/k6
```

## Scenarios

### Scenario 1: Health Check Smoke (`health_smoke`)

| Parameter | Value |
|-----------|-------|
| Virtual Users | 50 |
| Duration | 30 seconds |
| Endpoint | `GET /api/health` |
| p95 threshold | < 500ms |
| Error rate threshold | < 1% |

Validates that the health endpoint responds quickly under moderate load. This is a good first test to run before heavier scenarios.

### Scenario 2: Chat Endpoint Load (`chat_load`)

| Stage | Duration | VUs |
|-------|----------|-----|
| Ramp up | 30s | 0 -> 10 |
| Hold | 1m | 10 |
| Ramp up | 30s | 10 -> 50 |
| Hold | 2m | 50 |
| Ramp up | 30s | 50 -> 100 |
| Hold | 2m | 100 |
| Ramp down | 30s | 100 -> 0 |

| Parameter | Value |
|-----------|-------|
| Endpoint | `POST /api/chat` |
| Body format | `{ "messages": [{ "id": "...", "role": "user", "parts": [{ "type": "text", "text": "..." }] }] }` |
| Question pool | 20 diverse Colombian tax questions (renta, IVA, retencion, UVT, sanciones, etc.) |
| Key metric | Time-to-first-byte (TTFB) since the endpoint streams SSE |
| p95 threshold | < 5000ms (TTFB) |
| Error rate threshold | < 5% (excluding 429 rate-limited responses) |

The chat endpoint uses streaming (SSE), so the most meaningful latency metric is **TTFB** (`http_req_waiting`) rather than total duration. Rate-limited responses (HTTP 429) are tracked separately and are not counted as errors.

### Scenario 3: Mixed Load (`mixed_load`)

| Parameter | Value |
|-----------|-------|
| Virtual Users | 100 |
| Duration | 3 minutes |
| Traffic split | 70% health checks, 30% chat requests |
| p95 threshold | < 3000ms (overall) |
| Error rate threshold | < 5% |

Simulates realistic traffic patterns where most requests are lightweight health/status checks and a smaller fraction are heavier chat/AI requests.

## Interpreting Results

After a test run, k6 prints a summary table. Here is what to focus on:

### Key metrics

| Metric | What it measures | Where to look |
|--------|-----------------|---------------|
| `health_check_duration` | Response time for `/api/health` | `p(95)` should be under 500ms |
| `chat_ttfb` | Time-to-first-byte for `/api/chat` | `p(95)` should be under 5000ms |
| `chat_duration` | Total response time for `/api/chat` | Informational (streaming can be long) |
| `chat_rate_limited` | Count of 429 responses | High counts indicate rate limiter is triggering |
| `health_check_errors` | Error rate for health checks | Should be under 1% |
| `chat_errors` | Error rate for chat (excl. 429) | Should be under 5% |
| `mixed_errors` | Error rate for mixed scenario | Should be under 5% |
| `http_req_duration` | Overall request duration | Global view of all endpoints |
| `http_req_failed` | Overall HTTP failure rate | Should be under 10% |

### Reading the summary output

```
     ✓ health: status is 200
     ✓ health: response time < 500ms
     ✗ chat: TTFB < 5000ms
       ↳  94% — ✓ 940 / ✗ 60

     health_check_duration........: avg=45ms  min=12ms  med=38ms  max=320ms  p(90)=89ms   p(95)=120ms
     chat_ttfb....................: avg=2.1s  min=0.8s  med=1.9s  max=8.2s   p(90)=3.8s   p(95)=4.5s
```

- **Green checkmarks** indicate passing checks.
- **Red crosses** indicate failing checks with the pass/fail ratio shown.
- Threshold violations are highlighted at the bottom of the output.

### What constitutes a passing test

1. All threshold lines show green (no `FAIL` markers).
2. Error rates are within acceptable bounds.
3. No unexpected 5xx server errors.
4. Rate limiting (429) counts are reasonable for the load level.

### Common failure patterns

| Symptom | Likely cause | Action |
|---------|-------------|--------|
| High TTFB on chat | LLM provider latency or RAG pipeline bottleneck | Check Anthropic API status; review pipeline timings in server logs |
| Many 429 responses | Rate limiter threshold too low for test load | Adjust rate limiter config or reduce VUs |
| 5xx errors under load | Server resource exhaustion | Check Vercel function logs; consider increasing `maxDuration` |
| Health check timeouts | Pinecone connection issues | Check Pinecone status; verify circuit breaker state |
| Rising latency over time | Memory leak or connection pool exhaustion | Monitor server metrics during test |

## Recommended Thresholds for Production Readiness

These are the minimum standards the tribai.co backend should meet before a release is considered production-ready:

| Metric | Threshold | Rationale |
|--------|-----------|-----------|
| Health check p95 | < 200ms | Health endpoints should be near-instant |
| Health check error rate | < 0.1% | Health must be highly reliable for monitoring |
| Chat TTFB p50 | < 2000ms | Users expect fast initial response |
| Chat TTFB p95 | < 5000ms | Streaming should start within 5s even under load |
| Chat error rate | < 2% | AI responses should be reliable |
| Mixed load p95 | < 3000ms | Overall system should handle concurrent traffic |
| 5xx error rate | 0% | No server errors under normal load |

### Stretch goals (high performance)

| Metric | Target |
|--------|--------|
| Health check p95 | < 100ms |
| Chat TTFB p50 | < 1500ms |
| Chat TTFB p95 | < 3000ms |
| Zero 429s at 50 VUs | Rate limiter handles moderate load gracefully |

## Tips

- **Start with `health_smoke`** to verify connectivity before running heavier scenarios.
- **Run `chat_load` against staging first** to avoid hitting production rate limits or incurring LLM costs.
- **Monitor Vercel function logs** during tests to correlate k6 metrics with server-side observations.
- **The chat endpoint calls external APIs** (Anthropic, Pinecone), so results depend on those services' availability and latency.
- **Rate limiting is expected** under heavy load. The test tracks 429 responses separately so they do not inflate error rates.
- **Use `--env BASE_URL=http://localhost:3000`** for local testing during development to iterate quickly without affecting production.

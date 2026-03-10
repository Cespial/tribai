// =============================================================================
// tribai.co — k6 Load Test Suite
// =============================================================================
//
// INSTALLATION:
//   brew install k6          (macOS)
//   choco install k6         (Windows)
//   sudo apt install k6      (Debian/Ubuntu via official repo)
//   docker pull grafana/k6   (Docker)
//
// USAGE:
//   # Run all scenarios (default):
//   k6 run tests/load/k6-load-test.js
//
//   # Run a single scenario:
//   k6 run tests/load/k6-load-test.js --env SCENARIO=health_smoke
//   k6 run tests/load/k6-load-test.js --env SCENARIO=chat_load
//   k6 run tests/load/k6-load-test.js --env SCENARIO=mixed_load
//
//   # Override the base URL:
//   k6 run tests/load/k6-load-test.js --env BASE_URL=http://localhost:3000
//
//   # Export results to JSON:
//   k6 run tests/load/k6-load-test.js --out json=results.json
//
//   # Export results to InfluxDB (for Grafana dashboards):
//   k6 run tests/load/k6-load-test.js --out influxdb=http://localhost:8086/k6
//
// ENVIRONMENT VARIABLES:
//   BASE_URL   — Target URL (default: Vercel production)
//   SCENARIO   — Run a single scenario: health_smoke | chat_load | mixed_load
//
// =============================================================================

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL =
  __ENV.BASE_URL || "https://superapp-tributaria-colombia.vercel.app";

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------

// Health check metrics
const healthCheckDuration = new Trend("health_check_duration", true);
const healthCheckErrors = new Rate("health_check_errors");

// Chat endpoint metrics
const chatTTFB = new Trend("chat_ttfb", true);
const chatDuration = new Trend("chat_duration", true);
const chatErrors = new Rate("chat_errors");
const chatRateLimited = new Counter("chat_rate_limited");

// Mixed load metrics
const mixedErrors = new Rate("mixed_errors");

// ---------------------------------------------------------------------------
// Pool of Colombian Tax Questions (Spanish)
// ---------------------------------------------------------------------------

const TAX_QUESTIONS = [
  // Renta (Income Tax)
  "¿Cuáles son los topes de ingresos para declarar renta en 2026 como persona natural?",
  "¿Cómo se calcula la renta líquida gravable para personas naturales según el artículo 241 del ET?",
  "¿Qué deducciones puedo incluir en mi declaración de renta si soy empleado?",

  // IVA (Value Added Tax)
  "¿Cuáles son las tarifas del IVA vigentes en Colombia y qué bienes están excluidos?",
  "¿Cuándo debo presentar la declaración de IVA si soy responsable del régimen común?",
  "¿Qué dice el artículo 437 del Estatuto Tributario sobre los responsables del IVA?",

  // Retención en la fuente (Withholding Tax)
  "¿Cuál es la tabla de retención en la fuente para pagos laborales en 2026?",
  "¿Cómo se calcula la retención en la fuente por honorarios y qué porcentaje aplica?",
  "¿Qué es la autorretención de renta y quiénes están obligados a practicarla?",

  // UVT (Tax Value Unit)
  "¿Cuál es el valor de la UVT para 2026 y cómo se aplica en los cálculos tributarios?",

  // Sanciones (Penalties)
  "¿Cuál es la sanción por extemporaneidad en la declaración de renta según el artículo 641?",
  "¿Qué sanciones aplican por no facturar electrónicamente según la DIAN?",

  // Impuesto al patrimonio (Wealth Tax)
  "¿Quiénes están obligados a pagar el impuesto al patrimonio en 2026 y cuáles son las tarifas?",

  // ICA (Industry and Commerce Tax)
  "¿Cómo funciona el impuesto de industria y comercio ICA y cuáles son las tarifas por actividad económica?",

  // Procedimiento tributario (Tax Procedure)
  "¿Cuáles son los plazos para presentar la declaración de renta de personas naturales en 2026?",
  "¿Cómo puedo corregir una declaración de renta que ya presenté ante la DIAN?",

  // Dividendos (Dividends)
  "¿Cómo tributan los dividendos recibidos por personas naturales residentes en Colombia?",

  // Facturación electrónica (Electronic Invoicing)
  "¿Cuáles son los requisitos para la facturación electrónica según la DIAN?",

  // Doctrina DIAN
  "¿Qué dice la doctrina DIAN sobre los descuentos tributarios por dependientes económicos?",

  // Preguntas complejas / multi-artículo
  "Soy un contador independiente con ingresos de 120 millones anuales. ¿Debo declararme responsable de IVA y cuáles son mis obligaciones tributarias?",
];

// ---------------------------------------------------------------------------
// Helper: Build Chat Request Body
// ---------------------------------------------------------------------------

function buildChatBody(question) {
  return JSON.stringify({
    messages: [
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "user",
        parts: [{ type: "text", text: question }],
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Helper: Pick Random Question
// ---------------------------------------------------------------------------

function randomQuestion() {
  return TAX_QUESTIONS[Math.floor(Math.random() * TAX_QUESTIONS.length)];
}

// ---------------------------------------------------------------------------
// Scenario Functions
// ---------------------------------------------------------------------------

/**
 * Scenario 1: Health Check Smoke Test
 * - 50 VUs for 30 seconds
 * - GET /api/health
 * - Thresholds: p95 < 500ms, error rate < 1%
 */
export function healthSmoke() {
  const res = http.get(`${BASE_URL}/api/health`, {
    tags: { scenario: "health_smoke", endpoint: "health" },
  });

  healthCheckDuration.add(res.timings.duration);

  const passed = check(
    res,
    {
      "health: status is 200": (r) => r.status === 200,
      "health: response has status field": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === "healthy" || body.status === "degraded";
        } catch {
          return false;
        }
      },
      "health: response has timestamp": (r) => {
        try {
          const body = JSON.parse(r.body);
          return !!body.timestamp;
        } catch {
          return false;
        }
      },
      "health: response time < 500ms": (r) => r.timings.duration < 500,
    },
    { scenario: "health_smoke" }
  );

  healthCheckErrors.add(!passed);
  sleep(0.5);
}

/**
 * Scenario 2: Chat Endpoint Load Test
 * - Ramped stages: 0->10->10->50->50->100->100->0
 * - POST /api/chat with realistic Colombian tax questions
 * - Measures TTFB (time-to-first-byte) for SSE streaming
 * - Thresholds: p95 < 5000ms (TTFB), error rate < 5%
 */
export function chatLoad() {
  const question = randomQuestion();
  const payload = buildChatBody(question);

  const res = http.post(`${BASE_URL}/api/chat`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
    tags: { scenario: "chat_load", endpoint: "chat" },
    // For SSE streaming, we measure TTFB via timings.waiting
    // which captures time until the server sends the first byte
    timeout: "60s",
  });

  // TTFB = time-to-first-byte (critical for streaming endpoints)
  chatTTFB.add(res.timings.waiting);
  chatDuration.add(res.timings.duration);

  const is429 = res.status === 429;
  if (is429) {
    chatRateLimited.add(1);
  }

  const passed = check(
    res,
    {
      "chat: status is 200 or 429 (rate limited)": (r) =>
        r.status === 200 || r.status === 429,
      "chat: TTFB < 5000ms": (r) => r.timings.waiting < 5000,
      "chat: response is not empty": (r) => r.body && r.body.length > 0,
      "chat: no server error": (r) => r.status < 500,
    },
    { scenario: "chat_load" }
  );

  // Only count non-429 failures as errors (rate limiting is expected under load)
  chatErrors.add(!passed && !is429);

  // Pace requests to avoid overwhelming rate limiter
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

/**
 * Scenario 3: Concurrent Mixed Load
 * - 70% health checks, 30% chat requests
 * - 100 VUs for 3 minutes
 * - Thresholds: overall p95 < 3000ms
 */
export function mixedLoad() {
  const roll = Math.random();

  if (roll < 0.7) {
    // 70% — Health check
    group("mixed: health check", function () {
      const res = http.get(`${BASE_URL}/api/health`, {
        tags: { scenario: "mixed_load", endpoint: "health" },
      });

      const passed = check(
        res,
        {
          "mixed-health: status is 200": (r) => r.status === 200,
          "mixed-health: response time < 1000ms": (r) =>
            r.timings.duration < 1000,
        },
        { scenario: "mixed_load" }
      );

      mixedErrors.add(!passed);
    });
  } else {
    // 30% — Chat request
    group("mixed: chat request", function () {
      const question = randomQuestion();
      const payload = buildChatBody(question);

      const res = http.post(`${BASE_URL}/api/chat`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        tags: { scenario: "mixed_load", endpoint: "chat" },
        timeout: "60s",
      });

      const is429 = res.status === 429;
      if (is429) {
        chatRateLimited.add(1);
      }

      const passed = check(
        res,
        {
          "mixed-chat: status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
          "mixed-chat: TTFB < 5000ms": (r) => r.timings.waiting < 5000,
          "mixed-chat: no server error": (r) => r.status < 500,
        },
        { scenario: "mixed_load" }
      );

      mixedErrors.add(!passed && !is429);
    });
  }

  sleep(Math.random() * 1.5 + 0.5); // 0.5-2 seconds
}

// ---------------------------------------------------------------------------
// Scenario Definitions & Thresholds
// ---------------------------------------------------------------------------

// Determine which scenarios to run
const selectedScenario = __ENV.SCENARIO || "all";

function buildScenarios() {
  const scenarios = {};

  if (selectedScenario === "all" || selectedScenario === "health_smoke") {
    scenarios.health_smoke = {
      executor: "constant-vus",
      exec: "healthSmoke",
      vus: 50,
      duration: "30s",
      tags: { scenario: "health_smoke" },
      gracefulStop: "10s",
    };
  }

  if (selectedScenario === "all" || selectedScenario === "chat_load") {
    scenarios.chat_load = {
      executor: "ramping-vus",
      exec: "chatLoad",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 10 },   // Ramp up to 10
        { duration: "1m", target: 10 },    // Hold 10
        { duration: "30s", target: 50 },   // Ramp to 50
        { duration: "2m", target: 50 },    // Hold 50
        { duration: "30s", target: 100 },  // Ramp to 100
        { duration: "2m", target: 100 },   // Hold 100
        { duration: "30s", target: 0 },    // Ramp down
      ],
      tags: { scenario: "chat_load" },
      gracefulStop: "30s",
      // Stagger start so health smoke finishes first when running all
      ...(selectedScenario === "all" ? { startTime: "35s" } : {}),
    };
  }

  if (selectedScenario === "all" || selectedScenario === "mixed_load") {
    scenarios.mixed_load = {
      executor: "constant-vus",
      exec: "mixedLoad",
      vus: 100,
      duration: "3m",
      tags: { scenario: "mixed_load" },
      gracefulStop: "15s",
      // Start after chat load when running all scenarios
      ...(selectedScenario === "all" ? { startTime: "8m5s" } : {}),
    };
  }

  return scenarios;
}

export const options = {
  scenarios: buildScenarios(),

  thresholds: {
    // --- Scenario 1: Health Check ---
    "health_check_duration": [
      "p(95)<500",   // p95 response time < 500ms
    ],
    "health_check_errors": [
      "rate<0.01",   // Error rate < 1%
    ],

    // --- Scenario 2: Chat Endpoint ---
    "chat_ttfb": [
      "p(95)<5000",  // p95 TTFB < 5000ms (streaming)
    ],
    "chat_errors": [
      "rate<0.05",   // Error rate < 5% (excluding rate-limited)
    ],

    // --- Scenario 3: Mixed Load ---
    "http_req_duration{scenario:mixed_load}": [
      "p(95)<3000",  // Overall p95 < 3000ms
    ],
    "mixed_errors": [
      "rate<0.05",   // Overall error rate < 5%
    ],

    // --- Global thresholds ---
    "http_req_failed": [
      "rate<0.10",   // Global HTTP failure rate < 10%
    ],
  },

  // Disable TLS certificate verification for local testing
  insecureSkipTLSVerify: false,

  // User-agent for identifying load test traffic in server logs
  userAgent: "k6-tribai-load-test/1.0",
};

// ---------------------------------------------------------------------------
// Setup & Teardown
// ---------------------------------------------------------------------------

export function setup() {
  // Verify the target is reachable before starting the load test
  const res = http.get(`${BASE_URL}/api/health`, {
    tags: { scenario: "setup" },
  });

  const isReachable = check(res, {
    "setup: target is reachable": (r) => r.status === 200,
  });

  if (!isReachable) {
    console.error(
      `Target ${BASE_URL} is not reachable. Health check returned status ${res.status}.`
    );
    console.error("Aborting load test. Verify the BASE_URL and try again.");
    // k6 does not support aborting from setup, but logging the error
    // makes the failure clear in test output.
  }

  console.log(`\n=== tribai.co Load Test ===`);
  console.log(`Target:    ${BASE_URL}`);
  console.log(`Scenario:  ${selectedScenario}`);
  console.log(`Questions: ${TAX_QUESTIONS.length} in pool`);
  console.log(`===========================\n`);

  return { baseUrl: BASE_URL, startTime: new Date().toISOString() };
}

export function teardown(data) {
  console.log(`\n=== Load Test Complete ===`);
  console.log(`Started:  ${data.startTime}`);
  console.log(`Finished: ${new Date().toISOString()}`);
  console.log(`Target:   ${data.baseUrl}`);
  console.log(`==========================\n`);
}

// ---------------------------------------------------------------------------
// Default function (used when no scenario executor is specified)
// ---------------------------------------------------------------------------

export default function () {
  // This runs if k6 is invoked without scenario support.
  // Defaults to a simple health check.
  healthSmoke();
}

# Monitoring Setup -- TribAI

This document covers monitoring for both the web backend (Next.js on Vercel) and the iOS app.

---

## 1. Vercel Analytics (Built-in)

Vercel provides built-in analytics at no extra cost on Pro plans.

### Enable Vercel Web Analytics

1. Go to [Vercel Dashboard](https://vercel.com) -> Project -> Analytics tab
2. Click **Enable Web Analytics**
3. Add the analytics script to the Next.js app:

```bash
npm install @vercel/analytics
```

In `src/app/layout.tsx`, add:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**What it tracks**: Page views, unique visitors, top pages, referrers, countries, devices, browsers. No cookies, GDPR-compliant.

---

## 2. Vercel Speed Insights

### Enable Speed Insights

1. Go to Vercel Dashboard -> Project -> Speed Insights tab
2. Click **Enable Speed Insights**
3. Install the package:

```bash
npm install @vercel/speed-insights
```

In `src/app/layout.tsx`, add:

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**What it tracks**: Real User Metrics (RUM) -- FCP, LCP, CLS, INP, TTFB. Broken down by route, device, and country.

---

## 3. Alert Configuration

### 3.1 Vercel Monitoring Alerts

Vercel provides built-in alerts via **Vercel Monitoring** (available on Pro plan).

1. Go to Vercel Dashboard -> Project -> Settings -> Notifications
2. Configure alerts for:

| Alert | Condition | Channel |
|-------|-----------|---------|
| High Error Rate | Error rate > 5% over 5 min window | Email, Slack |
| Slow API Response | P95 latency > 3000ms on `/api/chat` | Email, Slack |
| Deployment Failed | Any deployment failure | Email, Slack |
| Domain Expiry | Domain certificate issues | Email |

### 3.2 Slack Integration (Recommended)

1. Go to Vercel Dashboard -> Settings -> Integrations
2. Install the **Slack** integration
3. Select your workspace and channel (e.g., `#tribai-alerts`)
4. Enable notifications for: Deployments, Errors, Usage limits

---

## 4. External Uptime Monitoring

The app has a health endpoint at `GET /api/health` that returns:

```json
{
  "status": "healthy",       // or "degraded" when Pinecone circuit breaker trips
  "timestamp": "2026-03-08T..."
}
```

The status changes to `"degraded"` after 5 consecutive Pinecone failures (circuit breaker opens for 30 seconds).

### Option A: UptimeRobot (Free tier available)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add a new monitor:
   - **Type**: HTTP(s) - Keyword
   - **URL**: `https://superapp-tributaria-colombia.vercel.app/api/health`
   - **Keyword**: `healthy`
   - **Keyword Type**: Keyword should exist
   - **Monitoring Interval**: 5 minutes
3. Configure alert contacts: email, Slack webhook, or Telegram
4. Create a second monitor for the main page:
   - **Type**: HTTP(s)
   - **URL**: `https://superapp-tributaria-colombia.vercel.app`
   - **Monitoring Interval**: 5 minutes

### Option B: Better Uptime (Better UI, free tier)

1. Sign up at [betteruptime.com](https://betteruptime.com)
2. Create monitors for:
   - `/api/health` (keyword: `healthy`, every 3 min)
   - `/` (HTTP 200, every 5 min)
   - `/api/chat` (POST check, optional, every 10 min)
3. Set up an **on-call schedule** and **escalation policy**
4. Create a **status page** at `status.tribai.co` (optional but recommended)

### Recommended: UptimeRobot Monitors

| Monitor | URL | Type | Interval | Keyword |
|---------|-----|------|----------|---------|
| Health Check | `/api/health` | Keyword | 3 min | `healthy` |
| Homepage | `/` | HTTP 200 | 5 min | -- |
| Chat API | `/api/chat` | HTTP (POST) | 10 min | -- |

---

## 5. Sentry -- Backend (Next.js)

### Installation

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Install `@sentry/nextjs`
- Create `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Update `next.config.ts` with Sentry webpack plugin
- Create `.env.sentry-build-plugin` for auth token

### Manual Configuration

If the wizard does not run, install manually:

```bash
npm install @sentry/nextjs
```

Create `sentry.server.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions (adjust based on volume)

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Filter out known non-errors
  ignoreErrors: [
    "Pinecone circuit breaker is open",
    "Pinecone operation timed out",
  ],

  // Tag transactions for filtering
  beforeSendTransaction(event) {
    // Tag chat API transactions for separate monitoring
    if (event.transaction?.includes("/api/chat")) {
      event.tags = { ...event.tags, feature: "chat" };
    }
    return event;
  },
});
```

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.05, // 5% client-side
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
```

Update `next.config.ts`:

```typescript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  // existing config...
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "YOUR_SENTRY_ORG",
  project: "tribai-web",
});
```

### Sentry Alerts (Web)

Configure these alerts in the Sentry dashboard (Settings -> Alerts):

| Alert | Condition | Action |
|-------|-----------|--------|
| High Error Volume | > 50 events in 1 hour | Email + Slack |
| New Issue | First occurrence of any error | Email |
| Chat API Errors | Tag `feature:chat`, > 10 events in 15 min | Slack (urgent) |
| P95 Latency Spike | Transaction P95 > 3s for `/api/chat` | Email |
| Unhandled Rejection | > 5 unhandled promise rejections in 30 min | Email |

---

## 6. Sentry -- iOS App (Crash-Free Rate)

The iOS project already includes the Sentry SDK dependency in `project.yml`.

### Configuration

In the app's initialization (e.g., `App.swift` or `AppDelegate`):

```swift
import Sentry

@main
struct SuperAppTributariaApp: App {
    init() {
        SentrySDK.start { options in
            options.dsn = "YOUR_SENTRY_IOS_DSN"
            options.environment = Bundle.main.isDebug ? "debug" : "production"

            // Performance monitoring
            options.tracesSampleRate = 0.1

            // Track app start time
            options.enableAutoPerformanceTracing = true

            // Capture HTTP client errors (API failures)
            options.enableCaptureFailedRequests = true
            options.failedRequestStatusCodes = [
                HttpStatusCodeRange(min: 400, max: 599)
            ]

            // Session tracking for crash-free rate
            options.enableAutoSessionTracking = true
            options.sessionTrackingIntervalMillis = 30000

            // UI performance
            options.enableUIViewControllerTracing = true
            options.enableSwizzling = true

            // Attach screenshots on crashes
            options.attachScreenshot = true

            // Only in production
            options.enabled = !Bundle.main.isDebug
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

private extension Bundle {
    var isDebug: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }
}
```

### iOS Sentry Alerts

| Alert | Condition | Action |
|-------|-----------|--------|
| Crash-Free Rate Drop | < 99% crash-free sessions in 24h | Email + Slack (urgent) |
| New Crash | First occurrence of a crash | Email |
| API Error Spike | > 20 HTTP 5xx errors in 1 hour | Slack |
| ANR (App Not Responding) | > 5 ANR events in 1 hour | Email |

### dSYM Upload (Required for Crash Symbolication)

Add to the Xcode build phases or Fastlane:

```ruby
# In Fastfile, after build_app:
sentry_upload_dsym(
  org_slug: "YOUR_SENTRY_ORG",
  project_slug: "tribai-ios",
  dsym_path: "./build/TribAI.app.dSYM.zip"
)
```

Or configure automatic upload in Xcode:
1. Build Phases -> New Run Script Phase
2. Add: `../scripts/sentry-upload-dsyms.sh` (or use Sentry's build phase script from the SDK docs)

---

## 7. Monitoring Dashboard Summary

### Recommended Stack

| Layer | Tool | Cost | Purpose |
|-------|------|------|---------|
| **Uptime** | UptimeRobot | Free (50 monitors) | Health check, homepage availability |
| **Web Analytics** | Vercel Analytics | Included (Pro) | Page views, visitors, referrers |
| **Performance** | Vercel Speed Insights | Included (Pro) | Core Web Vitals (FCP, LCP, CLS, INP) |
| **Errors (Web)** | Sentry | Free (5K events/mo) | Error tracking, stack traces, alerting |
| **Errors (iOS)** | Sentry | Free (5K events/mo) | Crashes, ANR, crash-free rate |
| **Logs** | Vercel Logs | Included | Runtime logs, function invocations |
| **Cron** | Vercel Cron | Included | `/api/cron/indicadores` runs weekdays at 12:00 UTC |

### Key Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| Uptime | > 99.9% | UptimeRobot |
| Health check response | `"healthy"` | UptimeRobot |
| P95 latency `/api/chat` | < 3,000ms | Sentry / Vercel |
| Error rate (web) | < 5% | Sentry |
| Crash-free rate (iOS) | > 99.5% | Sentry |
| FCP (First Contentful Paint) | < 1.5s | Vercel Speed Insights |
| LCP (Largest Contentful Paint) | < 2.5s | Vercel Speed Insights |
| CLS (Cumulative Layout Shift) | < 0.1 | Vercel Speed Insights |
| Pinecone circuit breaker trips | 0 per day | Health endpoint + logs |

### Quick Health Check Command

Test the health endpoint manually:

```bash
curl -s https://superapp-tributaria-colombia.vercel.app/api/health | python3 -m json.tool
```

Expected output:
```json
{
    "status": "healthy",
    "timestamp": "2026-03-08T12:00:00.000Z"
}
```

---

## 8. Setup Checklist

### Immediate (Before Launch)

- [ ] Enable Vercel Web Analytics (dashboard toggle + `@vercel/analytics`)
- [ ] Enable Vercel Speed Insights (dashboard toggle + `@vercel/speed-insights`)
- [ ] Set up UptimeRobot monitor for `/api/health` (free, 3-min interval)
- [ ] Set up UptimeRobot monitor for `/` (free, 5-min interval)
- [ ] Configure Vercel Slack notifications for deployments and errors

### Within First Week

- [ ] Install Sentry for Next.js backend (`npx @sentry/wizard@latest -i nextjs`)
- [ ] Configure Sentry alerts (high error volume, new issues)
- [ ] Verify Sentry iOS integration is capturing sessions (check crash-free rate dashboard)
- [ ] Set up dSYM upload pipeline for iOS crash symbolication
- [ ] Configure Sentry iOS alerts (crash-free rate < 99%)

### Within First Month

- [ ] Review Vercel Analytics data; identify top pages and optimize
- [ ] Review Speed Insights; fix any Core Web Vitals issues
- [ ] Set up a status page (optional: `status.tribai.co` via Better Uptime)
- [ ] Tune Sentry sample rates based on actual traffic volume
- [ ] Set up weekly monitoring review (15 min) to check dashboards

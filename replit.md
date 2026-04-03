# FireGuard AI

## Overview

Production-grade SaaS fire detection platform — IoT sensor monitoring + ML inference simulation. Built on a pnpm monorepo with a React + Vite frontend and an Express 5 backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/`)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Build**: esbuild (CJS bundle for server)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/fireguard-ai run dev` — run frontend locally

## Backend Architecture (`artifacts/api-server/src/`)

Clean layered architecture — each layer has one responsibility:

```
src/
  routes/         Pure route registration — no logic, just router.get(path, handler)
  controllers/    HTTP layer — parse input, call service, send response
  services/       Business logic and DB queries — no Express types in here
  utils/
    http.ts       parseIntParam(), sendInternalError() — HTTP helpers
    format.ts     Serializers for Sensor, Alert, Activity DB rows → API shapes
  lib/
    logger.ts     Pino logger singleton
```

**Route domains:** sensors, alerts, detection, dashboard, health

## Frontend Architecture (`artifacts/fireguard-ai/src/`)

```
src/
  pages/          Thin page components — import hooks + domain components, render
  components/
    layout/       AppLayout, Sidebar — persistent chrome
    dashboard/    StatCard, SensorGrid, ActivityFeed
    sensors/      SensorCard, TelemetryBar
    alerts/       AlertCard, SeverityBadge
    demo/         SensorInputPanel, DetectionResultDisplay
    ui/           shadcn primitives (auto-generated, don't edit)
  hooks/
    use-live-polling.ts       Dashboard polling (invalidates queries every 5s)
    use-detection-simulator.ts Demo page state + mutation logic
    use-toast.ts              shadcn toast hook
    use-mobile.tsx            Responsive breakpoint hook
  lib/
    constants.ts  Tailwind class maps for fire risk colors, severity badges
    utils.ts      clsx/tailwind-merge helper
  types/          (extends generated schemas if needed)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/sensors` | List all sensors |
| GET | `/api/sensors/:id` | Get sensor by ID |
| POST | `/api/detect` | Run ML fire detection |
| GET | `/api/alerts` | List all alerts |
| POST | `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| GET | `/api/dashboard/summary` | Dashboard KPIs |
| GET | `/api/dashboard/activity` | Recent activity feed |

## Database Schema (`lib/db/src/schema/`)

- `sensors` — IoT sensor units with live telemetry
- `alerts` — Fire detection incidents
- `activity` — Audit/activity feed log

## Coding Standards

- **Services** own all DB queries and business logic — controllers are thin
- **Format helpers** centralize API serialization — never inline `.toISOString()` in routes
- **Named exports** for components, default exports for pages
- **No magic numbers** — sensor thresholds and config live in `lib/constants.ts`
- Never use `console.log` in server code — use `req.log` (request context) or `logger` singleton

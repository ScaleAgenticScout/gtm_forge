# 🔥 GTMForge

**Forge turns messy one-off GTM automations into production-ready, shareable, monitored revenue workflow packages.**

> AI coding tools made every GTM operator a growth engineer. But now companies have a new problem: dozens of fragile, undocumented GTM workflows that only one person understands, silently break, and never become reusable company assets.
>
> **Forge is the missing layer between vibe-coded GTM hacks and production RevOps.**

---

## What Forge does

Paste a messy GTM automation prompt. Forge (the agent) compiles it into a complete, production-grade workflow:

- **Workflow card** — name, purpose, business goal, owner, trigger, persona, human review step, status
- **Data schema** — typed input + output fields
- **Enrichment plan** — Orange Slice + Fiber AI + OpenAI steps
- **Scoring logic** — weighted multi-factor urgency model with formula
- **Sample run** — realistic scored account rows with why-now + next action
- **Health checks** — 10 failure-mode guards so it never silently breaks
- **Monitoring** — last run, rows processed, failed enrichments, status light, suggested fix
- **Runbook** — a real production operating guide
- **Workflow Package** — a portable, GitHub-ready folder your team can own, clone, and improve

## Why we built it

Every GTM team now has a graveyard of clever-but-fragile automations buried in someone's Claude thread or a one-off script. They break quietly, no one documents them, and they never compound into company assets. Forge is the layer that promotes a hack into an owned, monitored, reusable workflow.

## Sponsor stack

| Provider | Role in Forge |
|----------|---------------|
| **OpenAI** | Workflow compiler / reasoning layer (extracts structure, scoring, alerts) |
| **Orange Slice** | GTM enrichment / agentic spreadsheet layer (account/firmographic enrichment) |
| **Fiber AI** | Fresh company, people, and hiring data (open roles, leadership, signal recency) |
| **Convex** | Workflow state, run history, health checks, monitoring memory |
| **Cursor / Claude Code** | The agentic development workflow used to build this app |

Each integration returns a uniform envelope:

```ts
{ provider: string, source: "live" | "mock" | "simulated", status: "success" | "fallback" | "error", data: any }
```

Integration files live in [`lib/integrations/`](lib/integrations):
[`openai.ts`](lib/integrations/openai.ts) · [`orangeSlice.ts`](lib/integrations/orangeSlice.ts) · [`fiber.ts`](lib/integrations/fiber.ts) · [`convexState.ts`](lib/integrations/convexState.ts)

## Environment variables

All optional — **the app runs fully on high-quality mock data with zero keys.** Copy `.env.example` to `.env` and fill in what you have.

```bash
OPENAI_API_KEY=            # OpenAI workflow compiler / reasoning
ORANGE_SLICE_API_KEY=      # Orange Slice GTM enrichment
FIBER_API_KEY=             # Fiber AI fresh hiring/company data
CONVEX_DEPLOYMENT=         # Convex (optional)
NEXT_PUBLIC_CONVEX_URL=    # Convex (optional)
USE_LIVE_ENRICHMENT=false  # master switch for Orange Slice + Fiber live calls
```

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

## How live / mock fallback works

- **OpenAI** runs live if `OPENAI_API_KEY` is set; the model's JSON is merged over a complete mock skeleton so the UI never sees a hole. No key → mock.
- **Orange Slice** and **Fiber AI** run live only if `USE_LIVE_ENRICHMENT=true` **and** their key is set. Any failure (timeout, non-200, parse error) silently degrades to mock.
- **Convex** persists run state when `NEXT_PUBLIC_CONVEX_URL` / `CONVEX_DEPLOYMENT` is set; otherwise a Convex-style in-memory state abstraction runs as `simulated`. The plug-in point is marked in [`convexState.ts`](lib/integrations/convexState.ts).
- **A failed live API never breaks the demo.** Each provider shows a badge: `live`, `mock fallback`, or `simulated`.

## What the workflow package contains

`Workflow Package` tab → file tree + click-to-preview + **Export GitHub-ready Folder**:

```
revops-hiring-signal-workflow/
├── README.md            # human overview, owner, trigger, how to run/adapt
├── workflow.json        # structured workflow definition
├── schema.json          # input/output schema
├── prompts/
│   ├── system-prompt.md     # main agent instruction
│   ├── scoring-prompt.md    # account scoring logic
│   └── slack-alert-prompt.md# AE-ready alert generation
├── runbook.md           # production operating guide
├── health-checks.md     # monitoring + failure-mode checklist
├── sample-run.csv       # example account rows + outputs
├── integrations.md      # Orange Slice / Fiber / OpenAI / Convex notes
└── monitoring.json      # run status, last run, failed enrichments, next run
```

> Now this is no longer a one-off GTM hack in someone's Claude thread. It is a production workflow asset your team can own, monitor, clone, and improve.

---

## 3-minute demo script

**Opening**
> "AI coding tools made every GTM operator a growth engineer. But now companies have a new problem: dozens of fragile GTM hacks that only one person understands, silently break, and never become reusable company assets."

**Product**
> "We built Forge. It turns messy one-off GTM automations into production-ready, shareable, monitored revenue workflow packages."

**Demo**
> "I'll paste a messy GTM workflow." → click **Forge Workflow** → narrate the live build log:
> "Forge extracts the GTM logic, defines the schema, plans enrichment with Orange Slice and Fiber, uses OpenAI to reason through scoring and next actions, saves workflow state through Convex-style monitoring, and packages the whole thing into a GitHub-ready workflow folder."
>
> Walk the right-panel tabs: **Sample Run** (scored accounts + why-now), **Health Checks** (10 guards), **Monitoring** (Yellow status + suggested fix), then **Workflow Package** → click files → **Export GitHub-ready Folder**.
> "Now this is no longer a one-off GTM hack in someone's Claude thread. It is a production workflow asset your team can own, monitor, clone, and improve."

**Close**
> "The future of GTM is not more disconnected tools. It is compounding workflows that detect signal, execute, package, monitor, and do not silently break."

---

## Tech

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · API routes for provider calls · Convex-style state abstraction.

## Reliability notes

- Works with **no API keys** (full mock path).
- Live API failures **never** crash the demo — they fall back with a visible badge.
- No auth, no marketplace, no real Slack sending, no complex editor. Polished demo path first.

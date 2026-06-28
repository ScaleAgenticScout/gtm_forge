import type {
  ForgedWorkflow,
  SampleRow,
  PackageFile,
} from "./types";

// ---------------------------------------------------------------------------
// Mock enrichment payloads (used by integration mock fallbacks)
// ---------------------------------------------------------------------------

export const mockOrangeSliceData = {
  enrichedAccounts: 24,
  fields: ["industry", "employee_count", "tech_stack", "funding_stage", "crm_owner"],
  sample: [
    { company: "Clay", industry: "GTM Software", employees: 180, stage: "Series B", techStack: ["Salesforce", "Outreach", "dbt"] },
    { company: "Vanta", industry: "Security & Compliance", employees: 900, stage: "Series C", techStack: ["Salesforce", "Gong", "Census"] },
    { company: "Census", industry: "Data Activation", employees: 160, stage: "Series B", techStack: ["HubSpot", "Snowflake"] },
  ],
};

export const mockFiberData = {
  freshAsOf: "2026-06-28",
  companies: 24,
  signals: [
    { company: "Clay", openRoles: ["RevOps Manager", "GTM Engineer"], leader: "VP Revenue", postedDaysAgo: 4 },
    { company: "Vanta", openRoles: ["Head of Sales Ops", "RevOps Manager"], leader: "CRO", postedDaysAgo: 6 },
    { company: "Census", openRoles: ["Salesforce Admin", "RevOps Analyst"], leader: "VP RevOps", postedDaysAgo: 9 },
    { company: "Hex", openRoles: ["VP Sales", "Sales Ops Manager"], leader: "VP Sales", postedDaysAgo: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Sample run rows
// ---------------------------------------------------------------------------

export const mockSampleRun: SampleRow[] = [
  {
    company: "Clay",
    signal: "Hiring RevOps Manager + GTM Engineer",
    score: 91,
    buyer: "VP Revenue",
    whyNow: "Scaling GTM ops — two ops roles open in one week signals tooling buildout",
    nextAction: "Send AE Slack brief",
    source: "mock",
  },
  {
    company: "Vanta",
    signal: "New Head of Sales Ops + RevOps Manager role open",
    score: 86,
    buyer: "CRO",
    whyNow: "Building outbound infrastructure at scale under new RevOps leadership",
    nextAction: "Ask for warm intro via investor network",
    source: "mock",
  },
  {
    company: "Census",
    signal: "Salesforce admin + RevOps Analyst hire",
    score: 79,
    buyer: "VP RevOps",
    whyNow: "Consolidating a fragmented GTM stack — active tooling evaluation window",
    nextAction: "Send workflow teardown",
    source: "mock",
  },
  {
    company: "Hex",
    signal: "New VP Sales + open Sales Ops role",
    score: 82,
    buyer: "VP Sales",
    whyNow: "Scaling sales process — new leader will re-tool within 90 days",
    nextAction: "Send account workflow brief",
    source: "mock",
  },
  {
    company: "Retool",
    signal: "GTM Engineer + Marketing Ops hire",
    score: 74,
    buyer: "Head of Growth",
    whyNow: "Investing in lifecycle automation — early signal, nurture motion",
    nextAction: "Add to nurture + monitor",
    source: "mock",
  },
];

// ---------------------------------------------------------------------------
// Package files (realistic generated content)
// ---------------------------------------------------------------------------

const PKG = "revops-hiring-signal-workflow";

const readmeMd = `# RevOps Hiring Signal Workflow

> Production GTM workflow forged by **GTMForge**.
> Detects B2B SaaS companies hiring RevOps / GTM Engineers, enriches the buying
> committee, scores urgency, and ships AE-ready Slack alerts — with monitoring
> so it never silently breaks.

## Owner
RevOps (primary) · GTM Engineering (maintainer)

## Trigger
Scheduled — daily at 09:00 AM. Can also run on-demand.

## How to run
1. Set provider keys in \`.env\` (see \`integrations.md\`). All providers fall back to
   high-quality mock data if a key is missing.
2. \`npm run workflow:run\` (or trigger from the GTMForge dashboard).
3. Outputs land as Slack alerts + a run row in monitoring state.

## How to adapt
- Change the ICP filter in \`workflow.json > inputs.filters\`.
- Tune scoring weights in \`prompts/scoring-prompt.md\`.
- Swap the output channel in \`workflow.json > outputs.channel\`.

## What it produces
AE-ready briefs: **why now**, **buyer**, **pain hypothesis**, **next action**.
`;

const workflowJson = `{
  "id": "${PKG}",
  "name": "RevOps Hiring Signal Workflow",
  "version": "1.0.0",
  "owner": "RevOps",
  "trigger": { "type": "schedule", "cron": "0 9 * * *", "timezone": "America/Los_Angeles" },
  "inputs": {
    "source": "fiber.hiring_signals",
    "filters": {
      "industry": ["B2B SaaS"],
      "roles": ["RevOps", "GTM Engineer", "Sales Ops", "Head of Sales"],
      "posted_within_days": 14
    }
  },
  "steps": [
    { "id": "enrich_company", "provider": "orange_slice", "op": "account.enrich" },
    { "id": "enrich_people", "provider": "fiber", "op": "people.fresh" },
    { "id": "score", "provider": "openai", "op": "reason.score", "prompt": "prompts/scoring-prompt.md" },
    { "id": "alert", "provider": "openai", "op": "generate.alert", "prompt": "prompts/slack-alert-prompt.md" },
    { "id": "human_review", "type": "approval", "assignee": "RevOps", "threshold": 70 }
  ],
  "outputs": { "channel": "slack:#ae-signals", "schema": "schema.json#/output" },
  "monitoring": { "state": "convex", "health_checks": "health-checks.md" }
}
`;

const schemaJson = `{
  "input": {
    "type": "object",
    "required": ["company_name", "website", "hiring_signal"],
    "properties": {
      "company_name": { "type": "string" },
      "website": { "type": "string", "format": "uri" },
      "industry": { "type": "string" },
      "hiring_signal": { "type": "string" },
      "target_persona": { "type": "string" },
      "existing_crm_owner": { "type": "string" }
    }
  },
  "output": {
    "type": "object",
    "properties": {
      "company": { "type": "string" },
      "score": { "type": "integer", "minimum": 0, "maximum": 100 },
      "buyer": { "type": "string" },
      "why_now": { "type": "string" },
      "pain_hypothesis": { "type": "string" },
      "next_action": { "type": "string" },
      "provider_source": { "type": "string", "enum": ["live", "mock", "simulated"] }
    }
  }
}
`;

const systemPromptMd = `# System Prompt — Forge GTM Agent

You are **Forge**, an AI Growth Engineer operating a production RevOps workflow.

Your job: turn fresh hiring + firmographic signals into AE-ready account briefs.

Rules:
- Be specific. Cite the signal that triggered the alert.
- Never fabricate a buyer. If the buyer is unknown, say so and lower confidence.
- Output must match \`schema.json#/output\` exactly.
- Optimize for "would an AE act on this today?"
- Prefer precision over volume. A noisy alert erodes trust in the workflow.
`;

const scoringPromptMd = `# Scoring Prompt

Score each account 0–100 for outbound urgency. Weighted factors:

| Factor            | Weight | Signal |
|-------------------|--------|--------|
| ICP fit           | 0.25   | Industry, size, stage match the ideal customer profile |
| Hiring urgency    | 0.25   | Number + recency of relevant open GTM roles |
| GTM complexity    | 0.20   | Stack fragmentation, multiple ops tools, scaling motion |
| Buyer relevance   | 0.20   | Identified economic buyer for our solution |
| Signal confidence | 0.10   | Freshness + corroboration across providers |

Formula:
\`score = round(100 * (0.25*icp + 0.25*urgency + 0.20*complexity + 0.20*buyer + 0.10*confidence))\`

Output integer score + one-line justification per factor.
`;

const slackAlertPromptMd = `# Slack Alert Prompt

Generate an AE-ready Slack brief. Format:

\`\`\`
:rotating_light: *{company}* — Score {score}/100
*Why now:* {why_now}
*Buyer:* {buyer}
*Pain hypothesis:* {pain_hypothesis}
*Next action:* {next_action}
_Source: {provider_source} · workflow v{version}_
\`\`\`

Keep it under 60 words. Lead with the signal. Make the next action concrete and
ownable by a single AE.
`;

const runbookMd = `# Runbook — RevOps Hiring Signal Workflow

## What this workflow does
Finds B2B SaaS companies hiring RevOps / GTM Engineers, enriches the buying
committee, scores urgency, and posts AE-ready Slack alerts.

## When it runs
Daily at 09:00 AM PT (cron \`0 9 * * *\`). On-demand runs allowed.

## Who owns it
RevOps owns outcomes. GTM Engineering maintains the code + prompts.

## What data it needs
Fiber hiring signals → Orange Slice account enrichment → OpenAI scoring.
Keys optional; each provider falls back to mock data.

## What can break
- Provider rate limits / expired keys → fallback engages (visible in monitoring).
- Stale Fiber data (>7 days) → stale-data health check warns.
- Empty buyer field → missing-buyer check warns; row held from Slack.

## How to review outputs
RevOps approves any account scored ≥ 70 before the Slack alert fires (human
review step). Spot-check 3 alerts/day for quality.

## How to clone / adapt
Copy this package folder, change \`workflow.json > inputs.filters\` and the
scoring weights. Re-run. The schema and monitoring carry over.

## What to do when enrichment fails
Retry Fiber enrichment; if it fails twice, fall back to Orange Slice contact
enrichment. Both failing → workflow flips to Yellow and pings the owner.

## What to do when output quality drops
Scoring drift check compares this run's score distribution to the trailing
7-run baseline. If drift > 15%, re-tune \`prompts/scoring-prompt.md\` and
re-baseline.
`;

const healthChecksMd = `# Health Checks

| Check | What it verifies |
|-------|------------------|
| API key present | At least one live provider key configured (else mock mode) |
| Enrichment success rate | ≥ 90% of rows enriched successfully |
| Stale data check | Fiber data freshness within 7 days |
| Missing buyer check | Every alerted row has an identified buyer |
| Empty output check | Run produced ≥ 1 scored row |
| Scoring drift check | Score distribution within 15% of baseline |
| Slack alert delivery check | Alerts posted to #ae-signals without error |
| Owner assigned check | Workflow has an accountable owner |
| Schedule configured check | Valid cron trigger present |
| Fallback provider available | A mock/alternate provider is reachable |
`;

const sampleRunCsv = `company,signal,score,buyer,why_now,next_action,source
Clay,Hiring RevOps Manager + GTM Engineer,91,VP Revenue,Scaling GTM ops,Send AE Slack brief,mock
Vanta,New Head of Sales Ops + RevOps Manager role,86,CRO,Building outbound infra,Ask for warm intro,mock
Census,Salesforce admin + RevOps Analyst hire,79,VP RevOps,Consolidating GTM stack,Send workflow teardown,mock
Hex,New VP Sales + Sales Ops role,82,VP Sales,Scaling sales process,Send account workflow brief,mock
Retool,GTM Engineer + Marketing Ops hire,74,Head of Growth,Investing in lifecycle automation,Add to nurture + monitor,mock
`;

const integrationsMd = `# Integrations

| Provider | Role | Mode | Notes |
|----------|------|------|-------|
| **Orange Slice** | GTM enrichment / agentic spreadsheet layer | live if \`ORANGE_SLICE_API_KEY\` set | account/firmographic enrichment, CRM owner lookup |
| **Fiber AI** | Fresh company, people & hiring data | live if \`FIBER_API_KEY\` set | open roles, leadership, signal recency |
| **OpenAI** | Workflow compiler / reasoning + scoring | live if \`OPENAI_API_KEY\` set | scoring logic, alert generation, schema extraction |
| **Convex** | Workflow state, run history, health, monitoring | live if \`NEXT_PUBLIC_CONVEX_URL\` set | persists runs; simulated in-memory otherwise |

Every integration returns:
\`\`\`json
{ "provider": "...", "source": "live|mock|simulated", "status": "success|fallback|error", "data": {} }
\`\`\`
A failed live call never breaks the workflow — it degrades to mock data and the
UI shows a "mock fallback" badge. Toggle live enrichment with
\`USE_LIVE_ENRICHMENT=true\`.
`;

const monitoringJson = `{
  "last_run": "2026-06-28T08:58:00-07:00",
  "last_run_relative": "2 minutes ago",
  "rows_processed": 24,
  "failed_enrichments": 2,
  "status": "Yellow",
  "suggested_fix": "Retry Fiber enrichment or fall back to Orange Slice contact enrichment.",
  "next_scheduled_run": "2026-06-29T09:00:00-07:00",
  "owner": "RevOps",
  "version": "1.0.0"
}
`;

export const mockPackageFiles: PackageFile[] = [
  { path: `${PKG}/README.md`, language: "markdown", content: readmeMd },
  { path: `${PKG}/workflow.json`, language: "json", content: workflowJson },
  { path: `${PKG}/schema.json`, language: "json", content: schemaJson },
  { path: `${PKG}/prompts/system-prompt.md`, language: "markdown", content: systemPromptMd },
  { path: `${PKG}/prompts/scoring-prompt.md`, language: "markdown", content: scoringPromptMd },
  { path: `${PKG}/prompts/slack-alert-prompt.md`, language: "markdown", content: slackAlertPromptMd },
  { path: `${PKG}/runbook.md`, language: "markdown", content: runbookMd },
  { path: `${PKG}/health-checks.md`, language: "markdown", content: healthChecksMd },
  { path: `${PKG}/sample-run.csv`, language: "csv", content: sampleRunCsv },
  { path: `${PKG}/integrations.md`, language: "markdown", content: integrationsMd },
  { path: `${PKG}/monitoring.json`, language: "json", content: monitoringJson },
];

// ---------------------------------------------------------------------------
// Full forged workflow (mock) — the canonical demo payload
// ---------------------------------------------------------------------------

export function buildMockWorkflow(): ForgedWorkflow {
  return {
    workflowCard: {
      name: "RevOps Hiring Signal Workflow",
      purpose:
        "Detect B2B SaaS companies hiring RevOps / GTM Engineers and ship AE-ready Slack alerts.",
      businessGoal:
        "Generate qualified outbound pipeline from real-time GTM hiring signals.",
      owner: "RevOps",
      trigger: "Scheduled — daily 09:00 AM PT (on-demand enabled)",
      targetPersona: "VP Revenue / RevOps / CRO at scaling B2B SaaS",
      humanReviewStep: "RevOps approves accounts scored ≥ 70 before Slack alert fires",
      status: "Production-ready",
    },
    inputSchema: {
      fields: [
        { field: "company_name", type: "string", required: true, description: "Account name" },
        { field: "website", type: "string", required: true, description: "Primary domain" },
        { field: "industry", type: "string", required: false, description: "Vertical / segment" },
        { field: "hiring_signal", type: "string", required: true, description: "Triggering open role(s)" },
        { field: "target_persona", type: "string", required: false, description: "Buyer persona to enrich" },
        { field: "existing_crm_owner", type: "string", required: false, description: "Current account owner in CRM" },
      ],
    },
    outputSchema: {
      fields: [
        { field: "company", type: "string", required: true, description: "Account name" },
        { field: "score", type: "integer", required: true, description: "Urgency score 0–100" },
        { field: "buyer", type: "string", required: true, description: "Identified economic buyer" },
        { field: "why_now", type: "string", required: true, description: "Timing rationale" },
        { field: "pain_hypothesis", type: "string", required: true, description: "Hypothesized pain" },
        { field: "next_action", type: "string", required: true, description: "Concrete AE next step" },
        { field: "provider_source", type: "string", required: true, description: "live | mock | simulated" },
      ],
    },
    enrichmentPlan: [
      { provider: "Orange Slice", role: "Account enrichment", detail: "Firmographics, tech stack, funding stage, CRM owner lookup" },
      { provider: "Fiber AI", role: "Fresh people + hiring data", detail: "Open GTM roles, leadership, signal recency (fresh as of today)" },
      { provider: "OpenAI", role: "Signal interpretation + scoring", detail: "Reason over signals, score urgency, draft AE alert" },
    ],
    scoringLogic: {
      model: "Weighted multi-factor urgency score (0–100)",
      factors: [
        { factor: "ICP fit", weight: 0.25, description: "Industry, size, stage match ideal customer profile" },
        { factor: "Hiring urgency", weight: 0.25, description: "Count + recency of relevant open GTM roles" },
        { factor: "GTM complexity", weight: 0.2, description: "Stack fragmentation + scaling motion" },
        { factor: "Buyer relevance", weight: 0.2, description: "Identified economic buyer present" },
        { factor: "Signal confidence", weight: 0.1, description: "Freshness + cross-provider corroboration" },
      ],
      formula:
        "score = round(100 * (0.25·icp + 0.25·urgency + 0.20·complexity + 0.20·buyer + 0.10·confidence))",
    },
    sampleRun: mockSampleRun,
    healthChecks: [
      { name: "API key present", state: "warn", detail: "No live keys — running in mock mode" },
      { name: "Enrichment success rate", state: "pass", detail: "92% (22/24 rows enriched)" },
      { name: "Stale data check", state: "pass", detail: "Fiber data fresh as of today" },
      { name: "Missing buyer check", state: "pass", detail: "All alerted rows have a buyer" },
      { name: "Empty output check", state: "pass", detail: "5 scored rows produced" },
      { name: "Scoring drift check", state: "pass", detail: "Within 6% of 7-run baseline" },
      { name: "Slack alert delivery check", state: "warn", detail: "Dry-run mode — no live send configured" },
      { name: "Owner assigned check", state: "pass", detail: "Owner: RevOps" },
      { name: "Schedule configured check", state: "pass", detail: "Cron 0 9 * * * (PT)" },
      { name: "Fallback provider available", state: "pass", detail: "Mock fallback reachable for all providers" },
    ],
    monitoring: {
      lastRun: "2 minutes ago",
      rowsProcessed: 24,
      failedEnrichments: 2,
      status: "Yellow",
      suggestedFix: "Retry Fiber enrichment or fall back to Orange Slice contact enrichment.",
      nextScheduledRun: "Tomorrow 9:00 AM PT",
      owner: "RevOps",
      version: "v1.0",
    },
    runbook: runbookMd,
    packageFiles: mockPackageFiles,
  };
}

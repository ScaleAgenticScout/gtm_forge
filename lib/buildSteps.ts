// The animated Forge build sequence shown in the middle panel.

export interface BuildStep {
  label: string;
  provider?: "OpenAI" | "Orange Slice" | "Fiber AI" | "Convex";
}

export const BUILD_STEPS: BuildStep[] = [
  { label: "Parsing messy GTM workflow", provider: "OpenAI" },
  { label: "Detecting business goal", provider: "OpenAI" },
  { label: "Mapping trigger and input schema", provider: "OpenAI" },
  { label: "Identifying custom GTM signals", provider: "OpenAI" },
  { label: "Planning Orange Slice enrichment", provider: "Orange Slice" },
  { label: "Pulling fresh company/person data from Fiber", provider: "Fiber AI" },
  { label: "Compiling scoring logic with OpenAI", provider: "OpenAI" },
  { label: "Creating output schema", provider: "OpenAI" },
  { label: "Adding human review step" },
  { label: "Adding failure modes and health checks" },
  { label: "Generating runbook" },
  { label: "Running sample workflow" },
  { label: "Saving workflow state / run history", provider: "Convex" },
  { label: "Packaging workflow folder" },
  { label: "Preparing GitHub-ready workflow package" },
];

export const DEFAULT_PROMPT =
  "Find B2B SaaS companies hiring RevOps or GTM Engineers, enrich VP Sales / RevOps leaders, score urgency based on hiring signals and GTM complexity, then generate AE-ready Slack alerts with why now, buyer, pain hypothesis, and next action. Add monitoring so the workflow does not silently break.";

// Shared types for GTMForge.

export type Source = "live" | "mock" | "simulated";
export type ProviderStatus = "success" | "fallback" | "error";

/** Uniform envelope returned by every sponsor integration. */
export interface IntegrationResult<T = unknown> {
  provider: string;
  source: Source;
  status: ProviderStatus;
  data: T;
}

export interface WorkflowCard {
  name: string;
  purpose: string;
  businessGoal: string;
  owner: string;
  trigger: string;
  targetPersona: string;
  humanReviewStep: string;
  status: string;
}

export interface SchemaField {
  field: string;
  type: string;
  required: boolean;
  description: string;
}

export interface InputSchema {
  fields: SchemaField[];
}

export interface OutputSchema {
  fields: SchemaField[];
}

export interface EnrichmentStep {
  provider: "Orange Slice" | "Fiber AI" | "OpenAI" | string;
  role: string;
  detail: string;
}

export interface ScoringFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface ScoringLogic {
  model: string;
  factors: ScoringFactor[];
  formula: string;
}

export interface SampleRow {
  company: string;
  signal: string;
  score: number;
  buyer: string;
  whyNow: string;
  nextAction: string;
  source: Source;
}

export type HealthState = "pass" | "warn" | "fail";

export interface HealthCheck {
  name: string;
  state: HealthState;
  detail: string;
}

export interface Monitoring {
  lastRun: string;
  rowsProcessed: number;
  failedEnrichments: number;
  status: "Green" | "Yellow" | "Red";
  suggestedFix: string;
  nextScheduledRun: string;
  owner: string;
  version: string;
}

export interface PackageFile {
  path: string;
  language: string;
  content: string;
}

/** Full forged workflow returned by the /api/forge route. */
export interface ForgedWorkflow {
  workflowCard: WorkflowCard;
  inputSchema: InputSchema;
  outputSchema: OutputSchema;
  enrichmentPlan: EnrichmentStep[];
  scoringLogic: ScoringLogic;
  sampleRun: SampleRow[];
  healthChecks: HealthCheck[];
  monitoring: Monitoring;
  runbook: string;
  packageFiles: PackageFile[];
}

/** Provider badge state surfaced to the build log UI. */
export interface ProviderBadge {
  provider: string;
  source: Source;
  status: ProviderStatus;
  role: string;
}

export interface ForgeResponse {
  workflow: ForgedWorkflow;
  providers: ProviderBadge[];
}

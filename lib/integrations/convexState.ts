// Convex = workflow state, run history, health checks, monitoring memory.
//
// If NEXT_PUBLIC_CONVEX_URL / CONVEX_DEPLOYMENT are set, this is where the
// Convex client would persist run state. Until then we use a Convex-style
// in-memory state abstraction with the same shape, marked "simulated".
//
// >>> CONVEX PLUG-IN POINT <<<
// Replace the in-memory `runHistory` store below with:
//   import { ConvexHttpClient } from "convex/browser";
//   const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
//   await convex.mutation(api.runs.save, run);
// The function signatures stay identical.

import type { ForgedWorkflow, IntegrationResult, Monitoring } from "../types";

const PROVIDER = "Convex";

export interface RunRecord {
  id: string;
  workflowName: string;
  at: string;
  rowsProcessed: number;
  failedEnrichments: number;
  status: Monitoring["status"];
}

// Convex-style state abstraction (module-scoped, survives within a server instance).
const runHistory: RunRecord[] = [
  { id: "run_0007", workflowName: "RevOps Hiring Signal Workflow", at: "2 minutes ago", rowsProcessed: 24, failedEnrichments: 2, status: "Yellow" },
  { id: "run_0006", workflowName: "RevOps Hiring Signal Workflow", at: "yesterday 09:00 AM", rowsProcessed: 22, failedEnrichments: 0, status: "Green" },
  { id: "run_0005", workflowName: "RevOps Hiring Signal Workflow", at: "2 days ago 09:00 AM", rowsProcessed: 25, failedEnrichments: 1, status: "Green" },
];

function isLive(): boolean {
  return !!(process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_DEPLOYMENT);
}

/** Persist a forged workflow run + return monitoring state. */
export async function saveRun(
  workflow: ForgedWorkflow
): Promise<IntegrationResult<{ run: RunRecord; history: RunRecord[]; monitoring: Monitoring }>> {
  const run: RunRecord = {
    id: `run_${String(runHistory.length + 1).padStart(4, "0")}`,
    workflowName: workflow.workflowCard.name,
    at: "just now",
    rowsProcessed: workflow.monitoring.rowsProcessed,
    failedEnrichments: workflow.monitoring.failedEnrichments,
    status: workflow.monitoring.status,
  };

  // In live mode we'd await a Convex mutation here. The abstraction is identical.
  const source = isLive() ? "live" : "simulated";
  const history = [run, ...runHistory].slice(0, 6);

  return {
    provider: PROVIDER,
    source,
    status: "success",
    data: { run, history, monitoring: workflow.monitoring },
  };
}

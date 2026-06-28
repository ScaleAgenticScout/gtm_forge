// OpenAI = workflow compiler / reasoning layer.
// Turns the messy GTM prompt into a structured ForgedWorkflow.
// Live if OPENAI_API_KEY set; else mock.

import type { ForgedWorkflow, IntegrationResult } from "../types";
import { buildMockWorkflow } from "../mockData";

const PROVIDER = "OpenAI";

export const FORGE_SYSTEM_PROMPT = `You are Forge, an AI Growth Engineer. Your job is to turn messy one-off GTM automations into production-ready, shareable, monitored revenue workflow packages. Given a messy workflow prompt, extract workflow name, purpose, business goal, target persona, trigger, required inputs, custom GTM signals, enrichment steps, scoring logic, output schema, human review step, failure modes, health checks, sample run rows, runbook, monitoring status, and a GitHub-ready workflow package. Return valid JSON only. Make the output practical for RevOps, GTM Engineering, and Growth teams.`;

/**
 * Compile a messy GTM prompt into a structured workflow.
 * Always returns a usable ForgedWorkflow — falls back to mock on any failure.
 */
export async function compileWorkflow(
  messyPrompt: string
): Promise<IntegrationResult<ForgedWorkflow>> {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return { provider: PROVIDER, source: "mock", status: "fallback", data: buildMockWorkflow() };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          { role: "system", content: FORGE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Messy GTM workflow prompt:\n${messyPrompt}\n\nReturn a JSON object with keys: workflowCard, inputSchema, outputSchema, enrichmentPlan, scoringLogic, sampleRun, healthChecks, monitoring, runbook, packageFiles. Match a production RevOps schema.`,
          },
        ],
        signal: AbortSignal.timeout(20000),
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content;
    const parsed = raw ? JSON.parse(raw) : null;

    // Merge model output over the mock skeleton so the UI never sees a hole.
    const merged: ForgedWorkflow = { ...buildMockWorkflow(), ...(parsed ?? {}) };
    return { provider: PROVIDER, source: "live", status: "success", data: merged };
  } catch {
    return { provider: PROVIDER, source: "mock", status: "fallback", data: buildMockWorkflow() };
  }
}

import { NextResponse } from "next/server";
import { compileWorkflow } from "@/lib/integrations/openai";
import { enrichAccounts } from "@/lib/integrations/orangeSlice";
import { fetchHiringSignals } from "@/lib/integrations/fiber";
import { saveRun } from "@/lib/integrations/convexState";
import { buildMockWorkflow } from "@/lib/mockData";
import type { ForgeResponse, ProviderBadge } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let prompt = "";
  try {
    const body = await req.json();
    prompt = typeof body?.prompt === "string" ? body.prompt : "";
  } catch {
    /* ignore — fall back to default */
  }

  try {
    // Run all sponsor integrations. Each self-heals to mock on failure.
    const [openai, orange, fiber] = await Promise.all([
      compileWorkflow(prompt),
      enrichAccounts(),
      fetchHiringSignals(),
    ]);

    const workflow = openai.data;
    const convex = await saveRun(workflow);

    // Reflect convex monitoring/history back into the workflow card if live/simulated.
    workflow.monitoring = convex.data.monitoring;

    const providers: ProviderBadge[] = [
      { provider: "OpenAI", source: openai.source, status: openai.status, role: "Workflow compiler / reasoning" },
      { provider: "Orange Slice", source: orange.source, status: orange.status, role: "GTM enrichment / agentic spreadsheet" },
      { provider: "Fiber AI", source: fiber.source, status: fiber.status, role: "Fresh company, people & hiring data" },
      { provider: "Convex", source: convex.source, status: convex.status, role: "Workflow state & monitoring memory" },
    ];

    const payload: ForgeResponse = { workflow, providers };
    return NextResponse.json(payload);
  } catch {
    // Absolute last resort — demo must never crash.
    const fallback: ForgeResponse = {
      workflow: buildMockWorkflow(),
      providers: [
        { provider: "OpenAI", source: "mock", status: "fallback", role: "Workflow compiler / reasoning" },
        { provider: "Orange Slice", source: "mock", status: "fallback", role: "GTM enrichment / agentic spreadsheet" },
        { provider: "Fiber AI", source: "mock", status: "fallback", role: "Fresh company, people & hiring data" },
        { provider: "Convex", source: "simulated", status: "success", role: "Workflow state & monitoring memory" },
      ],
    };
    return NextResponse.json(fallback);
  }
}

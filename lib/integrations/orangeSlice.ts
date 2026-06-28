// Orange Slice = GTM enrichment / agentic spreadsheet layer.
// Live if ORANGE_SLICE_API_KEY set AND USE_LIVE_ENRICHMENT=true; else mock.

import type { IntegrationResult } from "../types";
import { mockOrangeSliceData } from "../mockData";

const PROVIDER = "Orange Slice";

export async function enrichAccounts(): Promise<IntegrationResult> {
  const key = process.env.ORANGE_SLICE_API_KEY;
  const live = process.env.USE_LIVE_ENRICHMENT === "true" && !!key;

  if (!live) {
    return { provider: PROVIDER, source: "mock", status: "fallback", data: mockOrangeSliceData };
  }

  try {
    // Live Orange Slice enrichment call would go here.
    const res = await fetch("https://api.orangeslice.ai/v1/accounts/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ source: "fiber.hiring_signals" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Orange Slice ${res.status}`);
    const data = await res.json();
    return { provider: PROVIDER, source: "live", status: "success", data };
  } catch {
    // Never break the demo — degrade to mock.
    return { provider: PROVIDER, source: "mock", status: "fallback", data: mockOrangeSliceData };
  }
}

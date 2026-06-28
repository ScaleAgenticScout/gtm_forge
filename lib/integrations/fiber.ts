// Fiber AI = fresh company, people, and hiring data.
// Live if FIBER_API_KEY set AND USE_LIVE_ENRICHMENT=true; else mock.

import type { IntegrationResult } from "../types";
import { mockFiberData } from "../mockData";

const PROVIDER = "Fiber AI";

export async function fetchHiringSignals(): Promise<IntegrationResult> {
  const key = process.env.FIBER_API_KEY;
  const live = process.env.USE_LIVE_ENRICHMENT === "true" && !!key;

  if (!live) {
    return { provider: PROVIDER, source: "mock", status: "fallback", data: mockFiberData };
  }

  try {
    // Live Fiber AI data call would go here.
    const res = await fetch("https://api.fiber.ai/v1/signals/hiring", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        industries: ["B2B SaaS"],
        roles: ["RevOps", "GTM Engineer", "Sales Ops", "Head of Sales"],
        posted_within_days: 14,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Fiber ${res.status}`);
    const data = await res.json();
    return { provider: PROVIDER, source: "live", status: "success", data };
  } catch {
    return { provider: PROVIDER, source: "mock", status: "fallback", data: mockFiberData };
  }
}

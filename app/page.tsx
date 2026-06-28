"use client";

import { useRef, useState } from "react";
import { BUILD_STEPS, DEFAULT_PROMPT } from "@/lib/buildSteps";
import { BuildLog } from "@/components/BuildLog";
import { RightPanel } from "@/components/RightPanel";
import type { ForgeResponse } from "@/lib/types";

type Phase = "idle" | "building" | "done";

export default function Home() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<ForgeResponse | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function forge() {
    if (phase === "building") return;
    setPhase("building");
    setCurrentStep(0);
    setResult(null);

    // Kick off the real compile (self-heals to mock server-side).
    const fetchPromise = fetch("/api/forge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((r) => r.json() as Promise<ForgeResponse>)
      .catch(() => null);

    // Animate the build sequence.
    const stepMs = 320;
    await new Promise<void>((resolve) => {
      let i = 0;
      timer.current = setInterval(() => {
        i += 1;
        if (i >= BUILD_STEPS.length) {
          if (timer.current) clearInterval(timer.current);
          resolve();
        } else {
          setCurrentStep(i);
        }
      }, stepMs);
    });

    const data = await fetchPromise;
    setResult(
      data ?? {
        // Client-side last resort: hit nothing, show nothing broken.
        workflow: (await import("@/lib/mockData")).buildMockWorkflow(),
        providers: [
          { provider: "OpenAI", source: "mock", status: "fallback", role: "" },
          { provider: "Orange Slice", source: "mock", status: "fallback", role: "" },
          { provider: "Fiber AI", source: "mock", status: "fallback", role: "" },
          { provider: "Convex", source: "simulated", status: "success", role: "" },
        ],
      }
    );
    setPhase("done");
  }

  const providers = result?.providers ?? [];

  return (
    <main className="app-bg">
      {/* Header */}
      <header className="border-b divider px-6 py-4">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-forge to-accent-amber text-lg shadow-glow">
              🔥
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                GTM<span className="grad-text">Forge</span>
              </h1>
              <p className="text-[11px] text-slate-500">
                Forge messy GTM hacks into production-ready workflow packages
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            {["OpenAI", "Orange Slice", "Fiber AI", "Convex"].map((p) => (
              <span
                key={p}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Three-panel layout */}
      <div className="mx-auto grid max-w-[1500px] gap-4 p-4 lg:grid-cols-[320px_360px_1fr]">
        {/* LEFT: Messy GTM Hack */}
        <section className="card flex h-[calc(100vh-110px)] flex-col overflow-hidden">
          <div className="border-b divider px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Messy GTM Hack</h2>
            <p className="text-xs text-slate-500">From vibe-coded GTM hack…</p>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              spellCheck={false}
              className="scroll-thin codeface flex-1 resize-none rounded-xl border border-white/10 bg-ink-900 p-4 text-[13px] leading-relaxed text-slate-300 outline-none focus:border-forge/40"
            />
            <button
              onClick={forge}
              disabled={phase === "building"}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-forge to-accent-amber px-4 py-3 text-sm font-bold text-ink-900 shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-70"
            >
              {phase === "building" ? "Forging…" : phase === "done" ? "Re-forge Workflow" : "🔨 Forge Workflow"}
            </button>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-400">…to production RevOps asset.</span> Forge
              extracts the GTM logic, plans enrichment, reasons through scoring, monitors health, and
              packages a GitHub-ready folder your team can own.
            </div>
          </div>
        </section>

        {/* MIDDLE: Agent Build Log */}
        <section className="h-[calc(100vh-110px)]">
          {phase === "idle" ? (
            <div className="card flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 text-4xl">⚙️</div>
              <h2 className="text-sm font-semibold">Agent Build Log</h2>
              <p className="mt-2 max-w-[240px] text-xs text-slate-500">
                Click <span className="text-forge-glow">Forge Workflow</span> to watch Forge compile your
                messy automation into a production workflow.
              </p>
            </div>
          ) : (
            <BuildLog currentStep={currentStep} done={phase === "done"} providers={providers} />
          )}
        </section>

        {/* RIGHT: Production Workflow */}
        <section className="h-[calc(100vh-110px)]">
          {phase === "done" && result ? (
            <RightPanel wf={result.workflow} />
          ) : (
            <div className="card flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 text-4xl">{phase === "building" ? "🔥" : "📦"}</div>
              <h2 className="text-sm font-semibold">Production Workflow</h2>
              <p className="mt-2 max-w-[280px] text-xs text-slate-500">
                {phase === "building"
                  ? "Forge is compiling — schema, enrichment, scoring, health checks, runbook, and a GitHub-ready package."
                  : "Your forged workflow appears here: card, schema, enrichment, scoring, sample run, health, runbook, monitoring, and package."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

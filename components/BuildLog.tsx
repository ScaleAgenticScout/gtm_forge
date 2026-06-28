"use client";

import { BUILD_STEPS } from "@/lib/buildSteps";
import type { ProviderBadge } from "@/lib/types";

const providerColor: Record<string, string> = {
  OpenAI: "text-accent-green border-accent-green/30 bg-accent-green/10",
  "Orange Slice": "text-forge-glow border-forge/30 bg-forge/10",
  "Fiber AI": "text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10",
  Convex: "text-accent-violet border-accent-violet/30 bg-accent-violet/10",
};

function StepIcon({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-green/20 text-accent-green">
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forge/20 animate-pulse-ring">
        <span className="h-2 w-2 rounded-full bg-forge" />
      </span>
    );
  }
  return <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]" />;
}

export function BuildLog({
  currentStep,
  done,
  providers,
}: {
  currentStep: number;
  done: boolean;
  providers: ProviderBadge[];
}) {
  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b divider px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Agent Build Log</h2>
          <p className="text-xs text-slate-500">Forge compiling your workflow</p>
        </div>
        {done && (
          <span className="rounded-full bg-accent-green/15 px-2.5 py-1 text-[11px] font-semibold text-accent-green">
            ✓ Forged
          </span>
        )}
      </div>

      {/* Provider badges */}
      <div className="grid grid-cols-2 gap-2 border-b divider px-5 py-4">
        {(["OpenAI", "Orange Slice", "Fiber AI", "Convex"] as const).map((name) => {
          const p = providers.find((x) => x.provider === name);
          return (
            <div
              key={name}
              className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${providerColor[name]}`}
            >
              <span className="text-[11px] font-semibold">{name}</span>
              {p ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  connected
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-wide text-slate-500">idle</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Steps */}
      <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
        <ol className="relative space-y-1">
          {BUILD_STEPS.map((step, i) => {
            const state = done || i < currentStep ? "done" : i === currentStep ? "active" : "pending";
            return (
              <li
                key={i}
                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors ${
                  state === "active" ? "bg-forge/[0.06]" : ""
                }`}
              >
                <StepIcon state={state} />
                <span
                  className={`flex-1 text-[13px] ${
                    state === "pending" ? "text-slate-600" : state === "active" ? "text-white" : "text-slate-300"
                  }`}
                >
                  {step.label}
                </span>
                {step.provider && (
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                      providerColor[step.provider]
                    } ${state === "pending" ? "opacity-30" : ""}`}
                  >
                    {step.provider}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

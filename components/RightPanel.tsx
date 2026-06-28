"use client";

import { useState } from "react";
import type { ForgedWorkflow } from "@/lib/types";
import { Field, Pill, HealthDot, healthText, StatusLight } from "./ui";
import { WorkflowPackage } from "./WorkflowPackage";

const TABS = [
  "Workflow Card",
  "Data Schema",
  "Enrichment Plan",
  "Scoring Logic",
  "Sample Run",
  "Health Checks",
  "Runbook",
  "Monitoring",
  "Workflow Package",
] as const;

type Tab = (typeof TABS)[number];

function scoreColor(score: number) {
  if (score >= 85) return "text-accent-green";
  if (score >= 75) return "text-accent-amber";
  return "text-slate-300";
}

export function RightPanel({ wf }: { wf: ForgedWorkflow }) {
  const [tab, setTab] = useState<Tab>("Workflow Card");

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="scroll-thin flex shrink-0 gap-1 overflow-x-auto border-b divider px-3 py-2.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t ? "bg-forge/20 text-forge-glow" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto p-5 animate-fade-up">
        {tab === "Workflow Card" && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight grad-text">{wf.workflowCard.name}</h3>
                <p className="mt-1 max-w-xl text-sm text-slate-400">{wf.workflowCard.purpose}</p>
              </div>
              <Pill tone="forge">{wf.workflowCard.status}</Pill>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Business goal">{wf.workflowCard.businessGoal}</Field>
              <Field label="Owner">{wf.workflowCard.owner}</Field>
              <Field label="Trigger">{wf.workflowCard.trigger}</Field>
              <Field label="Target persona">{wf.workflowCard.targetPersona}</Field>
              <div className="col-span-2">
                <Field label="Human review step">{wf.workflowCard.humanReviewStep}</Field>
              </div>
            </div>
          </div>
        )}

        {tab === "Data Schema" && (
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "Input Schema", fields: wf.inputSchema.fields },
              { title: "Output Schema", fields: wf.outputSchema.fields },
            ].map((s) => (
              <div key={s.title}>
                <h4 className="mb-3 text-sm font-semibold">{s.title}</h4>
                <div className="space-y-1.5">
                  {s.fields.map((f) => (
                    <div
                      key={f.field}
                      className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                    >
                      <code className="codeface text-[12.5px] text-accent-cyan">{f.field}</code>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{f.type}</span>
                      {f.required && (
                        <span className="rounded bg-forge/15 px-1.5 py-0.5 text-[10px] text-forge-glow">required</span>
                      )}
                      <span className="ml-auto truncate text-[11px] text-slate-500">{f.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Enrichment Plan" && (
          <div className="space-y-3">
            {wf.enrichmentPlan.map((step, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forge/15 text-sm font-bold text-forge-glow">
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{step.provider}</span>
                    <Pill tone="cyan">{step.role}</Pill>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Scoring Logic" && (
          <div className="space-y-5">
            <Field label="Model">{wf.scoringLogic.model}</Field>
            <div className="space-y-2">
              {wf.scoringLogic.factors.map((f) => (
                <div key={f.factor} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{f.factor}</span>
                    <span className="codeface text-xs text-forge-glow">w={f.weight}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-forge to-accent-amber"
                      style={{ width: `${f.weight * 100 * 3}%`, maxWidth: "100%" }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">{f.description}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-white/5 bg-ink-900 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Formula</div>
              <code className="codeface mt-1 block text-accent-green">{wf.scoringLogic.formula}</code>
            </div>
          </div>
        )}

        {tab === "Sample Run" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b divider text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Company</th>
                  <th className="py-2 pr-3 font-semibold">Signal</th>
                  <th className="py-2 pr-3 font-semibold">Score</th>
                  <th className="py-2 pr-3 font-semibold">Buyer</th>
                  <th className="py-2 pr-3 font-semibold">Why now</th>
                  <th className="py-2 font-semibold">Next action</th>
                </tr>
              </thead>
              <tbody>
                {wf.sampleRun.map((r) => (
                  <tr key={r.company} className="border-b divider/50 align-top hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3 font-semibold">{r.company}</td>
                    <td className="py-2.5 pr-3 text-slate-400">{r.signal}</td>
                    <td className={`py-2.5 pr-3 font-bold ${scoreColor(r.score)}`}>{r.score}</td>
                    <td className="py-2.5 pr-3 text-slate-300">{r.buyer}</td>
                    <td className="max-w-[180px] py-2.5 pr-3 text-[12px] text-slate-400">{r.whyNow}</td>
                    <td className="py-2.5 text-[12px] text-accent-cyan">{r.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Health Checks" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {wf.healthChecks.map((c) => (
              <div key={c.name} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="mt-1">
                  <HealthDot state={c.state} />
                </span>
                <div>
                  <div className={`text-sm font-medium ${healthText(c.state)}`}>{c.name}</div>
                  <div className="text-[11px] text-slate-500">{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Runbook" && (
          <pre className="codeface scroll-thin whitespace-pre-wrap rounded-lg border border-white/5 bg-ink-900 p-4 text-slate-300">
            {wf.runbook}
          </pre>
        )}

        {tab === "Monitoring" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workflow status</div>
                <div className="mt-1">
                  <StatusLight status={wf.monitoring.status} />
                </div>
              </div>
              <Pill tone="violet">Convex monitoring</Pill>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Last run">{wf.monitoring.lastRun}</Field>
              <Field label="Rows processed">{wf.monitoring.rowsProcessed}</Field>
              <Field label="Failed enrichments">{wf.monitoring.failedEnrichments}</Field>
              <Field label="Next scheduled run">{wf.monitoring.nextScheduledRun}</Field>
              <Field label="Owner">{wf.monitoring.owner}</Field>
              <Field label="Version">{wf.monitoring.version}</Field>
            </div>
            <div className="rounded-lg border border-accent-amber/25 bg-accent-amber/10 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-amber">Suggested fix</div>
              <p className="mt-1 text-sm text-slate-200">{wf.monitoring.suggestedFix}</p>
            </div>
          </div>
        )}

        {tab === "Workflow Package" && <WorkflowPackage files={wf.packageFiles} />}
      </div>
    </div>
  );
}

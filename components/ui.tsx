import type { Source, ProviderStatus, HealthState } from "@/lib/types";

const sourceStyles: Record<Source, string> = {
  live: "bg-accent-green/15 text-accent-green border-accent-green/30",
  mock: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  simulated: "bg-accent-violet/15 text-accent-violet border-accent-violet/30",
};

const sourceLabel: Record<Source, string> = {
  live: "live",
  mock: "mock fallback",
  simulated: "simulated",
};

export function SourceBadge({ source }: { source: Source }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sourceStyles[source]}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {source === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {sourceLabel[source]}
    </span>
  );
}

const statusDot: Record<ProviderStatus, string> = {
  success: "bg-accent-green",
  fallback: "bg-accent-amber",
  error: "bg-accent-red",
};

export function StatusDot({ status }: { status: ProviderStatus }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${statusDot[status]}`} />;
}

const healthStyles: Record<HealthState, { dot: string; text: string }> = {
  pass: { dot: "bg-accent-green", text: "text-accent-green" },
  warn: { dot: "bg-accent-amber", text: "text-accent-amber" },
  fail: { dot: "bg-accent-red", text: "text-accent-red" },
};

export function HealthDot({ state }: { state: HealthState }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${healthStyles[state].dot}`} />;
}

export function healthText(state: HealthState) {
  return healthStyles[state].text;
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "forge" | "cyan" | "violet" }) {
  const tones = {
    neutral: "bg-white/5 text-slate-300 border-white/10",
    forge: "bg-forge/15 text-forge-glow border-forge/30",
    cyan: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
    violet: "bg-accent-violet/15 text-accent-violet border-accent-violet/30",
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm text-slate-200">{children}</div>
    </div>
  );
}

export function StatusLight({ status }: { status: "Green" | "Yellow" | "Red" }) {
  const map = {
    Green: "bg-accent-green shadow-[0_0_12px_2px_rgba(61,220,132,0.6)]",
    Yellow: "bg-accent-amber shadow-[0_0_12px_2px_rgba(255,194,75,0.6)]",
    Red: "bg-accent-red shadow-[0_0_12px_2px_rgba(255,92,108,0.6)]",
  };
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded-full ${map[status]}`} />
      <span className="text-sm font-semibold">{status}</span>
    </span>
  );
}

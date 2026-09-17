import { RefreshCw } from "lucide-react";
import type { ProblemId, PostStatus } from "../../hooks/useOccurrences";
import { PROBLEM_TYPES, STATUS_META } from "../constants";

export function ProblemBadge({ typeId }: { typeId: ProblemId }) {
  const t = PROBLEM_TYPES.find((x) => x.id === typeId)!;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${t.bg}`}
      style={{ color: t.color }}
    >
      <t.icon size={11} />
      {t.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: PostStatus }) {
  const s = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <RefreshCw size={22} className="animate-spin text-primary" />
      {label && <p className="text-sm font-semibold">{label}</p>}
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

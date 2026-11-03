import { formatCh } from "@/lib/supervision/format";
import { PROJECT } from "@/lib/supervision/seed";
import type { Structure } from "@/lib/supervision/types";

export function Alignment({
  structures,
  selectedId,
  onSelect,
}: {
  structures: Structure[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const span = PROJECT.toKm - PROJECT.fromKm;
  const selected = structures.find((item) => item.id === selectedId) ?? structures[0];

  return (
    <div>
      <div className="min-w-0 overflow-x-auto">
        <div className="relative h-44 min-w-3xl px-10">
          <div className="absolute inset-x-10 top-1/2 h-px bg-ink" />
          <span className="absolute top-1/2 left-0 -translate-y-1/2 font-display text-sm tracking-wide text-muted">
            {formatCh(PROJECT.fromKm)}
          </span>
          <span className="absolute top-1/2 right-0 -translate-y-1/2 font-display text-sm tracking-wide text-muted">
            {formatCh(PROJECT.toKm)}
          </span>
          {structures.map((item, index) => {
            const above = index % 2 === 0;
            const left = ((item.chainage - PROJECT.fromKm) / span) * 100;
            const on = item.id === selected?.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={on}
                style={{ left: `${left}%` }}
                className={`absolute top-1/2 flex w-20 -translate-x-1/2 flex-col items-center ${
                  above ? "-translate-y-full" : ""
                }`}
              >
                {above ? (
                  <>
                    <span
                      className={`font-display text-lg leading-none tabular-nums ${on ? "text-accent" : "text-ink"}`}
                    >
                      {formatCh(item.chainage)}
                    </span>
                    <span className="text-xs text-muted">{item.short}</span>
                    <span className={`h-6 w-px ${on ? "bg-accent" : "bg-ink"}`} />
                    <span className={`size-2 rounded-full ${on ? "bg-accent" : "bg-ink"}`} />
                  </>
                ) : (
                  <>
                    <span className={`size-2 rounded-full ${on ? "bg-accent" : "bg-ink"}`} />
                    <span className={`h-6 w-px ${on ? "bg-accent" : "bg-ink"}`} />
                    <span
                      className={`font-display text-lg leading-none tabular-nums ${on ? "text-accent" : "text-ink"}`}
                    >
                      {formatCh(item.chainage)}
                    </span>
                    <span className="text-xs text-muted">{item.short}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {selected ? (
        <div className="mt-2 grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="font-display text-2xl tracking-wide">
              {selected.name}
              <span className="text-muted"> · Km {formatCh(selected.chainage)}</span>
            </p>
            <p className="text-sm text-muted">{selected.kind}</p>
            <p className="mt-2 text-sm">{selected.stage}</p>
            <p className="mt-1 text-sm text-muted">Next hold point: {selected.next}</p>
          </div>
          <p className="font-display text-5xl leading-none tabular-nums">
            {Math.round(selected.progress)}
            <span className="text-2xl">%</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

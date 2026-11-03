import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";
import { Alignment } from "@/components/supervision/alignment";
import { Button, Choice, ErrorNote, Field, Panel, StatusText, TextArea, TextInput } from "@/components/supervision/ui";
import {
  formatCh,
  formatLong,
  formatPct,
  formatQty,
  formatWeekday,
  itemPct,
  siteTodayISO,
  weightedProgress,
} from "@/lib/supervision/format";
import { PROJECT } from "@/lib/supervision/seed";
import { useDesk } from "@/lib/supervision/store";
import type { SafetyLevel } from "@/lib/supervision/types";

const LEVELS = ["Low", "Medium", "High"] as const satisfies readonly SafetyLevel[];

function useBoxWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(node.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return reduce;
}

export function Desk() {
  const diary = useDesk((state) => state.diary);
  const ncrs = useDesk((state) => state.ncrs);
  const inspections = useDesk((state) => state.inspections);
  const boq = useDesk((state) => state.boq);
  const safety = useDesk((state) => state.safety);
  const structures = useDesk((state) => state.structures);
  const selectedId = useDesk((state) => state.selectedId);
  const selectStructure = useDesk((state) => state.selectStructure);
  const setView = useDesk((state) => state.setView);
  const addSafety = useDesk((state) => state.addSafety);
  const closeSafety = useDesk((state) => state.closeSafety);

  const today = siteTodayISO();
  const length = PROJECT.toKm - PROJECT.fromKm;
  const latest = diary[0];
  const openNcrs = ncrs.filter((item) => item.status === "Open");
  const holds = inspections.filter((item) => item.status === "Hold").length;
  const openSafety = safety.filter((item) => item.status === "Open");
  const progress = weightedProgress(boq);
  const { ref, width } = useBoxWidth();
  const reduce = useReducedMotion();

  const chart = boq.map((item) => ({
    name: item.name,
    pct: Math.min(100, itemPct(item)),
  }));

  const kpis = [
    {
      label: "Weighted progress",
      value: formatPct(progress),
      hint: "Major items, rate-weighted",
    },
    {
      label: "Open NCRs",
      value: String(openNcrs.length),
      hint: "Awaiting close-out",
    },
    {
      label: "RFIs on hold",
      value: String(holds),
      hint: "Not cleared to proceed",
    },
    {
      label: "Site labour",
      value: latest ? formatQty(latest.labour) : "\u2014",
      hint: latest ? formatLong(latest.date) : "No diary yet",
    },
  ];

  return (
    <div className="grid min-w-0 gap-4">
      <header>
        <p className="text-sm text-muted">{PROJECT.client}</p>
        <h1 className="font-display text-4xl leading-none tracking-wide md:text-5xl">{PROJECT.name}</h1>
        <p className="mt-2 text-sm">
          {PROJECT.packageName}
          <span className="text-muted"> \u00b7 {PROJECT.contractor}</span>
        </p>
        <p className="mt-2 font-display text-xl tabular-nums tracking-wide md:text-2xl">
          <span className="text-accent">
            Km {formatCh(PROJECT.fromKm)} \u2013 {formatCh(PROJECT.toKm)}
          </span>
          <span className="text-muted">
            {" "}
            \u00b7 {length.toFixed(3)} km \u00b7 \u20b9{PROJECT.contractCr.toFixed(2)} Cr
          </span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {formatWeekday(today)} {formatLong(today)} \u00b7 register for the resident engineer
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((item) => (
          <li key={item.label} className="rounded-2xl bg-surface px-4 py-3 shadow-card">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-1 font-display text-4xl leading-none tabular-nums tracking-wide">
              {item.value}
            </p>
            <p className="mt-2 text-xs text-muted">{item.hint}</p>
          </li>
        ))}
      </ul>

      <Panel title="Alignment" action={<span className="text-sm text-muted">Tap a stake</span>}>
        <Alignment structures={structures} selectedId={selectedId} onSelect={selectStructure} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Open non-conformances"
          action={
            <Button variant="ghost" onClick={() => setView("ncr")}>
              Open register
            </Button>
          }
        >
          {openNcrs.length === 0 ? (
            <p className="text-sm text-muted">No open non-conformances.</p>
          ) : (
            <ul className="grid gap-3">
              {openNcrs.slice(0, 3).map((item) => (
                <li key={item.id} className="border-l-4 border-l-accent pl-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-xl tracking-wide">{item.no}</p>
                    <StatusText value={item.severity} />
                  </div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-sm text-muted">{item.location}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Latest diary"
          action={
            <Button variant="ghost" onClick={() => setView("diary")}>
              Full diary
            </Button>
          }
        >
          {latest ? (
            <article>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-xl tracking-wide">{formatLong(latest.date)}</p>
                <p className="text-sm text-muted">
                  {latest.weather} \u00b7 {latest.tempC}\u00b0C \u00b7 {formatQty(latest.labour)} hands
                </p>
              </div>
              <p className="mt-1 font-display text-lg tabular-nums tracking-wide text-accent">
                Km {latest.fromCh} \u2013 {latest.toCh}
              </p>
              <p className="mt-2 text-sm">{latest.work}</p>
            </article>
          ) : (
            <p className="text-sm text-muted">The diary is empty.</p>
          )}
        </Panel>
      </div>

      <Panel title="Major items">
        <ul className="sr-only">
          {boq.map((item) => (
            <li key={item.id}>
              {item.name}: {formatPct(itemPct(item))} of BOQ
            </li>
          ))}
        </ul>
        <div ref={ref} className="h-80 w-full" aria-hidden={width > 0}>
          {width > 0 ? (
            <BarChart
              width={width}
              height={320}
              data={chart}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={96}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted)", fontSize: 13, fontFamily: "var(--font-sans)" }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-wash)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0]?.payload as { name: string; pct: number } | undefined;
                  if (!row) return null;
                  return (
                    <div className="rounded-md bg-ink px-2 py-1 text-xs text-bg">
                      {row.name} \u00b7 {formatPct(row.pct)}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="pct"
                fill="var(--color-accent)"
                barSize={12}
                radius={[0, 6, 6, 0]}
                isAnimationActive={!reduce}
              />
            </BarChart>
          ) : null}
        </div>
        <p className="text-sm text-muted">
          Bituminous layers are not started. Piling on the underpass is complete. Record fresh
          quantities in the measurement book \u2014 the bars and the progress figure both move.
        </p>
      </Panel>

      <Panel title="Safety">
        <SafetyForm onAdd={addSafety} />
        {openSafety.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No open safety observations.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {openSafety.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 border-t border-line pt-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">{item.location}</p>
                    <StatusText value={item.level} />
                  </div>
                  <p className="text-sm">{item.hazard}</p>
                  <p className="text-xs text-muted">{formatLong(item.date)}</p>
                </div>
                <Button variant="quiet" onClick={() => closeSafety(item.id)}>
                  Close
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function SafetyForm({
  onAdd,
}: {
  onAdd: (draft: { location: string; hazard: string; level: SafetyLevel }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [hazard, setHazard] = useState("");
  const [level, setLevel] = useState<SafetyLevel>("Medium");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!location.trim() || !hazard.trim()) {
      setError("Location and the hazard are both required.");
      return;
    }
    onAdd({ location, hazard, level });
    setLocation("");
    setHazard("");
    setLevel("Medium");
    setError("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button variant="quiet" onClick={() => setOpen(true)}>
        Log observation
      </Button>
    );
  }

  return (
    <form className="grid max-w-2xl gap-3" onSubmit={submit}>
      <Field label="Location">
        <TextInput
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Km 21+540, RW-12 platform"
          autoComplete="off"
        />
      </Field>
      <Field label="What did you see?">
        <TextArea
          value={hazard}
          onChange={(event) => setHazard(event.target.value)}
          placeholder="Edge protection missing on the open side"
        />
      </Field>
      <Field label="Level">
        <Choice
          name="safety-level"
          value={level}
          options={LEVELS}
          onChange={setLevel}
          columns="grid-cols-3"
        />
      </Field>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Save observation</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

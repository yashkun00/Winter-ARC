import { useMemo, useState } from "react";
import {
  ARC_LENGTH,
  HABITS,
  arcDates,
  arcDayIndex,
  dayCount,
  exportState,
  perfectStreak,
  storageFolder,
  streakFor,
  todayKey,
  type ArcState,
  type HabitId,
} from "@/lib/arc";
import wolf from "@/assets/wolf-ridge.jpg";

const CREEDS = [
  "The wolf on the hill is not as hungry as the wolf climbing it.",
  "Discipline is choosing what you want most over what you want now.",
  "No one is coming. Move anyway.",
  "You do not rise to the occasion. You fall to your training.",
  "Winter does not negotiate. Neither should you.",
];

export function Dashboard({
  state,
  setState,
  onReset,
}: {
  state: ArcState;
  setState: (s: ArcState) => void;
  onReset: () => void;
}) {
  const [viewDate, setViewDate] = useState(todayKey());
  const today = todayKey();
  const dates = useMemo(() => arcDates(state), [state.startDate]);
  const dayIdx = arcDayIndex(state);
  const record = state.days[viewDate] ?? {};
  const done = dayCount(record);

  const completedDays = dates.filter((d) => dayCount(state.days[d]) === HABITS.length).length;
  const loggedDays = dates.filter((d) => dayCount(state.days[d]) > 0).length;
  const totalMarks = dates.reduce((n, d) => n + dayCount(state.days[d]), 0);
  const elapsed = Math.min(Math.max(dayIdx + 1, 0), ARC_LENGTH);
  const consistency = elapsed > 0 ? Math.round((totalMarks / (elapsed * HABITS.length)) * 100) : 0;
  const creed = CREEDS[(Math.max(dayIdx, 0)) % CREEDS.length]!;

  function toggle(id: HabitId) {
    const next: ArcState = {
      ...state,
      days: {
        ...state.days,
        [viewDate]: { ...record, [id]: !record[id] },
      },
    };
    setState(next);
  }

  const ring = 264;
  const offset = ring - (done / HABITS.length) * ring;

  return (
    <div className="min-h-screen">
      {/* Hero band */}
      <header className="relative">
        <img
          src={wolf}
          alt="Lone wolf on a moonlit winter ridge"
          width={1920}
          height={912}
          className="h-64 w-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-night)" }} />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-between px-8 py-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-display text-3xl tracking-[0.2em] text-moon">ARC</span>
                <p className="text-[10px] uppercase tracking-[0.35em] text-primary">Winter Arc · Sept → Nov</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportState(state)}
                  className="border border-border bg-card/70 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  Export backup
                </button>
                <button
                  onClick={onReset}
                  className="border border-border bg-card/70 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:border-destructive hover:text-destructive"
                >
                  Reset arc
                </button>
              </div>
            </div>
            <div>
              <h1 className="text-5xl leading-none text-moon">
                {dayIdx < 0
                  ? `${state.name}, the arc begins in ${-dayIdx} ${-dayIdx === 1 ? "day" : "days"}`
                  : `${state.name}, day ${Math.min(dayIdx + 1, ARC_LENGTH)} of ${ARC_LENGTH}`}
              </h1>
              <p className="mt-2 max-w-2xl text-sm italic text-muted-foreground">{creed}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Top stats */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="panel flex items-center gap-5 p-5">
            <div className="relative size-20 shrink-0">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="7"
                  strokeDasharray={ring}
                  strokeDashoffset={offset}
                  className="transition-[stroke-dashoffset] duration-500"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center font-display text-2xl text-moon">
                {done}/{HABITS.length}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {viewDate === today ? "Today" : viewDate}
              </div>
              <div className="font-display text-2xl text-moon">
                {done === HABITS.length ? "Day conquered" : done === 0 ? "Untouched" : "In the hunt"}
              </div>
            </div>
          </div>
          <Stat label="Perfect-day streak" value={perfectStreak(state)} suffix="days" />
          <Stat label="Clean days · no porn" value={streakFor(state, "nofap")} suffix="days" accent />
          <Stat label="Consistency" value={consistency} suffix="%" />
        </section>

        {/* Date nav */}
        <div className="mt-8 flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-2xl text-moon">Daily laws</h2>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Logging</span>
            <input
              type="date"
              value={viewDate}
              max={today}
              onChange={(e) => setViewDate(e.target.value || today)}
              className="border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-primary"
            />
            {viewDate !== today && (
              <button onClick={() => setViewDate(today)} className="text-primary hover:underline">
                back to today
              </button>
            )}
          </div>
        </div>

        {/* Habit tiles */}
        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {HABITS.map((h) => {
            const on = !!record[h.id];
            return (
              <button
                key={h.id}
                onClick={() => toggle(h.id)}
                className={`panel group p-5 text-left transition-all ${
                  on ? "border-primary/70" : "hover:border-primary/40"
                }`}
                style={on ? { boxShadow: "var(--shadow-moon)" } : undefined}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{h.domain}</span>
                  <span
                    className={`grid size-6 place-items-center rounded-full border transition-colors ${
                      on ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {on && <span className="size-2 rounded-full bg-primary-foreground" />}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-display text-3xl text-moon">{h.label}</span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-accent">{h.target}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{h.note}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] uppercase tracking-[0.2em]">
                  <span className={on ? "text-primary" : "text-muted-foreground"}>
                    {on ? "Held" : "Not logged"}
                  </span>
                  <span className="text-muted-foreground">
                    streak <span className="text-foreground">{streakFor(state, h.id)}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        {/* Arc grid */}
        <section className="panel mt-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl text-moon">The 90 nights</h2>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Legend className="bg-primary" label="All six" />
              <Legend className="bg-primary/35" label="Partial" />
              <Legend className="bg-muted" label="Missed" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1.5">
            {dates.map((d, i) => {
              const c = dayCount(state.days[d]);
              const future = d > today;
              const cls =
                c === HABITS.length
                  ? "bg-primary"
                  : c > 0
                    ? "bg-primary/35"
                    : future
                      ? "bg-card"
                      : "bg-muted";
              return (
                <button
                  key={d}
                  disabled={future}
                  onClick={() => setViewDate(d)}
                  title={`Day ${i + 1} · ${d} · ${c}/${HABITS.length}`}
                  className={`aspect-square ${cls} ${d === viewDate ? "outline outline-2 outline-offset-1 outline-accent" : ""} ${future ? "opacity-40" : "hover:opacity-80"}`}
                />
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-4">
            <Meta label="Perfect days" value={`${completedDays}`} />
            <Meta label="Days logged" value={`${loggedDays}`} />
            <Meta label="Remaining" value={`${Math.max(ARC_LENGTH - elapsed, 0)}`} />
            <Meta label="Learning track" value={state.track} />
          </div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>Stored on this machine only · {storageFolder(state.deviceId)}/state.json</span>
          <span>Machine id · {state.deviceId}</span>
        </footer>
      </main>
    </div>
  );
}

function Stat({ label, value, suffix, accent }: { label: string; value: number; suffix: string; accent?: boolean }) {
  return (
    <div className="panel p-5">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`font-display text-5xl leading-none ${accent ? "text-accent" : "text-moon"}`}>{value}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2.5 ${className}`} />
      {label}
    </span>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div>{label}</div>
      <div className="mt-1 text-sm normal-case tracking-normal text-foreground">{value}</div>
    </div>
  );
}

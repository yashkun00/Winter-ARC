import { useState } from "react";
import { LEARNING_TRACKS, defaultStart, HABITS, type ArcState } from "@/lib/arc";
import wolf from "@/assets/wolf-ridge.jpg";

export function Onboarding({
  deviceId,
  onStart,
}: {
  deviceId: string;
  onStart: (s: ArcState) => void;
}) {
  const [name, setName] = useState("");
  const [track, setTrack] = useState<string>(LEARNING_TRACKS[0]);
  const [custom, setCustom] = useState("");
  const [startDate, setStartDate] = useState(defaultStart());

  const resolvedTrack = track === "Custom" ? custom.trim() : track;

  return (
    <div className="min-h-screen">
      <div className="relative">
        <img
          src={wolf}
          alt="Lone wolf on a moonlit winter ridge"
          width={1920}
          height={912}
          className="h-[46vh] w-full object-cover opacity-80"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-night)" }}
        />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-8 pb-10">
            <p className="text-xs uppercase tracking-[0.45em] text-primary">The lone wolf protocol</p>
            <h1 className="mt-3 text-7xl leading-none text-moon">ARC</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Ninety nights. September to November. The pack sleeps — you hunt.
              Everything you log stays on this machine.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-3xl text-moon">Set your arc</h2>
            <div className="mt-6 space-y-6">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Arc start date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  Defaults to 1 September. Set it to today if you are starting now.
                </span>
              </label>

              <div>
                <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  Learning track — 3 hrs daily
                </span>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {LEARNING_TRACKS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTrack(t)}
                      className={`border px-4 py-3 text-left text-sm transition-colors ${
                        track === t
                          ? "border-primary bg-primary/10 text-moon"
                          : "border-border bg-card/50 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {track === "Custom" && (
                  <input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Name your own track"
                    className="mt-3 w-full border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                )}
              </div>

              <button
                type="button"
                disabled={!name.trim() || !resolvedTrack}
                onClick={() =>
                  onStart({
                    deviceId,
                    createdAt: new Date().toISOString(),
                    name: name.trim(),
                    track: resolvedTrack,
                    startDate,
                    days: {},
                  })
                }
                className="w-full bg-primary py-4 text-lg uppercase tracking-[0.3em] text-primary-foreground transition-opacity disabled:opacity-35 font-display"
              >
                Begin the arc
              </button>
            </div>
          </div>

          <div className="panel p-6">
            <h3 className="text-2xl text-moon">The six laws</h3>
            <ul className="mt-5 space-y-4">
              {HABITS.map((h, i) => (
                <li key={h.id} className="flex gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <span className="font-display text-2xl text-primary/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-foreground">{h.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-accent">{h.target}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{h.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

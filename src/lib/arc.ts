// ARC — all state lives on this machine only (localStorage).
// Each machine gets its own device id + its own "folder" (namespaced key).

export type HabitId = "sleep" | "workout" | "learning" | "nofap" | "sunlight" | "reading";

export type Habit = {
  id: HabitId;
  label: string;
  target: string;
  domain: "Body" | "Mind" | "Discipline";
  note: string;
};

export const HABITS: Habit[] = [
  { id: "sleep", label: "Sleep", target: "7 hrs", domain: "Body", note: "Protect the night. Recovery is the base of the arc." },
  { id: "workout", label: "Workout", target: "30 min min.", domain: "Body", note: "Move the body every single day. No excuses." },
  { id: "learning", label: "Learning", target: "3 hrs", domain: "Mind", note: "Deep work on your chosen track." },
  { id: "nofap", label: "No Porn", target: "Zero", domain: "Discipline", note: "No porn, no soft porn. Guard the mind." },
  { id: "sunlight", label: "Morning Sunlight", target: "30 min", domain: "Body", note: "Light early. Set the circadian rhythm." },
  { id: "reading", label: "Reading", target: "1 hr", domain: "Mind", note: "One hour of real reading, daily." },
];

export const LEARNING_TRACKS = [
  "College coursework",
  "Programming / Software",
  "AI & Machine Learning",
  "Design",
  "Business & Finance",
  "Language",
  "Custom",
] as const;

export type DayRecord = Partial<Record<HabitId, boolean>>;

export type ArcState = {
  deviceId: string;
  createdAt: string;
  name: string;
  track: string;
  startDate: string; // YYYY-MM-DD
  days: Record<string, DayRecord>;
};

export const ARC_LENGTH = 90;

const ROOT = "s-yaattra";
const DEVICE_KEY = `${ROOT}/device-id`;

function isBrowser() {
  return typeof window !== "undefined";
}

export function getDeviceId(): string {
  if (!isBrowser()) return "server";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `dev-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function storageFolder(deviceId: string) {
  return `${ROOT}/machines/${deviceId}`;
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, n: number) {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return todayKey(dt);
}

export function diffDays(from: string, to: string) {
  const [y1 = 0, m1 = 1, d1 = 1] = from.split("-").map(Number);
  const [y2 = 0, m2 = 1, d2 = 1] = to.split("-").map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

export function defaultStart() {
  const now = new Date();
  // The arc runs September -> November. Use this year's Sept 1 while that
  // window is still ahead or running; after Nov 30 roll to next year.
  const pastWindow = now.getMonth() > 10; // December
  const year = pastWindow ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-09-01`;
}

export function loadState(deviceId: string): ArcState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(`${storageFolder(deviceId)}/state.json`);
    if (!raw) return null;
    return JSON.parse(raw) as ArcState;
  } catch {
    return null;
  }
}

export function saveState(state: ArcState) {
  if (!isBrowser()) return;
  localStorage.setItem(`${storageFolder(state.deviceId)}/state.json`, JSON.stringify(state));
}

export function clearState(deviceId: string) {
  if (!isBrowser()) return;
  localStorage.removeItem(`${storageFolder(deviceId)}/state.json`);
}

export function dayCount(rec: DayRecord | undefined) {
  if (!rec) return 0;
  return HABITS.reduce((n, h) => n + (rec[h.id] ? 1 : 0), 0);
}

/** Consecutive days a habit was marked, counting back from today. */
export function streakFor(state: ArcState, id: HabitId) {
  let n = 0;
  let cursor = todayKey();
  // today counts only if already marked; otherwise start from yesterday
  if (!state.days[cursor]?.[id]) cursor = addDays(cursor, -1);
  while (state.days[cursor]?.[id]) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

/** Consecutive fully-complete days (all six), counting back from today. */
export function perfectStreak(state: ArcState) {
  let n = 0;
  let cursor = todayKey();
  if (dayCount(state.days[cursor]) < HABITS.length) cursor = addDays(cursor, -1);
  while (dayCount(state.days[cursor]) === HABITS.length) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function arcDayIndex(state: ArcState) {
  return diffDays(state.startDate, todayKey());
}

export function arcDates(state: ArcState) {
  return Array.from({ length: ARC_LENGTH }, (_, i) => addDays(state.startDate, i));
}

export function exportState(state: ArcState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `s-yaattra-${state.deviceId}-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

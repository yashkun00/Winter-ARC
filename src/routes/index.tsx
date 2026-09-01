import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Onboarding } from "@/components/arc/Onboarding";
import { Dashboard } from "@/components/arc/Dashboard";
import { clearState, getDeviceId, loadState, saveState, type ArcState } from "@/lib/arc";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARC — 90-Day Winter Arc Tracker" },
      {
        name: "description",
        content:
          "ARC tracks your 90-day winter arc: sleep, workout, learning, no porn, morning sunlight and reading. Progress is stored locally on your machine.",
      },
      { property: "og:title", content: "ARC — 90-Day Winter Arc Tracker" },
      {
        property: "og:description",
        content: "Six daily laws, 90 nights, one wolf. Local-only discipline tracker for your winter arc.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [state, setStateRaw] = useState<ArcState | null>(null);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    setStateRaw(loadState(id));
    setReady(true);
  }, []);

  function setState(next: ArcState) {
    saveState(next);
    setStateRaw(next);
  }

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!state) {
    return <Onboarding deviceId={deviceId} onStart={setState} />;
  }

  return (
    <Dashboard
      state={state}
      setState={setState}
      onReset={() => {
        if (confirm("Reset this arc? All logged days on this machine will be erased.")) {
          clearState(deviceId);
          setStateRaw(null);
        }
      }}
    />
  );
}

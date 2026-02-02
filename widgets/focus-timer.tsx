"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "focus" | "break";

const STORAGE_KEY = "dashboard-tessa:focus-timer:v1";

type Stored = {
  running: boolean;
  phase: Phase;
  remainingSec: number;
  lastTickMs: number;
  focusMin: number;
  breakMin: number;
};

function loadStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Stored;
  } catch {
    return null;
  }
}

function saveStored(s: Stored) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function FocusTimerWidget({
  refreshKey,
  onRefreshed,
}: {
  refreshKey: number;
  onRefreshed?: (refreshKey: number) => void;
}) {
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [phase, setPhase] = useState<Phase>("focus");
  const [running, setRunning] = useState(false);
  const [remainingSec, setRemainingSec] = useState(25 * 60);

  const timerRef = useRef<number | null>(null);

  // hydrate from localStorage on refreshKey changes
  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setFocusMin(stored.focusMin);
      setBreakMin(stored.breakMin);
      setPhase(stored.phase);
      setRunning(stored.running);
      setRemainingSec(stored.remainingSec);
    } else {
      setRemainingSec(focusMin * 60);
    }
    onRefreshed?.(refreshKey);
  }, [refreshKey, onRefreshed, focusMin]);

  const persist = (next?: Partial<Stored>) => {
    const snapshot: Stored = {
      running,
      phase,
      remainingSec,
      lastTickMs: Date.now(),
      focusMin,
      breakMin,
      ...(next ?? {}),
    };
    saveStored(snapshot);
  };

  // ticking
  useEffect(() => {
    if (!running) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      persist({ running: false });
      return;
    }

    persist({ running: true, lastTickMs: Date.now() });

    timerRef.current = window.setInterval(() => {
      setRemainingSec((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          // switch phase
          const nextPhase: Phase = phase === "focus" ? "break" : "focus";
          const nextRemaining =
            nextPhase === "focus" ? focusMin * 60 : breakMin * 60;

          // keep running
          setPhase(nextPhase);
          persist({
            phase: nextPhase,
            remainingSec: nextRemaining,
            running: true,
            lastTickMs: Date.now(),
          });

          return nextRemaining;
        }
        persist({ remainingSec: next, lastTickMs: Date.now() });
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, focusMin, breakMin]);

  const label = useMemo(() => {
    const mm = Math.floor(remainingSec / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(remainingSec % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  }, [remainingSec]);

  const reset = () => {
    setRunning(false);
    setPhase("focus");
    setRemainingSec(focusMin * 60);
    saveStored({
      running: false,
      phase: "focus",
      remainingSec: focusMin * 60,
      lastTickMs: Date.now(),
      focusMin,
      breakMin,
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Pomodoro</div>
          <div className="text-xs text-gray-500">
            Phase: <span className="font-semibold">{phase}</span>
          </div>
        </div>
        <div className="text-3xl font-mono font-bold text-gray-900">
          {label}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className={`px-3 py-1 rounded text-sm text-white ${
            running ? "bg-yellow-600 hover:bg-yellow-500" : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 rounded text-sm bg-gray-800 text-white hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          onClick={() => {
            const nextPhase: Phase = phase === "focus" ? "break" : "focus";
            setPhase(nextPhase);
            setRemainingSec(nextPhase === "focus" ? focusMin * 60 : breakMin * 60);
            setRunning(false);
            persist({
              phase: nextPhase,
              remainingSec: nextPhase === "focus" ? focusMin * 60 : breakMin * 60,
              running: false,
            });
          }}
          className="px-3 py-1 rounded text-sm border bg-white hover:bg-gray-50"
        >
          Switch
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-xs text-gray-600">
          Focus (min)
          <input
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
            type="number"
            min={1}
            value={focusMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFocusMin(v);
              if (!running && phase === "focus") setRemainingSec(v * 60);
              persist({ focusMin: v });
            }}
          />
        </label>
        <label className="text-xs text-gray-600">
          Break (min)
          <input
            className="mt-1 w-full border rounded px-2 py-1 text-sm"
            type="number"
            min={1}
            value={breakMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              setBreakMin(v);
              if (!running && phase === "break") setRemainingSec(v * 60);
              persist({ breakMin: v });
            }}
          />
        </label>
      </div>
    </div>
  );
}

"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";

type AgendaItem = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string; // ISO
  location?: string;
};

const STORAGE_KEY = "dashboard-tessa:agenda:v1";

function loadAgenda(): AgendaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveAgenda(items: AgendaItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function defaultAgendaForToday(): AgendaItem[] {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();

  const at = (h: number, min = 0) => new Date(y, m, day, h, min).toISOString();

  return [
    {
      id: "evt-standup",
      title: "Daily planning",
      start: at(10, 0),
      end: at(10, 15),
    },
    {
      id: "evt-deepwork",
      title: "Hardcore Focus block",
      start: at(10, 15),
      end: at(11, 45),
    },
    {
      id: "evt-admin",
      title: "Admin / emails",
      start: at(12, 0),
      end: at(12, 30),
    },
  ];
}

export default function AgendaWidget({
  refreshKey,
  onRefreshed,
}: {
  refreshKey: number;
  onRefreshed?: (refreshKey: number) => void;
}) {
  const [items, setItems] = useState<AgendaItem[]>([]);

  useEffect(() => {
    const stored = loadAgenda();
    if (stored.length === 0) {
      const seeded = defaultAgendaForToday();
      saveAgenda(seeded);
      setItems(seeded);
    } else {
      setItems(stored);
    }
    onRefreshed?.(refreshKey);
  }, [refreshKey, onRefreshed]);

  const todayLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const addItem = () => {
    const title = prompt("Agenda item title:");
    if (!title) return;
    const start = prompt("Start time (HH:MM)", "14:00") || "14:00";

    const [hh, mm] = start.split(":").map((x) => Number(x));
    const d = new Date();
    d.setHours(hh || 0, mm || 0, 0, 0);

    const next: AgendaItem = {
      id: `evt-${Date.now()}`,
      title,
      start: d.toISOString(),
    };
    const updated = [...items, next].sort((a, b) => a.start.localeCompare(b.start));
    setItems(updated);
    saveAgenda(updated);
  };

  const clear = () => {
    if (!confirm("Clear agenda items?")) return;
    setItems([]);
    saveAgenda([]);
  };

  return (
    <div className="p-4 compact:p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-foreground">Today</div>
          <div className="text-xs text-muted-foreground">{todayLabel}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addItem}
            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md hover:brightness-110"
          >
            + Add
          </button>
          <button
            onClick={clear}
            className="text-xs border border-border px-2 py-1 rounded-md bg-surface-2 text-foreground hover:bg-muted"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2 compact:space-y-1.5">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No agenda items.</div>
        ) : (
          items.map((it) => {
            const start = new Date(it.start);
            return (
              <div
                key={it.id}
                className="border border-border rounded-lg bg-surface p-2 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {it.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {start.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {it.end
                      ? `–${new Date(it.end).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                    {it.location ? ` • ${it.location}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = items.filter((x) => x.id !== it.id);
                    setItems(updated);
                    saveAgenda(updated);
                  }}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

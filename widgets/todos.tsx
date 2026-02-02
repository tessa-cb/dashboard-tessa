"use client";

import { useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

const STORAGE_KEY = "dashboard-tessa:todos:v1";

function loadTodos(): Todo[] {
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

function saveTodos(items: Todo[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function TodosWidget({
  refreshKey,
  onRefreshed,
}: {
  refreshKey: number;
  onRefreshed?: (refreshKey: number) => void;
}) {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodos(loadTodos());
    onRefreshed?.(refreshKey);
  }, [refreshKey, onRefreshed]);

  const counts = useMemo(() => {
    const done = todos.filter((t) => t.done).length;
    return { done, total: todos.length };
  }, [todos]);

  const add = () => {
    const title = prompt("New todo:");
    if (!title) return;
    const next: Todo = {
      id: `todo-${Date.now()}`,
      title,
      done: false,
      createdAt: Date.now(),
    };
    const updated = [next, ...todos];
    setTodos(updated);
    saveTodos(updated);
  };

  const clearDone = () => {
    const updated = todos.filter((t) => !t.done);
    setTodos(updated);
    saveTodos(updated);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">Tasks</div>
          <div className="text-xs text-gray-500">
            {counts.done}/{counts.total} done
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={add}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500"
          >
            + Add
          </button>
          <button
            onClick={clearDone}
            className="text-xs border px-2 py-1 rounded bg-white hover:bg-gray-50"
          >
            Clear done
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-sm text-gray-400">No todos yet.</div>
        ) : (
          todos.map((t) => (
            <label
              key={t.id}
              className="flex items-center justify-between gap-3 border rounded bg-white p-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => {
                    const updated = todos.map((x) =>
                      x.id === t.id ? { ...x, done: !x.done } : x,
                    );
                    setTodos(updated);
                    saveTodos(updated);
                  }}
                />
                <span
                  className={
                    t.done
                      ? "text-sm text-gray-500 line-through"
                      : "text-sm text-gray-900"
                  }
                >
                  {t.title}
                </span>
              </div>
              <button
                onClick={() => {
                  const updated = todos.filter((x) => x.id !== t.id);
                  setTodos(updated);
                  saveTodos(updated);
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

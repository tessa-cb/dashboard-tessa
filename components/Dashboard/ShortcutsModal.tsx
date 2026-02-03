"use client";

import { useEffect } from "react";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[12px] font-mono text-foreground shadow-sm">
      {children}
    </kbd>
  );
}

export default function ShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 compact:px-3 compact:py-2">
          <div>
            <div className="text-base font-semibold text-foreground">
              Keyboard shortcuts
            </div>
            <div className="text-xs text-muted-foreground">
              Shortcuts are ignored while typing in inputs.
            </div>
          </div>
          <button
            className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-foreground hover:bg-muted"
            onClick={onClose}
            title="Close (Esc)"
          >
            Close <span className="ml-1 opacity-70">Esc</span>
          </button>
        </div>

        <div className="px-4 py-3 compact:px-3 compact:py-2">
          <div className="grid grid-cols-1 gap-2 text-sm compact:gap-1">
            <div className="flex items-center justify-between gap-4">
              <div className="text-muted-foreground">Toggle this help</div>
              <div className="flex items-center gap-2">
                <Kbd>?</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-muted-foreground">Refresh all widgets</div>
              <Kbd>R</Kbd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-muted-foreground">Cycle theme</div>
              <Kbd>D</Kbd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-muted-foreground">Toggle compact mode</div>
              <Kbd>C</Kbd>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground compact:mt-3 compact:px-2 compact:py-1.5">
            Tip: Theme cycles <Kbd>System</Kbd> → <Kbd>Light</Kbd> →{" "}
            <Kbd>Dark</Kbd>.
          </div>
        </div>
      </div>
    </div>
  );
}


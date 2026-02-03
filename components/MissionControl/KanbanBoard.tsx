"use client";
import { Task, Agent } from "@/hooks/useMissionControl";

const COLUMNS = [
  { id: "inbox", label: "Inbox" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

export default function KanbanBoard({
  tasks,
  agents,
  onMoveTask,
  onAssignTask,
  onTaskClick,
}: {
  tasks: Task[];
  agents: Agent[];
  onMoveTask: (id: string, status: string) => void;
  onAssignTask: (id: string, agentId: string | null) => void;
  onTaskClick: (id: string) => void;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-4 compact:p-3 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-foreground compact:mb-3">
        Tasks
      </h2>
      <div className="flex gap-4 compact:gap-3 min-w-[800px]">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex-1 min-w-[200px] bg-surface-2 rounded-lg border border-border p-2 compact:p-1.5"
          >
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase compact:mb-1.5">
              {col.label}
            </h3>
            <div className="space-y-2 compact:space-y-1.5">
              {tasks
                .filter((t) => t.status === col.id)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-surface p-3 compact:p-2 rounded-lg shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <div className="font-medium text-sm mb-1 text-foreground">
                      {task.title}
                    </div>

                    {/* Controls */}
                    <div
                      className="mt-2 space-y-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        className="w-full text-xs border border-border rounded-md p-1 bg-surface-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                        value={task.status}
                        onChange={(e) => onMoveTask(task.id, e.target.value)}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full text-xs border border-border rounded-md p-1 bg-surface-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                        value={task.agentId || ""}
                        onChange={(e) =>
                          onAssignTask(task.id, e.target.value || null)
                        }
                      >
                        <option value="">Unassigned</option>
                        {agents.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

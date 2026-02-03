"use client";

import { useState } from "react";
import { useMissionControl } from "@/hooks/useMissionControl";
import AgentsPanel from "@/components/MissionControl/AgentsPanel";
import KanbanBoard from "@/components/MissionControl/KanbanBoard";
import ActivityFeed from "@/components/MissionControl/ActivityFeed";
import TaskDetailDrawer from "@/components/MissionControl/TaskDetailDrawer";

export default function MissionControlWidget({
  refreshKey,
  onRefreshed,
}: {
  refreshKey: number;
  onRefreshed?: (refreshKey: number) => void;
}) {
  const {
    agents,
    tasks,
    activities,
    connected,
    lastEvent,
    moveTask,
    assignTask,
    createTask,
  } = useMissionControl({ refreshKey, onRefreshed });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  return (
    <div className="bg-surface-2">
      <div className="p-4 compact:p-3 border-b border-border flex justify-between items-center bg-surface">
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              connected
                ? "bg-success/15 text-success border-success/30"
                : "bg-danger/15 text-danger border-danger/30"
            }`}
            title={lastEvent ? `Last event: ${String(lastEvent)}` : undefined}
          >
            {connected ? "● LIVE" : "○ DISCONNECTED"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              fetch("/api/seed", { method: "POST" }).then(() =>
                window.location.reload(),
              )
            }
            className="bg-foreground text-background px-3 py-1.5 rounded-md text-sm hover:brightness-110 compact:px-2 compact:py-1"
          >
            Reset / Seed DB
          </button>
          <button
            onClick={() => {
              const title = prompt("Task Title:");
              if (title) createTask(title);
            }}
            className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm hover:brightness-110 compact:px-2 compact:py-1"
          >
            + New Task
          </button>
        </div>
      </div>

      <div className="p-4 compact:p-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 compact:gap-4">
          <div className="lg:col-span-1 space-y-6 compact:space-y-4">
            <AgentsPanel agents={agents} />
          </div>

          <div className="lg:col-span-2 space-y-6 compact:space-y-4">
            <KanbanBoard
              tasks={tasks}
              agents={agents}
              onMoveTask={moveTask}
              onAssignTask={assignTask}
              onTaskClick={setSelectedTaskId}
            />
          </div>

          <div className="lg:col-span-1 space-y-6 compact:space-y-4">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>

      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          agents={agents}
          lastEvent={lastEvent}
        />
      )}
    </div>
  );
}

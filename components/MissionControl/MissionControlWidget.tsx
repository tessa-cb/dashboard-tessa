"use client";

import { useState } from "react";
import { useMissionControl } from "@/hooks/useMissionControl";
import AgentsPanel from "@/components/MissionControl/AgentsPanel";
import KanbanBoard from "@/components/MissionControl/KanbanBoard";
import ActivityFeed from "@/components/MissionControl/ActivityFeed";
import TaskDetailDrawer from "@/components/MissionControl/TaskDetailDrawer";

export default function MissionControlWidget() {
  const {
    agents,
    tasks,
    activities,
    connected,
    lastEvent,
    moveTask,
    assignTask,
    createTask,
  } = useMissionControl();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Mission Control</h2>
          <p className="text-xs text-gray-500">Real-time Operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            title={lastEvent ? `Last event: ${lastEvent}` : undefined}
          >
            {connected ? "● LIVE" : "○ DISCONNECTED"}
          </div>
          <button
            onClick={() =>
              fetch("/api/seed", { method: "POST" }).then(() =>
                window.location.reload(),
              )
            }
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
          >
            Reset / Seed DB
          </button>
          <button
            onClick={() => {
              const title = prompt("Task Title:");
              if (title) createTask(title);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-500"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Widget Body */}
      <div className="p-4 bg-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <AgentsPanel agents={agents} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <KanbanBoard
              tasks={tasks}
              agents={agents}
              onMoveTask={moveTask}
              onAssignTask={assignTask}
              onTaskClick={setSelectedTaskId}
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
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

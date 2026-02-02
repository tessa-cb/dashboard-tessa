'use client'
import { Task, Agent } from '@/hooks/useMissionControl'

const COLUMNS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'done', label: 'Done' }
]

export default function KanbanBoard({ 
  tasks, 
  agents,
  onMoveTask,
  onAssignTask 
}: { 
  tasks: Task[], 
  agents: Agent[],
  onMoveTask: (id: string, status: string) => void,
  onAssignTask: (id: string, agentId: string | null) => void
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Tasks</h2>
      <div className="flex gap-4 min-w-[800px]">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex-1 min-w-[200px] bg-gray-50 rounded p-2">
            <h3 className="font-semibold mb-2 text-sm text-gray-700 uppercase">{col.label}</h3>
            <div className="space-y-2">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                  <div className="font-medium text-sm mb-1">{task.title}</div>
                  
                  {/* Controls */}
                  <div className="mt-2 space-y-1">
                    <select 
                        className="w-full text-xs border rounded p-1"
                        value={task.status}
                        onChange={(e) => onMoveTask(task.id, e.target.value)}
                    >
                        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>

                    <select
                        className="w-full text-xs border rounded p-1"
                        value={task.agentId || ''}
                        onChange={(e) => onAssignTask(task.id, e.target.value || null)}
                    >
                        <option value="">Unassigned</option>
                        {agents.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
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
  )
}

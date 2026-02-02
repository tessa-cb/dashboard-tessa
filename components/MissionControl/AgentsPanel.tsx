'use client'
import { Agent } from '@/hooks/useMissionControl'

export default function AgentsPanel({ agents }: { agents: Agent[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800'
      case 'idle': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Agents</h2>
      <div className="space-y-3">
        {agents.map(agent => (
          <div key={agent.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {agent.avatar ? <img src={agent.avatar} className="w-full h-full rounded-full" /> : agent.name[0]}
              </div>
              <div>
                <div className="font-semibold">{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.role}</div>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${getStatusColor(agent.status)}`}>
              {agent.status}
            </span>
          </div>
        ))}
        {agents.length === 0 && <div className="text-gray-400 text-sm">No agents online.</div>}
      </div>
    </div>
  )
}

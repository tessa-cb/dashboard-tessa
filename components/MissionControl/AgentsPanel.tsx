"use client";
import { useState } from "react";
import { Agent } from "@/hooks/useMissionControl";

export default function AgentsPanel({ agents }: { agents: Agent[] }) {
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [viewingNotifications, setViewingNotifications] = useState<
    string | null
  >(null);
  const [tempKey, setTempKey] = useState("");
  const [syncing, setSyncing] = useState(false);

  const syncMoltbot = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync/moltbot", { method: "POST" });
      const data = await res.json();
      alert(data.message || "Synced!");
      window.location.reload();
    } catch (e) {
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-green-100 text-green-800";
      case "idle":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startEdit = (agent: Agent) => {
    setEditingAgent(agent.id);
    setTempKey(agent.sessionKey || "");
    setViewingNotifications(null);
  };

  const toggleNotifications = async (agent: Agent) => {
    if (viewingNotifications === agent.id) {
      setViewingNotifications(null);
      setNotifications([]);
      return;
    }

    setViewingNotifications(agent.id);
    setEditingAgent(null);
    try {
      const res = await fetch(
        `/api/notifications?agentId=${agent.id}&unread=true`,
      );
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const saveKey = async (id: string) => {
    try {
      await fetch(`/api/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionKey: tempKey }),
      });
      setEditingAgent(null);
      window.location.reload();
    } catch (e) {
      alert("Failed to save");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Agents</h2>
        <button
          onClick={syncMoltbot}
          disabled={syncing}
          className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-500 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Moltbot"}
        </button>
      </div>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="border rounded hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between p-2">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => toggleNotifications(agent)}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {agent.avatar ? (
                      <img
                        src={agent.avatar}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      agent.name[0]
                    )}
                  </div>
                  {/* Badge */}
                  {agent._count?.notifications ? (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {agent._count.notifications}
                    </div>
                  ) : null}
                </div>
                <div>
                  <div className="font-semibold">{agent.name}</div>
                  <div className="text-xs text-gray-500">{agent.role}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-1 rounded text-xs uppercase font-bold ${getStatusColor(agent.status)}`}
                >
                  {agent.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(agent);
                  }}
                  className="text-[10px] text-blue-600 underline"
                >
                  {agent.sessionKey ? "Key set" : "Set Key"}
                </button>
              </div>
            </div>

            {/* Edit Session Key */}
            {editingAgent === agent.id && (
              <div className="p-2 border-t bg-gray-50">
                <input
                  className="w-full text-xs border rounded p-1 mb-2 font-mono"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="agent:main:subagent:..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingAgent(null)}
                    className="text-xs text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveKey(agent.id)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Notifications List */}
            {viewingNotifications === agent.id && (
              <div className="p-2 border-t bg-yellow-50">
                <h4 className="text-xs font-bold mb-2 uppercase text-gray-500">
                  Notifications
                </h4>
                {notifications.length === 0 ? (
                  <div className="text-xs text-gray-400">
                    No unread notifications
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex justify-between items-start text-xs bg-white p-2 rounded border"
                      >
                        <span>{n.message}</span>
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          ✓
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {agents.length === 0 && (
          <div className="text-gray-400 text-sm">No agents online.</div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Agent } from "@/hooks/useMissionControl";

export default function AgentsPanel({ agents }: { agents: Agent[] }) {
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<
    { id: string; message: string }[]
  >([]);
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
        return "bg-success/15 text-success border-success/30";
      case "idle":
        return "bg-muted text-foreground border-border";
      case "paused":
        return "bg-warning/15 text-warning border-warning/30";
      default:
        return "bg-muted text-foreground border-border";
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
    <div className="bg-surface rounded-xl border border-border shadow-sm p-4 compact:p-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Agents</h2>
        <button
          onClick={syncMoltbot}
          disabled={syncing}
          className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md hover:brightness-110 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Moltbot"}
        </button>
      </div>
      <div className="space-y-3 compact:space-y-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="border border-border rounded-lg hover:bg-muted/60 transition-colors"
          >
            <div className="flex items-center justify-between p-2">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => toggleNotifications(agent)}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
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
                  <div className="font-semibold text-foreground">
                    {agent.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {agent.role}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-1 rounded-md text-xs uppercase font-semibold border ${getStatusColor(agent.status)}`}
                >
                  {agent.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(agent);
                  }}
                  className="text-[10px] text-primary underline decoration-primary/60 underline-offset-2"
                >
                  {agent.sessionKey ? "Key set" : "Set Key"}
                </button>
              </div>
            </div>

            {/* Edit Session Key */}
            {editingAgent === agent.id && (
              <div className="p-2 border-t border-border bg-surface-2">
                <input
                  className="w-full text-xs border border-border rounded-md p-2 mb-2 font-mono bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="agent:main:subagent:..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingAgent(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveKey(agent.id)}
                    className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md hover:brightness-110"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Notifications List */}
            {viewingNotifications === agent.id && (
              <div className="p-2 border-t border-border bg-warning/10">
                <h4 className="text-xs font-semibold mb-2 uppercase text-muted-foreground">
                  Notifications
                </h4>
                {notifications.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    No unread notifications
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex justify-between items-start text-xs bg-surface p-2 rounded-md border border-border"
                      >
                        <span className="text-foreground">{n.message}</span>
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-primary hover:brightness-125 ml-2"
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
          <div className="text-muted-foreground text-sm">No agents online.</div>
        )}
      </div>
    </div>
  );
}

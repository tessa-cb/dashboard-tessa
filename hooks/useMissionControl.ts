'use client'

import { useState, useEffect } from 'react'

export type Agent = {
  id: string
  name: string
  role: string
  status: string
  avatar?: string
}

export type Task = {
  id: string
  title: string
  status: string
  priority: string
  agentId?: string
  agent?: Agent
}

export type Activity = {
  id: string
  type: string
  message: string
  createdAt: string
  metadata?: string
}

export function useMissionControl() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [connected, setConnected] = useState(false)

  const fetchData = async () => {
    try {
      const [a, t] = await Promise.all([
        fetch('/api/agents').then(res => res.json()),
        fetch('/api/tasks').then(res => res.json())
      ])
      setAgents(a)
      setTasks(t)
    } catch (e) {
      console.error(e)
    }
  }

  // Initial Seed check? 
  // No, just fetch.

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let eventSource: EventSource | null = null

    // Helper to start connection with retry
    const connect = () => {
        // Safari can be picky about relative EventSource URLs in some setups
        const streamUrl = new URL('/api/stream', window.location.origin)
        eventSource = new EventSource(streamUrl.toString())
        
        eventSource.onopen = () => setConnected(true)
        
        eventSource.onmessage = (event) => {
            try {
                if (event.data === ': heartbeat') return
                const data = JSON.parse(event.data)
                
                if (data.type === 'connected') return

                // Add to feed
                setActivities(prev => [data, ...prev].slice(0, 50))

                // Refetch data if structural change
                // We could optimize this by patching state locally
                fetchData()
            } catch (e) {
                console.error('SSE Parse Error', e)
            }
        }

        eventSource.onerror = () => {
            setConnected(false)
            eventSource?.close()
            // Retry after 5s? simple retry via react effect dependency if we toggled something, 
            // but here we just leave it closed or let the user refresh.
            // For MVP, auto-reconnect logic is complex to get right without loops.
        }
    }

    connect()

    return () => {
        eventSource?.close()
    }
  }, [])

  // Helper actions
  const moveTask = async (taskId: string, status: string) => {
      await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
      })
      // Optimistic update?
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
  }

  const assignTask = async (taskId: string, agentId: string | null) => {
       await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, status: agentId ? 'assigned' : 'inbox' })
      })
      fetchData() // Refresh to get relation update
  }
  
  const createTask = async (title: string) => {
      await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
      })
      fetchData()
  }

  return { agents, tasks, activities, connected, moveTask, assignTask, createTask }
}

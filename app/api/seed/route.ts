import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity'

export async function POST() {
  try {
    // Clean up
    await prisma.activity.deleteMany()
    await prisma.task.deleteMany()
    await prisma.agent.deleteMany()

    // Agents
    const agentsData = [
      { name: 'Sarah Connor', role: 'Security Specialist', status: 'idle' },
      { name: 'Neo', role: 'Software Engineer', status: 'working' },
      { name: 'Trinity', role: 'DevOps', status: 'idle' },
      { name: 'Morpheus', role: 'Team Lead', status: 'paused' },
    ]

    const agents = []
    for (const a of agentsData) {
      const agent = await prisma.agent.create({ data: a })
      agents.push(agent)
    }

    // Tasks
    const tasksData = [
      { title: 'Secure the perimeter', status: 'inbox', priority: 'high' },
      { title: 'Update firewall rules', status: 'assigned', agentId: agents[0].id, priority: 'medium' },
      { title: 'Refactor matrix backend', status: 'in_progress', agentId: agents[1].id, priority: 'high' },
      { title: 'Deploy to Nebuchadnezzar', status: 'review', agentId: agents[2].id, priority: 'medium' },
      { title: 'Train new recruits', status: 'blocked', priority: 'low' },
    ]

    for (const t of tasksData) {
      await prisma.task.create({ data: t })
    }

    await logActivity('system', 'Database seeded successfully')

    return NextResponse.json({ success: true, message: 'Seeded' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}

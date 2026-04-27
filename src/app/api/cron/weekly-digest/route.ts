import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendWeeklyDigest, type HeldConversation } from '@/lib/notifications/sendWeeklyDigest'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekStart = weekAgo
  const weekEnd = now

  // Get all conversations in the past 7 days
  const { data: conversations, error } = await admin
    .from('conversations')
    .select('id, exec_profile_id, verdict, score, category, summary, sender_name, sender_company, created_at')
    .gte('created_at', weekAgo.toISOString())

  if (error) {
    console.error('[weekly-digest] Failed to fetch conversations:', error)
    return Response.json({ error: 'DB error' }, { status: 500 })
  }

  if (!conversations || conversations.length === 0) {
    return Response.json({ processed: 0, errors: [] })
  }

  // Group all conversations by exec_profile_id
  const byExec = new Map<string, typeof conversations>()
  for (const conv of conversations) {
    const arr = byExec.get(conv.exec_profile_id) ?? []
    arr.push(conv)
    byExec.set(conv.exec_profile_id, arr)
  }

  // Only process execs that have at least 1 held conversation
  const execsWithHeld = [...byExec.entries()].filter(([, convs]) =>
    convs.some((c) => c.verdict === 'hold')
  )

  if (execsWithHeld.length === 0) {
    return Response.json({ processed: 0, errors: [] })
  }

  // Fetch exec profiles for those execs
  const execIds = execsWithHeld.map(([id]) => id)
  const { data: profiles } = await admin
    .from('exec_profiles')
    .select('id, full_name, notification_email')
    .in('id', execIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const errors: string[] = []
  let processed = 0

  await Promise.allSettled(
    execsWithHeld.map(async ([execId, convs]) => {
      const profile = profileMap.get(execId)
      if (!profile?.notification_email) return

      const held: HeldConversation[] = convs
        .filter((c) => c.verdict === 'hold')
        .map((c) => ({
          id: c.id,
          sender_name: c.sender_name ?? '',
          sender_company: c.sender_company ?? '',
          category: c.category ?? '',
          score: c.score ?? 0,
          summary: c.summary ?? '',
          created_at: c.created_at,
        }))

      const passed = convs.filter((c) => c.verdict === 'pass').length
      const failed = convs.filter((c) => c.verdict === 'fail').length

      try {
        await sendWeeklyDigest({
          execNotificationEmail: profile.notification_email,
          execFirstName: profile.full_name?.split(' ')[0] ?? '',
          heldConversations: held,
          weekStats: {
            screened: convs.length,
            passed,
            held: held.length,
            failed,
          },
          weekStart,
          weekEnd,
        })
        processed++
      } catch (err) {
        console.error(`[weekly-digest] Failed for exec ${execId}:`, err)
        errors.push(execId)
      }
    })
  )

  return Response.json({ processed, errors })
}

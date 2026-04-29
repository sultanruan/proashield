import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DashboardClient } from './_components/DashboardClient'
import type { DashboardConversation } from '@/components/dashboard/ConversationCard'

export default async function ExecDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; username?: string }>
}) {
  const sp = await searchParams
  const isWelcome = sp.welcome === '1'
  const welcomeUsername = sp.username ?? ''

  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/exec/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (userRow?.user_type !== 'exec') redirect('/')

  const { data: profile } = await supabase
    .from('exec_profiles')
    .select('id, username, full_name, notification_email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) redirect('/onboarding/exec')

  const { data: rawConversations } = await supabase
    .from('conversations')
    .select(
      'id, sender_name, sender_company, sender_email, verdict, status, score, category, summary, reason, transcript, created_at, resolved_at'
    )
    .eq('exec_profile_id', profile.id)
    .order('created_at', { ascending: false })

  // Coerce status for rows that predate the migration (no status column yet)
  const conversations: DashboardConversation[] = (rawConversations ?? []).map((c) => ({
    ...c,
    status: (c.status as DashboardConversation['status']) ??
      (c.verdict === 'pass' ? 'passed' : c.verdict === 'fail' ? 'failed' : 'pending'),
    transcript: Array.isArray(c.transcript) ? c.transcript : [],
  }))

  return (
    <DashboardClient
      profile={profile}
      conversations={conversations}
      isWelcome={isWelcome}
      welcomeUsername={welcomeUsername}
    />
  )
}

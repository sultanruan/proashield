import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SellerDashboardClient } from './_components/SellerDashboardClient'

export default async function SellerDashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/seller/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('user_type, full_name')
    .eq('id', user.id)
    .single()

  if (userRow?.user_type !== 'seller') redirect('/')

  const { data: sellerProfile } = await supabase
    .from('seller_profiles')
    .select('onboarding_completed, full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sellerProfile?.onboarding_completed) redirect('/onboarding/seller')

  const fullName = userRow?.full_name ?? sellerProfile?.full_name ?? 'Seller'

  const { data: rawConversations } = await supabase
    .from('conversations')
    .select(`
      id, verdict, status, score, category, summary, reason,
      transcript, created_at, sender_name, sender_company,
      exec_profiles (
        username, full_name, job_title, company_name
      )
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  type ExecInfo = { username: string; full_name: string; job_title: string; company_name: string }

  const conversations = (rawConversations ?? []).map((c) => ({
    id: c.id as string,
    verdict: (c.verdict ?? 'fail') as 'pass' | 'hold' | 'fail',
    status: (c.status ?? 'failed') as string,
    score: (c.score ?? 0) as number,
    category: (c.category ?? '') as string,
    summary: (c.summary ?? '') as string,
    reason: (c.reason ?? '') as string,
    transcript: (Array.isArray(c.transcript) ? c.transcript : []) as { role: 'user' | 'assistant'; content: string }[],
    created_at: c.created_at as string,
    sender_name: (c.sender_name ?? '') as string,
    sender_company: (c.sender_company ?? '') as string,
    exec: (Array.isArray(c.exec_profiles) ? c.exec_profiles[0] : c.exec_profiles) as ExecInfo | null,
  }))

  return (
    <SellerDashboardClient fullName={fullName} conversations={conversations} />
  )
}

import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PublicProfileClient } from './_components/PublicProfileClient'
import type { ExecProfile } from './types'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  console.log('[PublicProfilePage] username from params:', JSON.stringify(username))

  const supabase = await createServerSupabaseClient()

  // Auth gate — sellers only
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/seller/login?redirect=/${encodeURIComponent(username)}`)
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (userRow?.user_type !== 'seller') {
    redirect('/dashboard/exec')
  }

  const { data, error } = await supabase
    .from('exec_profiles')
    .select('id, username, full_name, job_title, company_name, company_description, professional_context, outreach_profile, current_focus, ai_structured_profile')
    .eq('username', username)
    .maybeSingle()

  console.log('[PublicProfilePage] supabase data:', JSON.stringify(data))
  console.log('[PublicProfilePage] supabase error:', JSON.stringify(error))

  if (!data) notFound()

  const profile = data as ExecProfile

  return (
    <Suspense>
      <PublicProfileClient profile={profile} />
    </Suspense>
  )
}

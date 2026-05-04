import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TopNav } from '@/components/dashboard/TopNav'
import { SettingsClient } from './_components/SettingsClient'

export default async function SettingsPage() {
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
    .select('username, full_name, professional_context, outreach_profile, current_focus, ai_structured_profile')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) redirect('/onboarding/exec')

  // Extract persisted summary from the structured profile jsonb
  const aiProfile = profile.ai_structured_profile as Record<string, unknown> | null
  const initialSummary = (aiProfile?._summary as string | null) ?? null

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav fullName={profile.full_name} username={profile.username} />
      <SettingsClient
        initialProfessionalContext={profile.professional_context ?? ''}
        initialOutreachProfile={profile.outreach_profile ?? ''}
        initialCurrentFocus={profile.current_focus ?? ''}
        initialSummary={initialSummary}
      />
    </div>
  )
}

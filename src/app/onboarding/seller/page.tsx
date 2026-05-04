import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SellerOnboardingClient } from './_components/SellerOnboardingClient'

export default async function SellerOnboardingPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/seller/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (userRow?.user_type !== 'seller') redirect('/')

  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('company_name, company_email, onboarding_completed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.onboarding_completed) redirect('/dashboard/seller')

  return (
    <SellerOnboardingClient
      userId={user.id}
      initialCompanyName={profile?.company_name ?? ''}
      initialCompanyEmail={profile?.company_email ?? ''}
    />
  )
}

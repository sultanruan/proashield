import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TopNav } from '@/components/dashboard/TopNav'
import { Settings, Bell, User } from 'lucide-react'

const SECTIONS = [
  {
    icon: Settings,
    label: 'Screening criteria',
    description: 'Adjust what your AI accepts, rejects, and flags.',
  },
  {
    icon: Bell,
    label: 'Notifications',
    description: 'Choose how and when you receive pass alerts and weekly digests.',
  },
  {
    icon: User,
    label: 'Profile',
    description: 'Update your name, title, company, and public page content.',
  },
]

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
    .select('username, full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) redirect('/onboarding/exec')

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav fullName={profile.full_name} username={profile.username} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-[#09090B]">Shield Settings</h1>
          <p className="mt-1 text-sm text-[#52525B]">
            Manage your screening criteria, notifications, and profile.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E4E4E7] divide-y divide-[#E4E4E7]">
          {SECTIONS.map(({ icon: Icon, label, description }) => (
            <div key={label} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-[#F4F4F5] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#52525B]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#09090B]">{label}</p>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">{description}</p>
                </div>
              </div>
              <div className="relative group shrink-0">
                <button
                  disabled
                  className="px-3.5 py-1.5 rounded-lg border border-[#E4E4E7] text-xs font-medium text-[#A1A1AA] cursor-not-allowed"
                >
                  Edit
                </button>
                <div className="absolute right-0 bottom-full mb-1.5 px-2.5 py-1 rounded-lg bg-[#09090B] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                  Coming soon
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

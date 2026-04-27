'use client'

import { ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import type { ExecProfile } from '../types'

interface Props {
  profile: ExecProfile
  authState: 'loading' | 'seller' | 'exec' | 'none'
  onStartChat: () => void
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function LandingView({ profile, authState, onStartChat }: Props) {
  const firstName = profile.full_name.split(' ')[0]
  const initials = getInitials(profile.full_name)

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center px-4 py-10">
      {/* Logo */}
      <div className="mb-10 self-center">
        <Logo />
      </div>

      <div className="w-full max-w-[440px] flex flex-col gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] px-6 py-7 flex flex-col items-center text-center gap-4">
          {/* Avatar */}
          <div
            className="w-[72px] h-[72px] rounded-full bg-[#0EA5E9] flex items-center justify-center shrink-0"
            aria-label={profile.full_name}
          >
            <span className="text-white font-semibold text-xl tracking-tight">{initials}</span>
          </div>

          {/* Name + title */}
          <div>
            <h1 className="text-2xl font-bold text-[#09090B] tracking-tight leading-tight">
              {profile.full_name}
            </h1>
            <p className="mt-1 text-base text-[#52525B]">
              {profile.job_title}
              {profile.company_name ? ` · ${profile.company_name}` : ''}
            </p>
          </div>

          {/* Protected badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F9FF] border border-[#BAE6FD]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5E9]" strokeWidth={2} />
            <span className="text-xs font-medium text-[#0369A1]">Protected by Proa</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E4E4E7]" />

        {/* CTA section */}
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-[15px] text-[#52525B] leading-relaxed">
            Want to get in touch with <span className="font-medium text-[#09090B]">{firstName}</span>?
            Start a short conversation with Proa AI.
            It takes about 60 seconds.
          </p>

          {authState === 'exec' ? (
            <div className="w-full max-w-sm px-4 py-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-sm text-[#92400E] text-center">
              You&apos;re logged in as an executive. To send outreach, use a seller account.
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartChat}
              disabled={authState === 'loading'}
              className="w-full max-w-sm bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-5 py-3 rounded-lg text-[15px] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {authState === 'loading' ? 'Loading…' : 'Start Conversation'}
            </button>
          )}

          <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-xs">
            Proa screens outreach so {firstName} only receives relevant contacts.
            Your time matters too.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#A1A1AA] mt-4">
          Powered by ProaShield · proashield.com
        </p>
      </div>
    </main>
  )
}

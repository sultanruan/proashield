'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { ShieldCheck, Copy, Check } from 'lucide-react'
import { Logo } from '@/components/Logo'

function DashboardContent() {
  const params = useSearchParams()
  const isWelcome = params.get('welcome') === '1'
  const username = params.get('username') ?? ''
  const profileUrl = `proashield.com/${username}`

  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(`https://${profileUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Minimal top bar */}
      <header className="h-14 border-b border-[#E4E4E7] bg-white flex items-center px-6">
        <Logo />
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Welcome banner */}
        {isWelcome && username && (
          <div className="mb-8 flex items-start gap-4 px-5 py-4 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]">
            <ShieldCheck className="w-5 h-5 text-[#0EA5E9] shrink-0 mt-0.5" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0369A1]">
                Your Shield is live
              </p>
              <p className="text-sm text-[#0369A1] mt-0.5">
                Share this link — every sender goes through your AI screening first.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-white border border-[#BAE6FD] text-sm text-[#09090B] font-medium truncate">
                  {profileUrl}
                </div>
                <button
                  onClick={copyLink}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-medium transition-colors duration-150"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder content */}
        <div className="text-center py-16 text-[#A1A1AA]">
          <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-[#E4E4E7]" strokeWidth={1.5} />
          <p className="text-[15px] font-medium text-[#52525B]">Executive Dashboard</p>
          <p className="text-sm mt-1">Coming in Week 5</p>
        </div>
      </div>
    </main>
  )
}

export default function ExecDashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}

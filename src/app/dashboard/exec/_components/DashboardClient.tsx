'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, ShieldCheck } from 'lucide-react'
import { TopNav } from '@/components/dashboard/TopNav'
import { StatsRow } from '@/components/dashboard/StatsRow'
import {
  ConversationCard,
  type DashboardConversation,
} from '@/components/dashboard/ConversationCard'
import { TranscriptModal } from '@/components/dashboard/TranscriptModal'

interface DashboardProfile {
  id: string
  username: string
  full_name: string
  notification_email: string | null
}

interface DashboardClientProps {
  profile: DashboardProfile
  conversations: DashboardConversation[]
  isWelcome: boolean
  welcomeUsername: string
}

type Tab = 'pending' | 'passed' | 'failed'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

function computeStats(convs: DashboardConversation[]) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recent = convs.filter((c) => new Date(c.created_at).getTime() > thirtyDaysAgo)
  const total = recent.length
  const passed = recent.filter((c) => c.status === 'passed').length
  const held = recent.filter((c) => c.status === 'pending').length
  const failed = recent.filter((c) => c.status === 'failed').length
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  const catCounts: Record<string, number> = {}
  for (const c of convs) {
    if (c.category) catCounts[c.category] = (catCounts[c.category] ?? 0) + 1
  }
  const topCategory =
    Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  return { total, passed, held, failed, passRate, topCategory }
}

export function DashboardClient({
  profile,
  conversations: initialConversations,
  isWelcome,
  welcomeUsername,
}: DashboardClientProps) {
  const [convs, setConvs] = useState<DashboardConversation[]>(initialConversations)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [transcriptConv, setTranscriptConv] = useState<DashboardConversation | null>(null)
  const [copied, setCopied] = useState(false)

  const holds = convs.filter((c) => c.status === 'pending')
  const passes = convs.filter((c) => c.status === 'passed')
  const fails = convs.filter((c) => c.status === 'failed')

  const defaultTab: Tab = holds.length > 0 ? 'pending' : 'passed'
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  const stats = computeStats(convs)

  function addToast(message: string, type: Toast['type'] = 'success') {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }

  async function handlePass(id: string, senderName: string) {
    const prev = convs
    setConvs((c) =>
      c.map((conv) => (conv.id === id ? { ...conv, status: 'passed' as const } : conv))
    )
    const res = await fetch(`/api/conversations/${id}/pass`, { method: 'PATCH' })
    if (!res.ok) {
      setConvs(prev)
      addToast('Something went wrong. Please try again.', 'error')
      return
    }
    addToast(`Email sent — ${senderName || 'sender'} has been notified`)
  }

  async function handleDismiss(id: string) {
    const prev = convs
    setConvs((c) =>
      c.map((conv) => (conv.id === id ? { ...conv, status: 'failed' as const } : conv))
    )
    const res = await fetch(`/api/conversations/${id}/dismiss`, { method: 'PATCH' })
    if (!res.ok) {
      setConvs(prev)
      addToast('Something went wrong. Please try again.', 'error')
      return
    }
    addToast('Moved to Fail')
  }

  async function handleRecover(id: string) {
    const prev = convs
    setConvs((c) =>
      c.map((conv) => (conv.id === id ? { ...conv, status: 'pending' as const } : conv))
    )
    const res = await fetch(`/api/conversations/${id}/recover`, { method: 'PATCH' })
    if (!res.ok) {
      setConvs(prev)
      addToast('Something went wrong. Please try again.', 'error')
      return
    }
    addToast('Moved to Hold')
  }

  const handleViewTranscript = useCallback((conv: DashboardConversation) => {
    setTranscriptConv(conv)
  }, [])

  function copyLink() {
    navigator.clipboard.writeText(`https://proashield.com/${welcomeUsername}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentList = activeTab === 'pending' ? holds : activeTab === 'passed' ? passes : fails

  const allTabs: { key: Tab; label: string; count: number }[] = [
    { key: 'pending', label: 'Hold', count: holds.length },
    { key: 'passed', label: 'Pass', count: passes.length },
    { key: 'failed', label: 'Fail', count: fails.length },
  ]
  const tabs = allTabs.filter(
    (t) => !(t.key === 'pending' && holds.length === 0 && passes.length > 0)
  )

  const emptyMessages: Record<Tab, string> = {
    pending: 'No pending holds — your AI is keeping things clean.',
    passed: 'No approved contacts yet.',
    failed: 'No declined contacts.',
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav fullName={profile.full_name} username={profile.username} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome banner */}
        {isWelcome && welcomeUsername && (
          <div className="flex items-start gap-4 px-5 py-4 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]">
            <ShieldCheck className="w-5 h-5 text-[#0EA5E9] shrink-0 mt-0.5" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0369A1]">Your Shield is live</p>
              <p className="text-sm text-[#0369A1] mt-0.5">
                Share this link — every sender goes through your AI screening first.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-white border border-[#BAE6FD] text-sm text-[#09090B] font-medium truncate">
                  proashield.com/{welcomeUsername}
                </div>
                <button
                  onClick={copyLink}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-medium transition-colors duration-150 active:scale-[0.98]"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5" />Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" />Copy link</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Tabs + cards */}
        <div>
          {/* Tab bar */}
          <div className="flex items-center gap-0 border-b border-[#E4E4E7] mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 -mb-px ${
                  activeTab === tab.key
                    ? 'border-[#0EA5E9] text-[#0EA5E9]'
                    : 'border-transparent text-[#A1A1AA] hover:text-[#52525B]'
                }`}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.key
                      ? 'bg-[#E0F2FE] text-[#0EA5E9]'
                      : 'bg-[#F4F4F5] text-[#A1A1AA]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Card list */}
          {currentList.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldCheck
                className="w-8 h-8 mx-auto mb-3 text-[#E4E4E7]"
                strokeWidth={1.5}
              />
              <p className="text-sm text-[#A1A1AA]">{emptyMessages[activeTab]}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {currentList.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  tab={activeTab}
                  onPass={handlePass}
                  onDismiss={handleDismiss}
                  onRecover={handleRecover}
                  onViewTranscript={handleViewTranscript}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Transcript modal */}
      <TranscriptModal
        conversation={transcriptConv}
        onClose={() => setTranscriptConv(null)}
      />

      {/* Toast stack */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium shadow-md pointer-events-auto transition-all ${
              t.type === 'error'
                ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                : 'bg-[#09090B] text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}

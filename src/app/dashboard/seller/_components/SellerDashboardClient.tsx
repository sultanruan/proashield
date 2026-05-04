'use client'

import { useState, useCallback } from 'react'
import { ShieldCheck } from 'lucide-react'
import { TopNav } from '@/components/dashboard/TopNav'
import { TranscriptModal } from '@/components/dashboard/TranscriptModal'

type ExecInfo = {
  username: string
  full_name: string
  job_title: string
  company_name: string
}

export type SellerConversation = {
  id: string
  verdict: 'pass' | 'hold' | 'fail'
  status: string
  score: number
  category: string
  summary: string
  reason: string
  transcript: { role: 'user' | 'assistant'; content: string }[]
  created_at: string
  sender_name: string
  sender_company: string
  exec: ExecInfo | null
}

interface Props {
  fullName: string
  conversations: SellerConversation[]
}

const VERDICT_CONFIG = {
  pass: { label: 'Passed', bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' },
  hold: { label: 'Held', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]' },
  fail: { label: 'Declined', bg: 'bg-[#F9FAFB]', text: 'text-[#6B7280]' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div className="bg-[#F4F4F5] rounded-xl p-4">
      <p className="text-xs font-medium text-[#A1A1AA] mb-1">{label}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color: accent === '#09090B' ? '#09090B' : accent }}>
        {value || '—'}
      </p>
      <p className="text-xs text-[#A1A1AA] mt-0.5">{sub}</p>
    </div>
  )
}

function ConversationRow({
  conv,
  onViewTranscript,
}: {
  conv: SellerConversation
  onViewTranscript: (c: SellerConversation) => void
}) {
  const vc = VERDICT_CONFIG[conv.verdict]
  const exec = conv.exec

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] p-5 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#09090B] truncate">
            {exec?.full_name ?? 'Unknown executive'}
          </p>
          <p className="text-xs text-[#A1A1AA] truncate mt-0.5">
            {exec?.job_title ?? ''}
            {exec?.job_title && exec?.company_name ? ' · ' : ''}
            {exec?.company_name ?? ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${vc.bg} ${vc.text}`}>
            {vc.label}
          </span>
          <span className="text-xs text-[#A1A1AA]">{timeAgo(conv.created_at)}</span>
        </div>
      </div>

      {/* Score + category */}
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          conv.score >= 70
            ? 'bg-[#ECFDF5] text-[#059669]'
            : conv.score >= 40
            ? 'bg-[#FFFBEB] text-[#D97706]'
            : 'bg-[#FEF2F2] text-[#DC2626]'
        }`}>
          {conv.score}/100
        </span>
        {conv.category && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#F4F4F5] text-[#52525B] text-xs font-medium">
            {conv.category}
          </span>
        )}
      </div>

      {/* Summary */}
      {conv.summary && (
        <p className="text-sm text-[#52525B] leading-relaxed line-clamp-2">{conv.summary}</p>
      )}

      {/* View transcript */}
      <div className="pt-1 border-t border-[#F4F4F5]">
        <button
          onClick={() => onViewTranscript(conv)}
          className="text-xs text-[#A1A1AA] hover:text-[#52525B] transition-colors duration-150 underline-offset-2 hover:underline"
        >
          View transcript
        </button>
      </div>
    </div>
  )
}

export function SellerDashboardClient({ fullName, conversations }: Props) {
  const [transcriptConv, setTranscriptConv] = useState<SellerConversation | null>(null)

  const handleViewTranscript = useCallback((conv: SellerConversation) => {
    setTranscriptConv(conv)
  }, [])

  const total = conversations.length
  const passed = conversations.filter((c) => c.verdict === 'pass').length
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
  const avgScore = total > 0
    ? Math.round(conversations.reduce((sum, c) => sum + (c.score ?? 0), 0) / total)
    : 0

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav fullName={fullName} variant="seller" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Total outreach"
            value={total}
            sub="all time"
            accent="#09090B"
          />
          <StatCard
            label="Pass rate"
            value={total > 0 ? `${passRate}%` : '—'}
            sub={`${passed} approved`}
            accent="#10B981"
          />
          <StatCard
            label="Average score"
            value={total > 0 ? avgScore : '—'}
            sub="out of 100"
            accent="#0EA5E9"
          />
        </div>

        {/* Conversation list */}
        <div>
          <h2 className="text-base font-semibold text-[#09090B] mb-4">Your outreach history</h2>

          {conversations.length === 0 ? (
            <div className="py-20 text-center">
              <ShieldCheck className="w-8 h-8 mx-auto mb-3 text-[#E4E4E7]" strokeWidth={1.5} />
              <p className="text-sm text-[#A1A1AA] max-w-xs mx-auto">
                You haven&apos;t contacted anyone through ProaShield yet. Find an exec&apos;s ProaShield link to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {conversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  onViewTranscript={handleViewTranscript}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <TranscriptModal
        conversation={transcriptConv}
        onClose={() => setTranscriptConv(null)}
      />
    </div>
  )
}

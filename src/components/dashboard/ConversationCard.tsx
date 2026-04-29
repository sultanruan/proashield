'use client'

import { useState } from 'react'

export type DashboardConversation = {
  id: string
  sender_name: string
  sender_company: string
  sender_email: string
  verdict: 'pass' | 'hold' | 'fail'
  status: 'pending' | 'passed' | 'failed'
  score: number
  category: string
  summary: string
  reason: string
  transcript: { role: 'user' | 'assistant'; content: string }[]
  created_at: string
  resolved_at: string | null
}

interface ConversationCardProps {
  conversation: DashboardConversation
  tab: 'pending' | 'passed' | 'failed'
  onPass: (id: string, senderName: string) => void
  onDismiss: (id: string) => void
  onRecover: (id: string) => void
  onViewTranscript: (conv: DashboardConversation) => void
}

const CATEGORY_COLORS = [
  '#0EA5E9', '#8B5CF6', '#EC4899', '#F59E0B',
  '#10B981', '#6366F1', '#EF4444', '#14B8A6',
]

function categoryColor(cat: string): string {
  let hash = 0
  for (const c of cat) hash = ((hash << 5) - hash) + c.charCodeAt(0)
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
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

function ScoreBadge({ score }: { score: number }) {
  const { bg, text } =
    score >= 70
      ? { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' }
      : score >= 40
      ? { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]' }
      : { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {score}/100
    </span>
  )
}

export function ConversationCard({
  conversation: conv,
  tab,
  onPass,
  onDismiss,
  onRecover,
  onViewTranscript,
}: ConversationCardProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const avatarColor = categoryColor(conv.category || conv.sender_name || 'x')
  const initials = conv.sender_name
    ? conv.sender_name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
    : '?'

  async function handlePass() {
    setLoading('pass')
    await onPass(conv.id, conv.sender_name)
    setLoading(null)
  }

  async function handleDismiss() {
    setLoading('dismiss')
    await onDismiss(conv.id)
    setLoading(null)
  }

  async function handleRecover() {
    setLoading('recover')
    await onRecover(conv.id)
    setLoading(null)
  }

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] p-5 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-sm"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          {/* Name + company */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#09090B] truncate">
                {conv.sender_name || 'Anonymous'}
              </span>
              <ScoreBadge score={conv.score} />
            </div>
            <p className="text-xs text-[#A1A1AA] truncate mt-0.5">
              {conv.sender_company || 'No company'}
            </p>
          </div>
        </div>
        {/* Right: category + time */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {conv.category && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4F4F5] text-[#52525B] text-xs font-medium">
              {conv.category}
            </span>
          )}
          <span className="text-xs text-[#A1A1AA]">{timeAgo(conv.created_at)}</span>
        </div>
      </div>

      {/* Summary */}
      {conv.summary && (
        <p className="text-sm text-[#52525B] leading-relaxed line-clamp-3">{conv.summary}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#F4F4F5]">
        {tab === 'pending' && (
          <>
            <button
              onClick={handlePass}
              disabled={loading !== null}
              className="px-4 py-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading === 'pass' ? 'Passing…' : 'Pass'}
            </button>
            <button
              onClick={handleDismiss}
              disabled={loading !== null}
              className="px-4 py-1.5 bg-white border border-[#E4E4E7] hover:bg-[#F4F4F5] text-[#52525B] text-xs font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading === 'dismiss' ? 'Dismissing…' : 'Dismiss'}
            </button>
          </>
        )}

        {tab === 'failed' && (
          <button
            onClick={handleRecover}
            disabled={loading !== null}
            className="px-4 py-1.5 bg-white border border-[#E4E4E7] hover:bg-[#F4F4F5] text-[#52525B] text-xs font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading === 'recover' ? 'Moving…' : 'Recover'}
          </button>
        )}

        <button
          onClick={() => onViewTranscript(conv)}
          className="text-xs text-[#A1A1AA] hover:text-[#52525B] transition-colors duration-150 ml-auto underline-offset-2 hover:underline"
        >
          View transcript
        </button>
      </div>
    </div>
  )
}

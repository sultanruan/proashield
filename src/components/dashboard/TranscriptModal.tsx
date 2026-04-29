'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type Conversation = {
  sender_name: string
  sender_company: string
  verdict: 'pass' | 'hold' | 'fail'
  score: number
  transcript: Message[]
}

interface TranscriptModalProps {
  conversation: Conversation | null
  onClose: () => void
}

const VERDICT_CONFIG = {
  pass: { label: 'Passed', bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' },
  hold: { label: 'Held', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]' },
  fail: { label: 'Declined', bg: 'bg-[#F9FAFB]', text: 'text-[#6B7280]' },
}

export function TranscriptModal({ conversation, onClose }: TranscriptModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (conversation) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [conversation, onClose])

  if (!conversation) return null

  const vc = VERDICT_CONFIG[conversation.verdict]
  const messages = conversation.transcript.filter((m) => m.content.trim())

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Panel */}
      <div
        className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-xl border border-[#E4E4E7] shadow-xl flex flex-col"
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#E4E4E7] shrink-0">
          <div>
            <p className="text-sm font-semibold text-[#09090B]">
              {conversation.sender_name || 'Anonymous'}
            </p>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              {conversation.sender_company || 'No company'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
          {messages.length === 0 && (
            <p className="text-sm text-[#A1A1AA] text-center py-8">No transcript available.</p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0EA5E9] text-white rounded-tr-sm'
                    : 'bg-[#F4F4F5] text-[#09090B] rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with verdict */}
        <div className="px-5 py-3.5 border-t border-[#E4E4E7] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#A1A1AA]">Score: {conversation.score}/100</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${vc.bg} ${vc.text}`}>
            {vc.label}
          </span>
        </div>
      </div>
    </div>
  )
}

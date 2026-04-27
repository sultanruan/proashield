'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Send, ShieldCheck } from 'lucide-react'
import type { ExecProfile, ChatMessage, VerdictResult } from '../types'

interface Props {
  profile: ExecProfile
  userId: string | null
  onBack: () => void
}

function parseVerdict(text: string): VerdictResult | null {
  const match = text.match(/<<<VERDICT>>>([\s\S]+?)<<<END_VERDICT>>>/)
  if (!match) return null
  const block = match[1]
  const verdict = block.match(/VERDICT:\s*(PASS|HOLD|FAIL)/)?.[1] as 'PASS' | 'HOLD' | 'FAIL' | undefined
  const score = parseInt(block.match(/SCORE:\s*(\d+)/)?.[1] ?? '0', 10)
  const category = block.match(/CATEGORY:\s*(.+)/)?.[1]?.trim() ?? ''
  const summary = block.match(/SUMMARY:\s*(.+)/)?.[1]?.trim() ?? ''
  const reason = block.match(/REASON:\s*(.+)/)?.[1]?.trim() ?? ''
  if (!verdict) return null
  return { verdict, score, category, summary, reason }
}

function stripVerdict(text: string): string {
  return text.replace(/<<<VERDICT>>>[\s\S]*?<<<END_VERDICT>>>/g, '').trim()
}

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-[#F4F4F5] rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA] animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '800ms' }}
        />
      ))}
    </div>
  )
}

// ─── Verdict card ─────────────────────────────────────────────────────────────

function VerdictCard({ verdict, firstName }: { verdict: VerdictResult; firstName: string }) {
  const configs = {
    PASS: {
      icon: '✅',
      bg: 'bg-[#ECFDF5] border-[#A7F3D0]',
      title: `Your message has been forwarded to ${firstName}`,
      subtitle: 'They typically review approved contacts within 1-2 business days.',
    },
    HOLD: {
      icon: '🕐',
      bg: 'bg-[#FFFBEB] border-[#FDE68A]',
      title: `Your message has been added to ${firstName}'s review queue`,
      subtitle: 'They review held messages weekly.',
    },
    FAIL: {
      icon: null,
      bg: 'bg-[#F9FAFB] border-[#E4E4E7]',
      title: `Thanks for reaching out. Unfortunately this doesn't seem like a strong fit for ${firstName} right now.`,
      subtitle: verdict.reason,
    },
  }
  const c = configs[verdict.verdict]

  return (
    <div className={`rounded-xl border px-5 py-4 ${c.bg}`}>
      <div className="flex items-start gap-3">
        {c.icon && <span className="text-lg shrink-0 mt-0.5">{c.icon}</span>}
        <div>
          <p className="text-sm font-semibold text-[#09090B] leading-snug">{c.title}</p>
          <p className="mt-1 text-sm text-[#52525B]">{c.subtitle}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main ChatView ─────────────────────────────────────────────────────────────

export function ChatView({ profile, userId, onBack }: Props) {
  const firstName = profile.full_name.split(' ')[0]
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [verdict, setVerdict] = useState<VerdictResult | null>(null)
  const [error, setError] = useState('')
  const [conversationSaved, setConversationSaved] = useState(false)
  const [systemPromptSnapshot, setSystemPromptSnapshot] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, isTyping, scrollToBottom])

  const callAPI = useCallback(async (msgsToSend: ChatMessage[], isInit = false) => {
    setIsSending(true)
    setIsTyping(true)
    setError('')

    try {
      const apiMessages = msgsToSend.map(({ role, content }) => ({ role, content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          username: profile.username,
          isInit,
        }),
      })

      if (response.status === 429) {
        setError("You've already had a conversation with this executive in the last 24 hours.")
        setIsTyping(false)
        setIsSending(false)
        return
      }

      if (!response.ok) throw new Error('API error')

      // Capture system prompt snapshot from header (set by route)
      const promptHeader = response.headers.get('x-prompt-snapshot')
      if (promptHeader && !systemPromptSnapshot) {
        setSystemPromptSnapshot(decodeURIComponent(promptHeader))
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let firstChunk = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk

        if (firstChunk) {
          setIsTyping(false)
          firstChunk = false
        }
        setStreamingContent(fullContent)
      }

      const parsedVerdict = parseVerdict(fullContent)
      const cleanContent = stripVerdict(fullContent)

      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: cleanContent,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStreamingContent('')

      if (parsedVerdict) {
        setVerdict(parsedVerdict)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setIsTyping(false)
    } finally {
      setIsSending(false)
      setIsTyping(false)
    }
  }, [profile.username, systemPromptSnapshot])

  // Init conversation on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const trigger: ChatMessage = { id: nanoid(), role: 'user', content: 'Hi', hidden: true }
    setMessages([trigger])
    callAPI([trigger], true)
  }, [callAPI])

  // Save conversation when verdict is received
  useEffect(() => {
    if (!verdict || conversationSaved) return
    setConversationSaved(true)

    const allMessages = messages
    const transcript = allMessages
      .filter((m) => !m.hidden)
      .map(({ role, content }) => ({ role, content }))

    fetch('/api/conversations/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: profile.username,
        verdict: verdict.verdict.toLowerCase(),
        score: verdict.score,
        category: verdict.category,
        summary: verdict.summary,
        reason: verdict.reason,
        transcript,
        prompt_snapshot: systemPromptSnapshot,
        seller_id: userId,
      }),
    }).catch(() => {})
  }, [verdict, conversationSaved, messages, profile.username, systemPromptSnapshot, userId])

  async function handleSend() {
    const text = inputValue.trim()
    if (!text || isSending || verdict) return

    const userMessage: ChatMessage = { id: nanoid(), role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    await callAPI(newMessages)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleBack() {
    const visibleMessages = messages.filter((m) => !m.hidden)
    if (visibleMessages.length > 1 && !verdict) {
      if (!window.confirm('Leave this conversation? Your progress will be lost.')) return
    }
    onBack()
  }

  const displayMessages = messages.filter((m) => !m.hidden)

  return (
    <div className="flex flex-col bg-[#FAFAFA]" style={{ height: '100dvh' }}>
      {/* Header */}
      <header className="shrink-0 h-14 bg-white border-b border-[#E4E4E7] flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="p-1.5 -ml-1.5 rounded-lg text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors duration-150"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#0EA5E9] flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-xs">
              {profile.full_name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#09090B] truncate leading-tight">
              {profile.full_name}
            </p>
            <p className="text-xs text-[#A1A1AA] truncate leading-tight">
              {profile.job_title}{profile.company_name ? ` · ${profile.company_name}` : ''}
            </p>
          </div>
        </div>

        <div className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD]">
          <ShieldCheck className="w-3 h-3 text-[#0EA5E9]" strokeWidth={2} />
          <span className="text-[10px] font-medium text-[#0369A1]">Proa</span>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0EA5E9] text-white rounded-tr-sm'
                  : 'bg-[#F4F4F5] text-[#09090B] rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-[#F4F4F5] text-[#09090B] text-sm leading-relaxed">
              {stripVerdict(streamingContent)}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <TypingDots />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <p className="text-xs text-red-500 px-3 py-2 bg-red-50 rounded-lg">{error}</p>
          </div>
        )}

        {/* Verdict card */}
        {verdict && (
          <div className="flex flex-col gap-4 mt-2">
            <VerdictCard verdict={verdict} firstName={firstName} />

            <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] px-5 py-4 text-center">
              <p className="text-sm text-[#52525B]">
                Want your own Proa Shield? Protect your time too.
              </p>
              <a
                href="https://proashield.com"
                className="mt-3 inline-block bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors duration-150 active:scale-[0.98]"
              >
                Get ProaShield free →
              </a>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      {!verdict && (
        <div className="shrink-0 bg-white border-t border-[#E4E4E7] px-4 py-3 flex items-end gap-2.5"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            rows={1}
            disabled={isSending}
            className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-[#E4E4E7] bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-shadow duration-150 disabled:opacity-50 overflow-hidden leading-relaxed"
            style={{ minHeight: '44px' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="shrink-0 w-10 h-10 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white flex items-center justify-center transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

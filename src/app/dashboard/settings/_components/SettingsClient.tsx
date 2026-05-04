'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'

interface SettingsClientProps {
  initialProfessionalContext: string
  initialOutreachProfile: string
  initialCurrentFocus: string
  initialSummary: string | null
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

function Textarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#09090B]">{label}</label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-0 focus:border-transparent transition-shadow duration-150 resize-none leading-relaxed"
      />
    </div>
  )
}

export function SettingsClient({
  initialProfessionalContext,
  initialOutreachProfile,
  initialCurrentFocus,
  initialSummary,
}: SettingsClientProps) {
  const [professionalContext, setProfessionalContext] = useState(initialProfessionalContext)
  const [outreachProfile, setOutreachProfile] = useState(initialOutreachProfile)
  const [currentFocus, setCurrentFocus] = useState(initialCurrentFocus)
  const [summary, setSummary] = useState<string | null>(initialSummary)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, type: Toast['type'] = 'success') {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }

  async function handleSaveAndRegenerate() {
    setLoading(true)
    try {
      const res = await fetch('/api/exec/regenerate-shield', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ professional_context: professionalContext, outreach_profile: outreachProfile, current_focus: currentFocus }),
      })

      if (!res.ok) throw new Error('Failed')

      const { summary: newSummary } = await res.json()
      setSummary(newSummary)
      addToast('Shield profile saved and regenerated.')
    } catch {
      addToast('Something went wrong. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Section 1 — Shield Profile */}
      <section>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#09090B]">Shield Profile</h1>
          <p className="mt-1 text-sm text-[#52525B]">
            Tell your AI what kind of outreach is relevant to you. This shapes every screening decision.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E4E4E7] p-6 shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] flex flex-col gap-5">
          <Textarea
            label="Who you are"
            placeholder="Your role, background, what you're responsible for..."
            value={professionalContext}
            onChange={setProfessionalContext}
          />
          <Textarea
            label="What good outreach looks like"
            placeholder="What kind of vendors, partnerships or contacts are relevant to you..."
            value={outreachProfile}
            onChange={setOutreachProfile}
          />
          <Textarea
            label="What you're focused on right now"
            placeholder="Current priorities, active projects, what you're evaluating this quarter..."
            value={currentFocus}
            onChange={setCurrentFocus}
          />

          <div className="pt-1">
            <button
              onClick={handleSaveAndRegenerate}
              disabled={loading}
              className="w-full sm:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? 'Regenerating…' : 'Save & Regenerate Shield'}
            </button>
          </div>
        </div>
      </section>

      {/* Section 2 — Shield Summary */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#09090B]">Your Shield Summary</h2>
          <p className="mt-1 text-sm text-[#52525B]">
            What your AI currently understands about you — and uses to screen every sender.
          </p>
        </div>

        {summary ? (
          <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] overflow-hidden flex">
            <div className="w-[3px] bg-[#0EA5E9] shrink-0" />
            <div className="flex-1 p-6">
              <div className="flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5E9]" strokeWidth={2} />
                <p className="text-[11px] font-medium text-[#A1A1AA] uppercase tracking-wide">
                  What your AI understands about you
                </p>
              </div>
              <p className="text-sm text-[#52525B] leading-relaxed">{summary}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E4E4E7] p-6 shadow-[0_1px_2px_0_rgb(0,0,0,0.05)]">
            <p className="text-sm text-[#A1A1AA]">
              Complete your profile above to generate your Shield summary.
            </p>
          </div>
        )}
      </section>

      {/* Toast stack */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium shadow-md pointer-events-auto ${
              t.type === 'error'
                ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                : 'bg-[#09090B] text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </main>
  )
}

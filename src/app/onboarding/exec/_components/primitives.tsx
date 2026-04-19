'use client'

import { ArrowLeft } from 'lucide-react'

// ─── Field wrapper ────────────────────────────────────────────────────────────

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#09090B]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#A1A1AA]">{hint}</p>}
    </div>
  )
}

// ─── Text input ───────────────────────────────────────────────────────────────

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-0 focus:border-transparent transition-shadow duration-150"
    />
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-0 focus:border-transparent transition-shadow duration-150 resize-none leading-relaxed"
    />
  )
}

// ─── Inline error message ─────────────────────────────────────────────────────

export function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-500">{message}</p>
}

// ─── Step header ──────────────────────────────────────────────────────────────

export function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-[22px] font-semibold text-[#09090B] tracking-tight leading-snug">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-[#52525B] leading-relaxed">{subtitle}</p>
    </div>
  )
}

// ─── Section title (used within a step for sub-sections) ─────────────────────

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-[#09090B] mt-6 mb-3">{children}</p>
  )
}

// ─── Step footer (back + continue/skip) ──────────────────────────────────────

interface StepFooterProps {
  onBack?: () => void
  onContinue: () => void
  continueLabel?: string
  continueDisabled?: boolean
  loading?: boolean
  onSkip?: () => void
}

export function StepFooter({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  loading = false,
  onSkip,
}: StepFooterProps) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E4E4E7]">
      {/* Back */}
      <div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-[#52525B] hover:text-[#09090B] transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <span />
        )}
      </div>

      {/* Right side: skip + continue */}
      <div className="flex items-center gap-4">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-[#A1A1AA] hover:text-[#52525B] transition-colors duration-150 underline-offset-4 hover:underline"
          >
            Skip for now
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled || loading}
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? 'Saving…' : continueLabel}
        </button>
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { AiStructuredProfile } from '../types'

// ─── Loading screen ───────────────────────────────────────────────────────────

export function SynthesisLoadingScreen() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-col items-center gap-5 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center"
        >
          <ShieldCheck className="w-8 h-8 text-[#0EA5E9]" strokeWidth={1.5} />
        </motion.div>
        <div>
          <p className="text-[17px] font-semibold text-[#09090B]">Setting up your AI…</p>
          <p className="text-sm text-[#52525B] mt-1">This takes a few seconds</p>
        </div>
      </motion.div>
    </main>
  )
}

// ─── Summary screen ───────────────────────────────────────────────────────────

interface SummaryScreenProps {
  profile: AiStructuredProfile
  onActivate: () => void
  onEdit: () => void
}

export function SynthesisSummaryScreen({ profile, onActivate, onEdit }: SummaryScreenProps) {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-[600px] mx-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] mb-4">
            <ShieldCheck className="w-6 h-6 text-[#10B981]" strokeWidth={2} />
          </div>
          <h1 className="text-[22px] font-semibold text-[#09090B] tracking-tight">
            Here's what your AI knows about you
          </h1>
          <p className="mt-1.5 text-sm text-[#52525B]">
            This is how Proa will represent you. You can always refine this in AI Control.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Key context */}
          <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] overflow-hidden">
            <div className="flex">
              <div className="w-1 shrink-0 bg-[#0EA5E9]" />
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-[#0EA5E9] uppercase tracking-wider mb-2">Summary</p>
                <p className="text-sm text-[#09090B] leading-relaxed">{profile.key_context}</p>
              </div>
            </div>
          </div>

          {/* Objectives */}
          {profile.objectives.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] px-5 py-4">
              <p className="text-xs font-semibold text-[#52525B] uppercase tracking-wider mb-3">Current objectives</p>
              <ol className="flex flex-col gap-2">
                {profile.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#F4F4F5] text-[#52525B] text-xs font-semibold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-[#09090B] leading-relaxed">{obj}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Accepted / Rejected categories */}
          {(profile.accepted_categories.length > 0 || profile.rejected_categories.length > 0) && (
            <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] px-5 py-4">
              <p className="text-xs font-semibold text-[#52525B] uppercase tracking-wider mb-3">Outreach categories</p>
              {profile.accepted_categories.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-[#52525B] mb-2">Will pass through</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.accepted_categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.rejected_categories.length > 0 && (
                <div>
                  <p className="text-xs text-[#52525B] mb-2">Will be filtered out</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.rejected_categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2.5 py-0.5 rounded-full bg-[#F9FAFB] text-[#6B7280] text-xs font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onActivate}
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors duration-150 active:scale-[0.98] inline-flex items-center gap-2"
          >
            Activate my Shield →
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="text-sm text-[#A1A1AA] hover:text-[#52525B] transition-colors duration-150 underline-offset-4 hover:underline"
          >
            Edit my answers
          </button>
        </div>
      </motion.div>
    </main>
  )
}

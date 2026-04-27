'use client'

import { useState } from 'react'
import { OnboardingData, detectRole } from '../types'
import { Field, Textarea, StepHeader, StepFooter, ErrorMsg } from './primitives'

const PLACEHOLDERS: Record<ReturnType<typeof detectRole>, string> = {
  ceo: "e.g. I'm the CEO of a 200-person fintech company, Series B, based in Madrid. We build payment infrastructure for SMEs across Southern Europe. I manage a leadership team of 8 and report to the board. We're growing fast — doubled headcount last year and now preparing for Series C.",
  cto: "e.g. I lead a 45-person engineering team building a B2B SaaS platform on AWS. We're a Series C company in the HR tech space. Our stack is TypeScript, React, PostgreSQL, and Kubernetes. I own the full technical roadmap and report directly to the CEO.",
  cmo: "e.g. I run marketing for a fast-growing e-commerce brand, ~$50M ARR. Team of 12, mostly performance and content. We're heavy on paid social and SEO. I own brand, demand gen, and product marketing and report to the CEO.",
  cfo: "e.g. I'm the CFO of a PE-backed manufacturing company, €80M revenue. I manage a team of 6 across FP&A, accounting, and treasury. We're preparing for a potential exit in 18-24 months so compliance and reporting quality are top priorities.",
  default: "e.g. Describe your role, your company, your team size, the industry you're in, and anything that gives context about your professional world. The more specific, the better your AI will represent you.",
}

const MIN_CHARS = 50

interface Props {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step2ProfessionalContext({ data, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState('')

  const role = detectRole(data.jobTitle)
  const charCount = data.professionalContext.trim().length

  function handleContinue() {
    if (charCount < MIN_CHARS) {
      setError(`Please add a bit more detail (${MIN_CHARS - charCount} more characters).`)
      return
    }
    setError('')
    onNext()
  }

  return (
    <>
      <StepHeader
        title="Tell us about your professional context"
        subtitle="The more context your AI has, the better it protects you."
      />

      <Field label="Describe yourself and your company in your own words">
        <Textarea
          placeholder={PLACEHOLDERS[role]}
          rows={7}
          value={data.professionalContext}
          onChange={(e) => {
            onChange({ professionalContext: e.target.value })
            if (error && e.target.value.trim().length >= MIN_CHARS) setError('')
          }}
        />
        <div className="flex items-start justify-between gap-2">
          <ErrorMsg message={error} />
          <span className={`text-xs ml-auto shrink-0 ${charCount >= MIN_CHARS ? 'text-[#A1A1AA]' : 'text-[#A1A1AA]'}`}>
            {charCount < MIN_CHARS ? `${MIN_CHARS - charCount} more to go` : `${charCount} chars`}
          </span>
        </div>
      </Field>

      <StepFooter onBack={onBack} onContinue={handleContinue} />
    </>
  )
}

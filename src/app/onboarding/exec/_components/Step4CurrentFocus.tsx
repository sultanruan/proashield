'use client'

import { useState } from 'react'
import { OnboardingData, detectRole } from '../types'
import { Field, Textarea, StepHeader, StepFooter, ErrorMsg } from './primitives'

const PLACEHOLDERS: Record<ReturnType<typeof detectRole>, string> = {
  ceo: "e.g. We're raising a Series B in the next 6 months, hiring a CFO and a Head of Sales, and expanding into the UK market. I'd welcome introductions to relevant investors, senior finance candidates, and potential UK distribution partners.",
  cto: "e.g. We're completing SOC2 Type II by Q3, evaluating a Kubernetes migration, and hiring 3 senior backend engineers in Go or Python. I'm open to security vendors and DevOps tooling that integrates with AWS and Datadog.",
  cmo: "e.g. Launching a rebrand in Q2, scaling paid acquisition to new markets, and looking for a better attribution tool. Open to brand agencies with B2B SaaS experience and analytics vendors with a strong HubSpot integration.",
  cfo: "e.g. Implementing a new FP&A tool, automating our AP process, and preparing for a board audit in September. Open to FP&A software vendors and AP automation tools. Not looking for banking products or insurance right now.",
  default: "e.g. What are you actively working on or evaluating? Where would you genuinely welcome a relevant introduction or vendor conversation? What problems are you trying to solve in the next 3-6 months?",
}

const MIN_CHARS = 30

interface Props {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step4CurrentFocus({ data, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState('')

  const role = detectRole(data.jobTitle)
  const charCount = data.currentFocus.trim().length

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
        title="What are you focused on right now?"
        subtitle="Your AI uses this to decide whether outreach is timely and relevant — not just generally interesting."
      />

      <Field label="What are your priorities this quarter? What would you actually welcome help with?">
        <Textarea
          placeholder={PLACEHOLDERS[role]}
          rows={7}
          value={data.currentFocus}
          onChange={(e) => {
            onChange({ currentFocus: e.target.value })
            if (error && e.target.value.trim().length >= MIN_CHARS) setError('')
          }}
        />
        <div className="flex items-start justify-between gap-2">
          <ErrorMsg message={error} />
          <span className="text-xs ml-auto shrink-0 text-[#A1A1AA]">
            {charCount < MIN_CHARS ? `${MIN_CHARS - charCount} more to go` : `${charCount} chars`}
          </span>
        </div>
      </Field>

      <StepFooter onBack={onBack} onContinue={handleContinue} />
    </>
  )
}

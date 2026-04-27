'use client'

import { useState } from 'react'
import { OnboardingData, detectRole } from '../types'
import { Field, Textarea, StepHeader, StepFooter, ErrorMsg } from './primitives'

const PLACEHOLDERS: Record<ReturnType<typeof detectRole>, string> = {
  ceo: "e.g. I get a lot of SaaS vendors pitching tools I don't need, recruiters trying to poach my team, and VCs who haven't done any research on us. I'm actually open to strategic partnerships and genuinely relevant investment conversations — but 99% of what I receive is noise. I hate generic copy-paste pitches more than anything.",
  cto: "e.g. Mostly dev tools, security vendors, and cloud providers. A lot of recruiting for roles I'm not hiring for. I'm open to security and infrastructure vendors right now because we're working on SOC2. I ignore anything that doesn't mention our stack specifically.",
  cmo: "e.g. Agencies pitching their services constantly, MarTech vendors, event invitations. I'm open to new analytics or automation tools but only if they integrate with HubSpot. I don't want to hear from PR agencies or media buyers — we handle that in-house.",
  cfo: "e.g. Lots of fintech and banking products, accounting software, and expense management tools. Also a lot of consultants. I'm evaluating FP&A tools right now so that's relevant. Multi-year contracts without a trial period are an automatic no.",
  default: "e.g. What types of outreach do you receive most? What do you actually want to hear about? What do you want to avoid at all costs? Any patterns that immediately make you delete something?",
}

const MIN_CHARS = 50

interface Props {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step3OutreachReality({ data, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState('')

  const role = detectRole(data.jobTitle)
  const charCount = data.outreachProfile.trim().length

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
        title="What lands in your inbox?"
        subtitle="Be honest — the good, the bad, and the annoying. Your AI needs to know what you're dealing with."
      />

      <Field label="Describe the outreach you receive and what you want to filter">
        <Textarea
          placeholder={PLACEHOLDERS[role]}
          rows={7}
          value={data.outreachProfile}
          onChange={(e) => {
            onChange({ outreachProfile: e.target.value })
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

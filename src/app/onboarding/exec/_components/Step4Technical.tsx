'use client'

import { OnboardingData } from '../types'
import { Field, Textarea, StepHeader, StepFooter } from './primitives'

interface Props {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step4Technical({ data, onChange, onNext, onBack }: Props) {
  return (
    <>
      <StepHeader
        title="Any technical requirements for vendors?"
        subtitle="Your AI will use this to filter out incompatible tools automatically."
      />

      <Field
        label="Technical stack & requirements"
        hint="Leave blank if you're happy to evaluate any tool."
      >
        <Textarea
          placeholder="e.g. We only evaluate tools that integrate with AWS, PostgreSQL, Datadog, and Slack. No tools requiring on-premise installation."
          rows={5}
          value={data.technicalRequirements}
          onChange={(e) => onChange({ technicalRequirements: e.target.value })}
        />
      </Field>

      <StepFooter
        onBack={onBack}
        onContinue={onNext}
        onSkip={() => {
          onChange({ technicalRequirements: '' })
          onNext()
        }}
      />
    </>
  )
}

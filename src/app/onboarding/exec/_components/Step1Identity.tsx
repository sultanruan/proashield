'use client'

import { useState } from 'react'
import { OnboardingData } from '../types'
import { Field, Input, Textarea, StepHeader, StepFooter, ErrorMsg } from './primitives'

interface Props {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
  onNext: () => void
}

type Errors = {
  fullName: string
  jobTitle: string
  companyName: string
  companyDescription: string
}

export function Step1Identity({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Errors>({
    fullName: '',
    jobTitle: '',
    companyName: '',
    companyDescription: '',
  })

  function validate(): boolean {
    const e: Errors = {
      fullName: data.fullName.trim() ? '' : 'Full name is required',
      jobTitle: data.jobTitle.trim() ? '' : 'Job title is required',
      companyName: data.companyName.trim() ? '' : 'Company name is required',
      companyDescription: data.companyDescription.trim() ? '' : 'Company description is required',
    }
    setErrors(e)
    return Object.values(e).every((v) => !v)
  }

  function handleContinue() {
    if (validate()) onNext()
  }

  return (
    <>
      <StepHeader
        title="Let's start with you"
        subtitle="Tell us who you are so Proa can represent you properly."
      />

      <div className="flex flex-col gap-4">
        <Field label="Full name">
          <Input
            placeholder="Sarah Chen"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
          />
          <ErrorMsg message={errors.fullName} />
        </Field>

        <Field label="Job title">
          <Input
            placeholder="VP of Engineering"
            value={data.jobTitle}
            onChange={(e) => onChange({ jobTitle: e.target.value })}
          />
          <ErrorMsg message={errors.jobTitle} />
        </Field>

        <Field label="Company name">
          <Input
            placeholder="Meridian"
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
          />
          <ErrorMsg message={errors.companyName} />
        </Field>

        <Field label="Company description">
          <Textarea
            placeholder="What does your company do? One or two sentences."
            rows={3}
            value={data.companyDescription}
            onChange={(e) => onChange({ companyDescription: e.target.value })}
          />
          <ErrorMsg message={errors.companyDescription} />
        </Field>
      </div>

      <StepFooter onContinue={handleContinue} />
    </>
  )
}

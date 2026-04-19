'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { OnboardingData, NotificationFrequency } from '../types'
import { Field, Input, StepHeader, StepFooter, ErrorMsg } from './primitives'

interface Props {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
  onBack: () => void
  onComplete: () => void
  saving: boolean
  saveError: string
}

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string; description: string }[] = [
  { value: 'realtime', label: 'Real-time', description: 'Notified every time someone passes' },
  { value: 'daily', label: 'Daily digest', description: 'One summary per day' },
  { value: 'weekly', label: 'Weekly digest', description: 'One summary per week' },
]

export function Step5Notifications({ data, onChange, onBack, onComplete, saving, saveError }: Props) {
  const [errors, setErrors] = useState({ email: '', sms: '', channel: '' })

  function validate(): boolean {
    const e = { email: '', sms: '', channel: '' }

    if (!data.notificationEmailEnabled && !data.notificationSmsEnabled) {
      e.channel = 'Enable at least one notification channel.'
    }
    if (data.notificationEmailEnabled && !data.notificationEmail.trim()) {
      e.email = 'Email address is required.'
    }
    if (data.notificationSmsEnabled && !data.notificationSms.trim()) {
      e.sms = 'Phone number is required.'
    }

    setErrors(e)
    return Object.values(e).every((v) => !v)
  }

  function handleComplete() {
    if (validate()) onComplete()
  }

  return (
    <>
      <StepHeader
        title="How should we reach you?"
        subtitle="We'll notify you when someone passes your AI screening."
      />

      <div className="flex flex-col gap-5">
        {/* Channels */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#09090B]">Notification channels</p>

          {/* In-app — always on */}
          <ChannelRow
            label="In-app"
            description="Always on — notifications in your dashboard"
            enabled={true}
            locked
            onToggle={() => {}}
          />

          {/* Email */}
          <ChannelRow
            label="Email"
            description="Receive an email for each pass"
            enabled={data.notificationEmailEnabled}
            onToggle={() => onChange({ notificationEmailEnabled: !data.notificationEmailEnabled })}
          />
          <AnimatePresence initial={false}>
            {data.notificationEmailEnabled && (
              <SlideDown key="email-input">
                <Field label="Email address">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={data.notificationEmail}
                    onChange={(e) => onChange({ notificationEmail: e.target.value })}
                  />
                  <ErrorMsg message={errors.email} />
                </Field>
              </SlideDown>
            )}
          </AnimatePresence>

          {/* SMS */}
          <ChannelRow
            label="SMS"
            description="Text message to your phone"
            enabled={data.notificationSmsEnabled}
            onToggle={() => onChange({ notificationSmsEnabled: !data.notificationSmsEnabled })}
          />
          <AnimatePresence initial={false}>
            {data.notificationSmsEnabled && (
              <SlideDown key="sms-input">
                <Field label="Phone number">
                  <Input
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={data.notificationSms}
                    onChange={(e) => onChange({ notificationSms: e.target.value })}
                  />
                  <ErrorMsg message={errors.sms} />
                </Field>
              </SlideDown>
            )}
          </AnimatePresence>

          {/* Slack — beta */}
          <ChannelRow
            label="Slack"
            description="Post to a Slack channel"
            enabled={false}
            disabled
            badge="Coming soon"
            onToggle={() => {}}
          />

          {/* WhatsApp — beta */}
          <ChannelRow
            label="WhatsApp"
            description="WhatsApp message"
            enabled={false}
            disabled
            badge="Coming soon"
            onToggle={() => {}}
          />

          <ErrorMsg message={errors.channel} />
        </div>

        {/* Frequency */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#09090B]">Notification frequency</p>
          <div className="flex flex-col gap-1.5">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ notificationFrequency: opt.value })}
                className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-150 ${
                  data.notificationFrequency === opt.value
                    ? 'border-[#0EA5E9] bg-[#F0F9FF]'
                    : 'border-[#E4E4E7] bg-white hover:border-[#D4D4D8]'
                }`}
              >
                <div
                  className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
                    data.notificationFrequency === opt.value
                      ? 'border-[#0EA5E9]'
                      : 'border-[#D4D4D8]'
                  }`}
                >
                  {data.notificationFrequency === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-[#0EA5E9]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#09090B]">{opt.label}</p>
                  <p className="text-xs text-[#52525B] mt-0.5">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {saveError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}
      </div>

      <StepFooter
        onBack={onBack}
        onContinue={handleComplete}
        continueLabel="Complete setup"
        loading={saving}
      />
    </>
  )
}

// ─── Channel toggle row ────────────────────────────────────────────────────────

function ChannelRow({
  label,
  description,
  enabled,
  locked,
  disabled,
  badge,
  onToggle,
}: {
  label: string
  description: string
  enabled: boolean
  locked?: boolean
  disabled?: boolean
  badge?: string
  onToggle: () => void
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors duration-150 ${
        disabled
          ? 'border-[#E4E4E7] bg-[#FAFAFA] opacity-50'
          : enabled
          ? 'border-[#E4E4E7] bg-white'
          : 'border-[#E4E4E7] bg-white'
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#09090B]">{label}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F4F4F5] text-[#A1A1AA] tracking-wide">
              {badge}
            </span>
          )}
          {locked && <Lock className="w-3 h-3 text-[#A1A1AA]" />}
        </div>
        <span className="text-xs text-[#A1A1AA] mt-0.5">{description}</span>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        onClick={disabled || locked ? undefined : onToggle}
        disabled={disabled || locked}
        aria-checked={enabled}
        role="switch"
        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
          enabled ? 'bg-[#0EA5E9]' : 'bg-[#E4E4E7]'
        } ${disabled || locked ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

// ─── Animated slide-down wrapper ──────────────────────────────────────────────

function SlideDown({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
      className="pl-0"
    >
      <div className="pt-1">{children}</div>
    </motion.div>
  )
}

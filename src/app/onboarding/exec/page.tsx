'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { Logo } from '@/components/Logo'
import { ProgressBar } from './_components/ProgressBar'
import { Step1Identity } from './_components/Step1Identity'
import { Step2Outreach } from './_components/Step2Outreach'
import { Step3Objectives } from './_components/Step3Objectives'
import { Step4Technical } from './_components/Step4Technical'
import { Step5Notifications } from './_components/Step5Notifications'
import { OnboardingData, createInitialData, generateUsername } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

const TOTAL_STEPS = 5

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

async function findAvailableUsername(
  supabase: SupabaseClient,
  base: string
): Promise<string> {
  const { data } = await supabase
    .from('exec_profiles')
    .select('username')
    .eq('username', base)
    .maybeSingle()

  if (!data) return base

  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`
    const { data: existing } = await supabase
      .from('exec_profiles')
      .select('username')
      .eq('username', candidate)
      .maybeSingle()
    if (!existing) return candidate
  }

  return `${base}-${Date.now()}`
}

export default function ExecOnboardingPage() {
  const router = useRouter()
  const [initializing, setInitializing] = useState(true)
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<OnboardingData>(createInitialData())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Auth guard + existing-profile check + email pre-fill
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/exec/login')
        return
      }

      const { data: profile } = await supabase
        .from('exec_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profile) {
        router.replace('/dashboard/exec')
        return
      }

      setData(createInitialData(user.email ?? ''))
      setInitializing(false)
    }

    init()
  }, [router])

  function updateData(updates: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...updates }))
  }

  function goNext() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  async function handleComplete() {
    setSaving(true)
    setSaveError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate unique username
      const base = generateUsername(data.fullName)
      const username = await findAvailableUsername(supabase, base)

      // Build JSONB fields
      const acceptedCategories = [
        ...data.categories
          .filter((c) => c.enabled)
          .map((c) => ({ name: c.name, notes: c.notes || undefined })),
        ...data.customCategories
          .filter((c) => c.name.trim())
          .map((c) => ({ name: c.name.trim(), notes: c.notes || undefined })),
      ]

      const rejectedCategories = data.categories
        .filter((c) => !c.enabled && !c.locked)
        .map((c) => ({ name: c.name }))

      const objectives = data.objectives
        .filter((o) => o.trim())
        .map((text) => ({ text }))

      // Insert exec profile
      const { error: profileError } = await supabase.from('exec_profiles').insert({
        user_id: user.id,
        username,
        job_title: data.jobTitle,
        company_name: data.companyName,
        company_description: data.companyDescription,
        outreach_description: data.outreachDescription,
        technical_requirements: data.technicalRequirements.trim() || null,
        accepted_categories: acceptedCategories,
        rejected_categories: rejectedCategories,
        objectives,
        green_flags: [],
        red_flags: [],
        notification_email: data.notificationEmailEnabled ? data.notificationEmail.trim() : '',
        notification_sms: data.notificationSmsEnabled ? data.notificationSms.trim() : null,
      })

      if (profileError) throw profileError

      // Update user full_name
      await supabase
        .from('users')
        .update({ full_name: data.fullName.trim() })
        .eq('id', user.id)

      router.push(`/dashboard/exec?welcome=1&username=${encodeURIComponent(username)}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  // Loading state while checking auth / existing profile
  if (initializing) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-5 h-5 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const stepProps = { data, onChange: updateData, onNext: goNext, onBack: goBack }

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:py-12">
      <div className="w-full max-w-[600px] mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Logo href="/" />
        </div>

        {/* Progress bar */}
        <ProgressBar current={step} total={TOTAL_STEPS} />

        {/* Step card */}
        <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="px-6 py-7 sm:px-8 sm:py-8"
            >
              {step === 1 && <Step1Identity {...stepProps} />}
              {step === 2 && <Step2Outreach {...stepProps} />}
              {step === 3 && <Step3Objectives {...stepProps} />}
              {step === 4 && <Step4Technical {...stepProps} />}
              {step === 5 && (
                <Step5Notifications
                  {...stepProps}
                  onComplete={handleComplete}
                  saving={saving}
                  saveError={saveError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

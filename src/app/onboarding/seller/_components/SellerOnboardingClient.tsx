'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'

const TOTAL_STEPS = 3

const CATEGORY_OPTIONS = [
  'SaaS', 'Consulting', 'Recruiting', 'Agency',
  'Hardware', 'Financial Services', 'Other',
]

const COMPANY_SIZE_OPTIONS = ['1–10', '11–50', '51–200', '201–1,000', '1,000+', 'Any']

interface Props {
  userId: string
  initialCompanyName: string
  initialCompanyEmail: string
}

interface StepData {
  // Step 1
  company_name: string
  company_url: string
  job_title: string
  // Step 2
  product_name: string
  product_description: string
  category: string
  category_other: string
  // Step 3
  icp_company_size: string
  icp_industries: string
  icp_buyer_title: string
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}
const stepTransition = { duration: 0.28, ease: 'easeInOut' as const }

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full h-[3px] bg-[#E4E4E7] rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-[#0EA5E9] rounded-full"
        animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#09090B]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#A1A1AA]">{hint}</p>}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-0 focus:border-transparent transition-shadow duration-150"
    />
  )
}

function Textarea({ maxLength, value, onChange, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { maxLength?: number }) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...rest}
        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[#09090B] text-sm placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-0 focus:border-transparent transition-shadow duration-150 resize-none leading-relaxed"
      />
      {maxLength && (
        <span className="absolute bottom-2.5 right-3 text-[10px] text-[#A1A1AA] pointer-events-none">
          {String(value ?? '').length}/{maxLength}
        </span>
      )}
    </div>
  )
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E4E7] bg-white text-[#09090B] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-0 focus:border-transparent transition-shadow duration-150 appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

export function SellerOnboardingClient({ userId, initialCompanyName, initialCompanyEmail }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState<StepData>({
    company_name: initialCompanyName,
    company_url: '',
    job_title: '',
    product_name: '',
    product_description: '',
    category: '',
    category_other: '',
    icp_company_size: '',
    icp_industries: '',
    icp_buyer_title: '',
  })

  function set<K extends keyof StepData>(key: K, value: StepData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function saveStep(fields: Partial<Record<string, unknown>>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('seller_profiles')
      .upsert({ user_id: userId, ...fields }, { onConflict: 'user_id' })
    return !error
  }

  async function handleNext() {
    setError('')
    setSaving(true)

    let fields: Partial<Record<string, unknown>> = {}

    if (step === 1) {
      if (!data.company_name.trim() || !data.job_title.trim()) {
        setError('Please fill in your company name and job title.')
        setSaving(false)
        return
      }
      fields = {
        company_name: data.company_name.trim(),
        company_url: data.company_url.trim() || null,
        job_title: data.job_title.trim(),
      }
    } else if (step === 2) {
      if (!data.product_name.trim() || !data.product_description.trim() || !data.category) {
        setError('Please fill in all fields.')
        setSaving(false)
        return
      }
      const category = data.category === 'Other' ? (data.category_other.trim() || 'Other') : data.category
      fields = {
        product_name: data.product_name.trim(),
        product_description: data.product_description.trim(),
        category,
      }
    } else if (step === 3) {
      if (!data.icp_company_size || !data.icp_industries.trim() || !data.icp_buyer_title.trim()) {
        setError('Please fill in all fields.')
        setSaving(false)
        return
      }
      fields = {
        icp_company_size: data.icp_company_size,
        icp_industries: data.icp_industries.trim(),
        icp_buyer_title: data.icp_buyer_title.trim(),
        onboarding_completed: true,
      }
    }

    const ok = await saveStep(fields)
    setSaving(false)

    if (!ok) {
      setError('Something went wrong. Please try again.')
      return
    }

    if (step === TOTAL_STEPS) {
      router.push('/dashboard/seller')
      return
    }

    setDirection(1)
    setStep((s) => s + 1)
  }

  function handleBack() {
    setError('')
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const stepTitles = [
    'Tell us about your company',
    'What do you offer?',
    'Who do you sell to?',
  ]

  const stepSubtitles = [
    'This helps executives understand who is reaching out.',
    'Be specific — it helps the AI evaluate your fit.',
    'Knowing your ICP helps match you with the right execs.',
  ]

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px] flex flex-col gap-8">
        {/* Progress */}
        <div className="flex flex-col gap-3">
          <ProgressBar step={step} />
          <p className="text-xs text-[#A1A1AA] font-medium">Step {step} of {TOTAL_STEPS}</p>
        </div>

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
              transition={stepTransition}
              className="p-7 flex flex-col gap-6"
            >
              {/* Header */}
              <div>
                <h1 className="text-[18px] font-semibold text-[#09090B] tracking-tight leading-snug">
                  {stepTitles[step - 1]}
                </h1>
                <p className="mt-1.5 text-sm text-[#52525B]">{stepSubtitles[step - 1]}</p>
              </div>

              {/* Fields */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <Field label="Company name">
                    <Input
                      placeholder="Acme Inc."
                      value={data.company_name}
                      onChange={(e) => set('company_name', e.target.value)}
                    />
                  </Field>
                  <Field label="Company website" hint="Optional">
                    <Input
                      placeholder="https://acme.com"
                      value={data.company_url}
                      onChange={(e) => set('company_url', e.target.value)}
                    />
                  </Field>
                  <Field label="Your role / job title">
                    <Input
                      placeholder="Account Executive"
                      value={data.job_title}
                      onChange={(e) => set('job_title', e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <Field label="Product or service name">
                    <Input
                      placeholder="e.g. Acme Analytics"
                      value={data.product_name}
                      onChange={(e) => set('product_name', e.target.value)}
                    />
                  </Field>
                  <Field label="What it does">
                    <Textarea
                      rows={3}
                      maxLength={300}
                      placeholder="Briefly describe what your product or service does and the problem it solves..."
                      value={data.product_description}
                      onChange={(e) => set('product_description', e.target.value)}
                    />
                  </Field>
                  <Field label="Category">
                    <Select
                      value={data.category}
                      onChange={(e) => set('category', e.target.value)}
                    >
                      <option value="">Select a category…</option>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                    {data.category === 'Other' && (
                      <Input
                        placeholder="Describe your category"
                        value={data.category_other}
                        onChange={(e) => set('category_other', e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <Field label="Ideal company size">
                    <Select
                      value={data.icp_company_size}
                      onChange={(e) => set('icp_company_size', e.target.value)}
                    >
                      <option value="">Select a range…</option>
                      {COMPANY_SIZE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Industries you focus on">
                    <Textarea
                      rows={2}
                      placeholder="e.g. SaaS, fintech, healthcare"
                      value={data.icp_industries}
                      onChange={(e) => set('icp_industries', e.target.value)}
                    />
                  </Field>
                  <Field label="Typical buyer title">
                    <Input
                      placeholder="e.g. CTO, VP Engineering"
                      value={data.icp_buyer_title}
                      onChange={(e) => set('icp_buyer_title', e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={saving}
                    className="text-sm text-[#A1A1AA] hover:text-[#52525B] transition-colors duration-150"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={saving}
                  className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {saving
                    ? 'Saving…'
                    : step === TOTAL_STEPS
                    ? 'Complete setup'
                    : 'Continue'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

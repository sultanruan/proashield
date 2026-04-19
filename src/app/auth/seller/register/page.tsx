'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'
import { createClient } from '@/lib/supabase'

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'live.com', 'protonmail.com',
]

export default function SellerRegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const domain = email.split('@')[1]?.toLowerCase()
    if (FREE_EMAIL_DOMAINS.includes(domain)) {
      setError('Please use your corporate email address.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, user_type: 'seller', phone },
        emailRedirectTo: `${window.location.origin}/onboarding/seller`,
      },
    })

    setLoading(false)
    if (error) setError(error.message)
    else setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12">
        <motion.div
          className="w-full max-w-[440px] flex flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="w-12 h-12 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#10B981]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[22px] font-semibold text-[#09090B]">Check your inbox</h2>
            <p className="mt-2 text-sm text-[#52525B] max-w-sm">
              We sent a verification link to{' '}
              <span className="font-medium text-[#09090B]">{email}</span>.
              Click it to activate your account.
            </p>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Request access to a screened executive."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full name">
          <Input
            id="fullName"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Field>

        <Field label="Corporate email">
          <Input
            id="email"
            type="email"
            placeholder="john@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Phone number">
          <Input
            id="phone"
            type="tel"
            placeholder="+1 555 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Field>

        <Field label="Password">
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <AnimatePresence>
          {error && (
            <motion.p
              className="text-xs text-red-500"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-[#A1A1AA]">
          Already have an account?{' '}
          <Link href="/auth/seller/login" className="text-[#0EA5E9] hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#09090B]">{label}</label>
      {children}
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

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <motion.div
        className="w-full max-w-[520px] flex flex-col items-center text-center gap-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#0EA5E9]" strokeWidth={2} />
          <span className="font-semibold text-[#09090B] tracking-tight text-[15px]">
            proa<span className="text-[#0EA5E9]">shield</span>
          </span>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-[32px] sm:text-[38px] font-semibold text-[#09090B] tracking-tight leading-tight">
            Your AI-powered{' '}
            <span className="text-[#0EA5E9]">outreach firewall</span>
          </h1>
          <p className="text-base text-[#52525B] max-w-[380px] leading-relaxed">
            Every inbound request goes through a 60-second AI screening conversation.
            You only see what truly matters.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/auth/exec/register"
            className="inline-flex items-center justify-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors duration-150 active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/seller/register"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F4F4F5] text-[#09090B] font-medium px-5 py-2.5 rounded-lg text-sm border border-[#E4E4E7] transition-colors duration-150"
          >
            I want to reach an executive
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-[#E4E4E7]" />

        {/* Sign in links */}
        <p className="text-sm text-[#A1A1AA]">
          Already have an account?{' '}
          <Link href="/auth/exec/login" className="text-[#0EA5E9] hover:underline underline-offset-4">
            Executive login
          </Link>
          {' · '}
          <Link href="/auth/seller/login" className="text-[#0EA5E9] hover:underline underline-offset-4">
            Seller login
          </Link>
        </p>
      </motion.div>
    </main>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Logo } from './Logo'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <motion.div
        className="w-full max-w-[440px] flex flex-col gap-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-[22px] font-semibold text-[#09090B] tracking-tight">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-[#52525B]">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-[#E4E4E7] p-7 shadow-[0_1px_2px_0_rgb(0,0,0,0.05)]">
          {children}
        </div>
      </motion.div>
    </main>
  )
}

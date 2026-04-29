'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

interface TopNavProps {
  fullName: string
  username: string
}

export function TopNav({ fullName, username }: TopNavProps) {
  const pathname = usePathname()
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <header className="h-14 bg-white border-b border-[#E4E4E7] flex items-center px-6 gap-4 shrink-0">
      {/* Left: logo + public URL */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Link href="/dashboard/exec" className="flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#0EA5E9]" strokeWidth={2} />
          <span className="font-semibold text-[#09090B] text-sm tracking-tight">
            proa<span className="text-[#0EA5E9]">shield</span>
          </span>
        </Link>
        <span className="text-[#E4E4E7] text-sm select-none">·</span>
        <span className="text-xs text-[#A1A1AA] truncate font-medium">
          proashield.com/{username}
        </span>
      </div>

      {/* Right: nav links + avatar */}
      <nav className="flex items-center gap-1">
        <Link
          href="/dashboard/exec"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            pathname === '/dashboard/exec'
              ? 'text-[#09090B] bg-[#F4F4F5]'
              : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5]'
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/settings"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            pathname === '/dashboard/settings'
              ? 'text-[#09090B] bg-[#F4F4F5]'
              : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5]'
          }`}
        >
          Settings
        </Link>
      </nav>

      {/* Avatar */}
      <div className="flex items-center gap-2 pl-2 border-l border-[#E4E4E7]">
        <div className="w-7 h-7 rounded-full bg-[#0EA5E9] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
        <span className="text-sm font-medium text-[#09090B] hidden sm:block">{fullName}</span>
      </div>
    </header>
  )
}

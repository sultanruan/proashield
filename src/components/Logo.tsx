import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 group">
      <ShieldCheck
        className="w-5 h-5 text-[#0EA5E9] transition-transform duration-200 group-hover:scale-110"
        strokeWidth={2}
      />
      <span className="font-semibold text-[#09090B] tracking-tight text-[15px]">
        proa<span className="text-[#0EA5E9]">shield</span>
      </span>
    </Link>
  )
}

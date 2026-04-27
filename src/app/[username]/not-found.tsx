import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0EA5E9]" strokeWidth={2} />
          <span className="font-semibold text-[#09090B] tracking-tight text-[15px]">
            proa<span className="text-[#0EA5E9]">shield</span>
          </span>
        </div>

        <div>
          <h1 className="text-[22px] font-semibold text-[#09090B] tracking-tight">
            This profile doesn't exist
          </h1>
          <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
            The link you followed might be outdated or the username may have changed.
          </p>
        </div>

        <Link
          href="/"
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors duration-150 active:scale-[0.98]"
        >
          Go to proashield.com
        </Link>
      </div>
    </main>
  )
}

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-[#52525B]">
          Step {current} of {total}
        </span>
        <span className="text-xs text-[#A1A1AA]">{pct}% complete</span>
      </div>
      <div className="h-[3px] bg-[#F4F4F5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0EA5E9] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

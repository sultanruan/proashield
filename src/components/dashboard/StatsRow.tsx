interface Stats {
  total: number
  passed: number
  held: number
  failed: number
  passRate: number
  topCategory: string
}

interface StatsRowProps {
  stats: Stats
}

export function StatsRow({ stats }: StatsRowProps) {
  const passW = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0
  const holdW = stats.total > 0 ? (stats.held / stats.total) * 100 : 0
  const failW = stats.total > 0 ? (stats.failed / stats.total) * 100 : 0

  return (
    <div className="space-y-3">
      {/* 4 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total outreach"
          value={stats.total}
          sub="last 30 days"
          accent="#09090B"
        />
        <StatCard
          label="Pass rate"
          value={`${stats.passRate}%`}
          sub={`${stats.passed} approved`}
          accent="#10B981"
        />
        <StatCard
          label="Held for review"
          value={stats.held}
          sub="pending action"
          accent="#F59E0B"
        />
        <StatCard
          label="Top category"
          value={stats.topCategory}
          sub="most common"
          accent="#0EA5E9"
          small
        />
      </div>

      {/* Proportion bar */}
      {stats.total > 0 && (
        <div className="flex rounded-full overflow-hidden h-1.5 bg-[#F4F4F5]">
          {passW > 0 && (
            <div style={{ width: `${passW}%`, backgroundColor: '#10B981' }} />
          )}
          {holdW > 0 && (
            <div style={{ width: `${holdW}%`, backgroundColor: '#F59E0B' }} />
          )}
          {failW > 0 && (
            <div style={{ width: `${failW}%`, backgroundColor: '#E4E4E7' }} />
          )}
        </div>
      )}

      {stats.total > 0 && (
        <div className="flex items-center gap-4">
          <Legend color="#10B981" label={`Pass ${stats.passed}`} />
          <Legend color="#F59E0B" label={`Hold ${stats.held}`} />
          <Legend color="#D4D4D8" label={`Fail ${stats.failed}`} />
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
  small = false,
}: {
  label: string
  value: string | number
  sub: string
  accent: string
  small?: boolean
}) {
  return (
    <div className="bg-[#F4F4F5] rounded-xl p-4">
      <p className="text-xs font-medium text-[#A1A1AA] mb-1">{label}</p>
      <p
        className={`font-bold text-[#09090B] leading-tight ${small ? 'text-lg truncate' : 'text-2xl'}`}
        style={{ color: accent === '#09090B' ? undefined : accent }}
      >
        {value || '—'}
      </p>
      <p className="text-xs text-[#A1A1AA] mt-0.5">{sub}</p>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-[#A1A1AA]">{label}</span>
    </div>
  )
}

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  accent?: 'green' | 'blue' | 'emerald' | 'purple' | 'yellow'
  trend?: { value: number; label: string }
}

const accentMap = {
  green: {
    iconBg: 'bg-green-500/15',
    iconColor: 'text-green-400',
    border: 'border-green-500/20',
    trendPos: 'text-green-400',
  },
  blue: {
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/20',
    trendPos: 'text-blue-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/20',
    trendPos: 'text-emerald-400',
  },
  purple: {
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    border: 'border-purple-500/20',
    trendPos: 'text-purple-400',
  },
  yellow: {
    iconBg: 'bg-yellow-500/15',
    iconColor: 'text-yellow-400',
    border: 'border-yellow-500/20',
    trendPos: 'text-yellow-400',
  },
}

export function KpiCard({ title, value, subtitle, icon: Icon, accent = 'green', trend }: KpiCardProps) {
  const styles = accentMap[accent]

  return (
    <div className={cn(
      'card p-5 flex flex-col gap-4 animate-fade-in card-hover',
      `border ${styles.border}`
    )}>
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-xl', styles.iconBg)}>
          <Icon size={20} className={styles.iconColor} />
        </div>
        {trend && (
          <span className={cn('text-xs font-medium', trend.value >= 0 ? styles.trendPos : 'text-red-400')}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-zinc-400 text-sm mt-0.5">{title}</p>
        {subtitle && <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

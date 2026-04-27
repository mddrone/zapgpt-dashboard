import type { StatusData } from '@/lib/types'
import { getStatusConfig } from '@/lib/utils'

const STATUS_ORDER = [
  'EM_ATENDIMENTO',
  'PROPOSTA_ENVIADA',
  'AGUARDANDO_SINAL',
  'COMPROVANTE_RECEBIDO',
  'FECHADO',
  'Perdido',
]

interface Props {
  data: StatusData[]
  total: number
}

export function StatusOverview({ data, total }: Props) {
  const statusMap = Object.fromEntries(data.map(d => [d.status, d.count]))

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {STATUS_ORDER.map(status => {
        const cfg = getStatusConfig(status)
        const count = statusMap[status] ?? 0
        const pct = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={status} className={`card p-4 ${cfg.bg} flex flex-col gap-1`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
              <span className={`text-xs font-medium ${cfg.color} leading-tight`}>{cfg.label}</span>
            </div>
            <p className="text-3xl font-bold text-zinc-100">{count}</p>
            <p className="text-xs text-zinc-500">{pct}% do total</p>
          </div>
        )
      })}
    </div>
  )
}

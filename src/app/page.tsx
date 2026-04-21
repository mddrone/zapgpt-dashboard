import { getLeads, computeMetricsFromLeads } from '@/lib/api'
import { KpiCard } from '@/components/dashboard/KpiCard'
import {
  LeadsPorMesChart,
  FunilConversaoChart,
  LeadsPorCategoriaChart,
  FechamentosVsLeadsChart,
} from '@/components/dashboard/Charts'
import { getStatusConfig } from '@/lib/utils'
import {
  Users,
  CalendarPlus,
  CheckCircle,
  TrendingUp,
  PhoneCall,
} from 'lucide-react'

export const revalidate = 60

export default async function DashboardPage() {
  const leads = await getLeads()
  const metrics = computeMetricsFromLeads(leads)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPI Cards */}
      <section>
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Visão Geral
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <KpiCard
            title="Total de Leads"
            value={metrics.totalLeads}
            icon={Users}
            accent="blue"
            subtitle="Todos os registros"
          />
          <KpiCard
            title="Leads Hoje"
            value={metrics.leadsHoje}
            icon={CalendarPlus}
            accent="blue"
            subtitle="Novos hoje"
          />
          <KpiCard
            title="Fechamentos"
            value={metrics.fechamentosEsteMes}
            icon={CheckCircle}
            accent="blue"
            subtitle="Este mês"
          />
          <KpiCard
            title="Conversão"
            value={`${metrics.taxaConversao}%`}
            icon={TrendingUp}
            accent="purple"
            subtitle="Fechados / Total"
          />
          <KpiCard
            title="Em Atendimento"
            value={metrics.leadsEmAtendimento}
            icon={PhoneCall}
            accent="yellow"
            subtitle="Ativos agora"
          />
        </div>
      </section>

      {/* Charts row 1 */}
      <section>
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Análise Temporal
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadsPorMesChart data={metrics.leadsPorMes} />
          <FechamentosVsLeadsChart data={metrics.fechamentosVsLeads} />
        </div>
      </section>

      {/* Charts row 2 */}
      <section>
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Distribuição
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FunilConversaoChart data={metrics.funilPorStatus} />
          <LeadsPorCategoriaChart data={metrics.leadsPorSegmento} />
        </div>
      </section>

      {/* Recent leads table preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
            Leads Recentes
          </h2>
          <a href="/leads" className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
            Ver todos →
          </a>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs">Nome</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs hidden md:table-cell">Segmento</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs hidden md:table-cell">Plano</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 8).map((lead, i) => {
                  const cfg = getStatusConfig(lead.Status_lead)
                  return (
                    <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-zinc-100 font-medium">{lead.Nome}</p>
                        <p className="text-zinc-500 text-xs">{lead.Celular}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-zinc-300 capitalize">{lead.Segmento || '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-zinc-400 text-xs">{lead.Plano || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

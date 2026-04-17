import { getLeads, computeMetricsFromLeads } from '@/lib/api'
import { KpiCard } from '@/components/dashboard/KpiCard'
import {
  LeadsPorMesChart,
  FunilConversaoChart,
  LeadsPorCategoriaChart,
  FechamentosVsLeadsChart,
} from '@/components/dashboard/Charts'
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
            accent="green"
            subtitle="Novos hoje"
          />
          <KpiCard
            title="Fechamentos"
            value={metrics.fechamentosEsteMes}
            icon={CheckCircle}
            accent="emerald"
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
          <LeadsPorCategoriaChart data={metrics.leadsPorCategoria} />
        </div>
      </section>

      {/* Recent leads table preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
            Leads Recentes
          </h2>
          <a href="/leads" className="text-green-400 text-xs hover:text-green-300 transition-colors">
            Ver todos →
          </a>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs">Nome</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs hidden md:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs">Status</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs hidden sm:table-cell">Cidade</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 8).map((lead, i) => {
                  const statusColors: Record<string, string> = {
                    EM_ATENDIMENTO: 'bg-blue-900/40 text-blue-300 border border-blue-700/50',
                    ORCAMENTO_ENVIADO: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50',
                    AGUARDANDO_SINAL: 'bg-orange-900/40 text-orange-300 border border-orange-700/50',
                    COMPROVANTE_RECEBIDO: 'bg-purple-900/40 text-purple-300 border border-purple-700/50',
                    FECHADO: 'bg-green-900/40 text-green-300 border border-green-700/50',
                    Agendado: 'bg-cyan-900/40 text-cyan-300 border border-cyan-700/50',
                    Parado: 'bg-zinc-900 text-zinc-400 border border-zinc-700/50',
                    Perdido: 'bg-red-900/40 text-red-300 border border-red-700/50',
                    Atendimento_humano: 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/50',
                  }

                  const statusLabels: Record<string, string> = {
                    EM_ATENDIMENTO: 'Em Atendimento',
                    ORCAMENTO_ENVIADO: 'Orçamento Enviado',
                    AGUARDANDO_SINAL: 'Aguardando Sinal',
                    COMPROVANTE_RECEBIDO: 'Comprovante',
                    FECHADO: 'Fechado',
                    Agendado: 'Agendado',
                    Parado: 'Parado',
                    Perdido: 'Perdido',
                    Atendimento_humano: 'Atend. Humano',
                  }

                  return (
                    <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-zinc-100 font-medium">{lead.Nome}</p>
                        <p className="text-zinc-500 text-xs">{lead.Telefone}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-zinc-300 capitalize">{lead.Categoria}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColors[lead.Status_lead] ?? 'bg-zinc-900 text-zinc-400'}`}>
                          {statusLabels[lead.Status_lead] ?? lead.Status_lead}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-zinc-400 text-xs">{lead.Cidade}</td>
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

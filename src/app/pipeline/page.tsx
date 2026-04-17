import { getLeads } from '@/lib/api'
import type { Lead, StatusLead } from '@/lib/types'
import { getStatusConfig, getCategoriaConfig, formatDate } from '@/lib/utils'
import { Calendar, Tag } from 'lucide-react'

export const revalidate = 60

// Normaliza os valores reais da planilha para os status do pipeline
function normalizeStatus(raw: string): string {
  const map: Record<string, string> = {
    // Valores reais da planilha
    'novo': 'EM_ATENDIMENTO',
    'Novo': 'EM_ATENDIMENTO',
    'em_atendimento': 'EM_ATENDIMENTO',
    'EM_ATENDIMENTO': 'EM_ATENDIMENTO',
    'orcamento_enviado': 'ORCAMENTO_ENVIADO',
    'ORCAMENTO_ENVIADO': 'ORCAMENTO_ENVIADO',
    'Orcamento_enviado': 'ORCAMENTO_ENVIADO',
    'aguardando': 'AGUARDANDO_SINAL',
    'AGUARDANDO_SINAL': 'AGUARDANDO_SINAL',
    'aguardando_sinal': 'AGUARDANDO_SINAL',
    'comprovante_recebido': 'AGUARDANDO_SINAL',
    'COMPROVANTE_RECEBIDO': 'AGUARDANDO_SINAL',
    'fechou': 'FECHADO',
    'Fechou': 'FECHADO',
    'FECHADO': 'FECHADO',
    'fechado': 'FECHADO',
    'perdido': 'Perdido',
    'Perdido': 'Perdido',
    'PERDIDO': 'Perdido',
    'Agendado': 'EM_ATENDIMENTO',
    'agendado': 'EM_ATENDIMENTO',
    'Atendimento_humano': 'EM_ATENDIMENTO',
    'atendimento_humano': 'EM_ATENDIMENTO',
    'Parado': 'Perdido',
    'parado': 'Perdido',
  }
  return map[raw] ?? raw
}

const PIPELINE_COLUMNS: { status: string; label: string; color: string; border: string }[] = [
  { status: 'EM_ATENDIMENTO', label: 'Em Atendimento', color: 'text-blue-400', border: 'border-blue-500/40' },
  { status: 'ORCAMENTO_ENVIADO', label: 'Orçamento Enviado', color: 'text-yellow-400', border: 'border-yellow-500/40' },
  { status: 'AGUARDANDO_SINAL', label: 'Aguardando Sinal', color: 'text-orange-400', border: 'border-orange-500/40' },
  { status: 'FECHADO', label: 'Fechado', color: 'text-green-400', border: 'border-green-500/40' },
  { status: 'Perdido', label: 'Perdido', color: 'text-red-400', border: 'border-red-500/40' },
]

function LeadCard({ lead }: { lead: Lead }) {
  const statusCfg = getStatusConfig(lead.Status_lead)
  const catCfg = getCategoriaConfig(lead.Categoria)

  return (
    <div className="bg-zinc-950/80 border border-zinc-800/50 rounded-lg p-3 space-y-2.5 hover:border-zinc-700 transition-all cursor-default">
      <div>
        <p className="text-slate-200 text-sm font-medium leading-snug">{lead.Nome}</p>
        <p className="text-zinc-500 text-xs">{lead.Telefone}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
          <Tag size={9} className="text-green-400" />
          {catCfg.emoji} {catCfg.label}
        </span>
      </div>

      {lead.Tipo_evento && (
        <p className="text-zinc-500 text-[11px]">{lead.Tipo_evento}</p>
      )}

      {lead.Data_evento && (
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <Calendar size={10} className="text-green-400 flex-shrink-0" />
          {formatDate(lead.Data_evento)}
        </div>
      )}

      {lead.Cidade && (
        <p className="text-[10px] text-zinc-700">{lead.Cidade}</p>
      )}
    </div>
  )
}

function KanbanColumn({
  status,
  label,
  color,
  border,
  leads,
}: {
  status: StatusLead
  label: string
  color: string
  border: string
  leads: Lead[]
}) {
  return (
    <div className="flex flex-col min-w-[240px] max-w-[280px] flex-shrink-0">
      {/* Column header */}
      <div className={`flex items-center justify-between mb-3 pb-3 border-b ${border}`}>
        <h3 className={`text-sm font-semibold ${color}`}>{label}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-900 border ${border} ${color}`}>
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20 border border-dashed border-zinc-800 rounded-lg">
            <p className="text-zinc-700 text-xs">Nenhum lead</p>
          </div>
        ) : (
          leads.map((lead, i) => <LeadCard key={i} lead={lead} />)
        )}
      </div>
    </div>
  )
}

export default async function PipelinePage() {
  const leads = await getLeads()

  const columnLeads = PIPELINE_COLUMNS.reduce((acc, col) => {
    acc[col.status] = leads.filter(l => normalizeStatus(l.Status_lead) === col.status)
    return acc
  }, {} as Record<string, Lead[]>)

  const totalPipeline = PIPELINE_COLUMNS.reduce((sum, col) => sum + (columnLeads[col.status]?.length ?? 0), 0)

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-zinc-400 text-xs">
          Pipeline de conversão — <span className="text-zinc-300">{totalPipeline} leads</span>
        </p>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_COLUMNS.map(col => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              color={col.color}
              border={col.border}
              leads={columnLeads[col.status] ?? []}
            />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-zinc-900">
        {PIPELINE_COLUMNS.map(col => (
          <div key={col.status} className="card p-3">
            <p className={`text-lg font-bold ${col.color}`}>{columnLeads[col.status]?.length ?? 0}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{col.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

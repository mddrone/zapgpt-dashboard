'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, ChevronRight, X } from 'lucide-react'
import type { Lead, StatusLead, Categoria } from '@/lib/types'
import { getStatusConfig, getCategoriaConfig, formatDate } from '@/lib/utils'
import { LeadModal } from './LeadModal'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'EM_ATENDIMENTO', label: 'Em Atendimento' },
  { value: 'ORCAMENTO_ENVIADO', label: 'Orçamento Enviado' },
  { value: 'AGUARDANDO_SINAL', label: 'Aguardando Sinal' },
  { value: 'COMPROVANTE_RECEBIDO', label: 'Comprovante Recebido' },
  { value: 'FECHADO', label: 'Fechado' },
  { value: 'Agendado', label: 'Agendado' },
  { value: 'Atendimento_humano', label: 'Atend. Humano' },
  { value: 'Parado', label: 'Parado' },
  { value: 'Perdido', label: 'Perdido' },
]

const CATEGORIA_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todas as categorias' },
  { value: 'casamento', label: 'Casamento' },
  { value: '15_anos', label: '15 Anos' },
  { value: 'aniversario', label: 'Aniversário' },
  { value: 'ensaio', label: 'Ensaio' },
  { value: 'infantil', label: 'Infantil' },
  { value: 'corporativo', label: 'Corporativo' },
  { value: 'outro', label: 'Outro' },
]

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const filtered = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = !search ||
        lead.Nome.toLowerCase().includes(search.toLowerCase()) ||
        lead.Telefone.includes(search)
      const matchStatus = !statusFilter || lead.Status_lead === statusFilter
      const matchCat = !categoriaFilter || lead.Categoria === categoriaFilter
      return matchSearch && matchStatus && matchCat
    })
  }, [leads, search, statusFilter, categoriaFilter])

  function handleLeadUpdate(updated: Lead) {
    setLeads(prev => prev.map(l => l.Telefone === updated.Telefone ? updated : l))
    setSelectedLead(updated)
  }

  const hasFilters = search || statusFilter || categoriaFilter

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex items-center">
            <Filter size={13} className="absolute left-3 text-zinc-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select-field pl-8 pr-8 appearance-none"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <select
            value={categoriaFilter}
            onChange={e => setCategoriaFilter(e.target.value)}
            className="select-field"
          >
            {CATEGORIA_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setCategoriaFilter('') }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
            >
              <X size={13} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <p className="text-zinc-500 text-xs">
        Exibindo <span className="text-zinc-300 font-medium">{filtered.length}</span> de {leads.length} leads
      </p>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Telefone</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Tipo Evento</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Data Evento</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wide hidden xl:table-cell">Últ. Interação</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((lead, i) => {
                  const statusCfg = getStatusConfig(lead.Status_lead)
                  const catCfg = getCategoriaConfig(lead.Categoria)
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedLead(lead)}
                      className="border-b border-zinc-800/30 hover:bg-zinc-900/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-zinc-100 font-medium">{lead.Nome}</p>
                        <p className="text-zinc-500 text-xs md:hidden">{lead.Telefone}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-zinc-400 text-xs">{lead.Telefone}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-zinc-400 text-xs">{lead.Tipo_evento || '—'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-zinc-400 text-xs">{formatDate(lead.Data_evento)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusCfg.bg} ${statusCfg.color} whitespace-nowrap`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} flex-shrink-0`} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-zinc-400 text-xs">
                          {catCfg.emoji} {catCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-zinc-400 text-xs">
                        {formatDate(lead.Ultima_interação)}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={15} className="text-zinc-700" />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  )
}

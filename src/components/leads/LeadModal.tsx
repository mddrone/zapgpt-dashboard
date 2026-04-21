'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Phone, Mail, Tag, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import type { Lead, StatusLead } from '@/lib/types'
import { getStatusConfig, getSegmentoConfig, formatDate } from '@/lib/utils'
import { updateLead } from '@/lib/api'

const ALL_STATUSES: StatusLead[] = [
  'EM_ATENDIMENTO',
  'DEMO_ENVIADA',
  'PROPOSTA_ENVIADA',
  'AGUARDANDO_PAGAMENTO',
  'FECHADO',
  'Atendimento_humano',
  'Parado',
  'Perdido',
]

interface LeadModalProps {
  lead: Lead
  onClose: () => void
  onUpdate?: (lead: Lead) => void
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-2 border-b border-zinc-800/40 last:border-0">
      <span className="text-zinc-500 text-xs">{label}</span>
      <span className="text-zinc-100 text-xs break-words">{value || '—'}</span>
    </div>
  )
}

function BooleanField({ label, value }: { label: string; value: string }) {
  const isYes = value === 'Sim' || value === 'sim' || value === 'true' || value === '1'
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
      <span className="text-zinc-500 text-xs">{label}</span>
      {isYes ? (
        <CheckCircle size={14} className="text-blue-400" />
      ) : (
        <XCircle size={14} className="text-zinc-700" />
      )}
    </div>
  )
}

export function LeadModal({ lead, onClose, onUpdate }: LeadModalProps) {
  const router = useRouter()
  const [editingStatus, setEditingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<StatusLead>(lead.Status_lead)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const statusCfg = getStatusConfig(lead.Status_lead)
  const segCfg = getSegmentoConfig(lead.Segmento)

  async function handleSaveStatus() {
    setSaving(true)
    try {
      await updateLead(lead.Celular, { Status_lead: selectedStatus })
      setSaveMsg('Status atualizado!')
      setEditingStatus(false)
      onUpdate?.({ ...lead, Status_lead: selectedStatus })
      router.refresh()
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('Erro ao atualizar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] bg-zinc-950 sm:rounded-xl border border-zinc-800/50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight truncate">{lead.Nome}</h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`badge ${statusCfg.bg} ${statusCfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
              <span className="text-zinc-500 text-xs">{segCfg.emoji} {segCfg.label}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/30">
              <Phone size={14} className="text-blue-400 mb-1.5" />
              <p className="text-zinc-500 text-[10px] uppercase tracking-wide">Celular</p>
              <p className="text-white text-xs font-medium mt-0.5">{lead.Celular}</p>
            </div>
            <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/30">
              <Mail size={14} className="text-blue-400 mb-1.5" />
              <p className="text-zinc-500 text-[10px] uppercase tracking-wide">E-mail</p>
              <p className="text-white text-xs font-medium mt-0.5">{lead.Email || '—'}</p>
            </div>
            <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/30">
              <Tag size={14} className="text-blue-400 mb-1.5" />
              <p className="text-zinc-500 text-[10px] uppercase tracking-wide">Plano</p>
              <p className="text-white text-xs font-medium mt-0.5">{lead.Plano || '—'}</p>
            </div>
            <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/30">
              <Tag size={14} className="text-blue-400 mb-1.5" />
              <p className="text-zinc-500 text-[10px] uppercase tracking-wide">Origem</p>
              <p className="text-white text-xs font-medium mt-0.5">{lead.Origem || '—'}</p>
            </div>
          </div>

          {/* Edit status */}
          <div className="bg-zinc-900/60 rounded-lg p-4 border border-zinc-800/30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Status do Lead</p>
              {!editingStatus && (
                <button
                  onClick={() => setEditingStatus(true)}
                  className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>

            {editingStatus ? (
              <div className="space-y-3">
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as StatusLead)}
                  className="select-field w-full"
                >
                  {ALL_STATUSES.map(s => {
                    const cfg = getStatusConfig(s)
                    return <option key={s} value={s}>{cfg.label}</option>
                  })}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveStatus}
                    disabled={saving}
                    className="btn-primary flex-1"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => { setEditingStatus(false); setSelectedStatus(lead.Status_lead) }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
                {saveMsg && (
                  <p className={`text-xs ${saveMsg.includes('Erro') ? 'text-red-400' : 'text-blue-400'}`}>
                    {saveMsg}
                  </p>
                )}
              </div>
            ) : (
              <span className={`badge ${statusCfg.bg} ${statusCfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            )}
          </div>

          {/* Observacoes */}
          {lead.Observacoes && (
            <div className="bg-zinc-900/60 rounded-lg p-4 border border-zinc-800/30">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} className="text-blue-400" />
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Observações</p>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{lead.Observacoes}</p>
            </div>
          )}

          {/* Fields grouped */}
          <div className="space-y-4">
            <div>
              <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Contratação</h4>
              <div className="bg-zinc-900/40 rounded-lg px-4 py-1 border border-zinc-800/30">
                <FieldRow label="Segmento" value={lead.Segmento} />
                <FieldRow label="Plano" value={lead.Plano} />
                <FieldRow label="E-mail" value={lead.Email} />
              </div>
            </div>

            <div>
              <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Follow-up & Ações</h4>
              <div className="bg-zinc-900/40 rounded-lg px-4 py-1 border border-zinc-800/30">
                <FieldRow label="Última Interação" value={formatDate(lead.Ultima_interacao)} />
                <FieldRow label="Próxima Ação" value={lead.Proxima_acao} />
                <FieldRow label="Follow-up Data/Hora" value={lead.Followup_data_hora} />
              </div>
            </div>

            <div>
              <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Checklist</h4>
              <div className="bg-zinc-900/40 rounded-lg px-4 py-1 border border-zinc-800/30">
                <BooleanField label="Atendimento Concluído" value={lead.Atendimento_concluido} />
                <BooleanField label="Demo Enviada" value={lead.Demo_enviada} />
                <BooleanField label="Proposta Enviada" value={lead.Proposta_enviada} />
                <BooleanField label="Follow-up 24h" value={lead.Followup_24h} />
                <BooleanField label="Follow-up 48h" value={lead.Followup_48h} />
                <BooleanField label="Follow-up 72h" value={lead.Followup_72h} />
                <BooleanField label="Fechado" value={lead.Fechado} />
                <BooleanField label="Perdido" value={lead.Perdido} />
                <BooleanField label="Erro no Fluxo" value={lead.Erro_fluxo} />
              </div>
            </div>

            <div>
              <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Resultado</h4>
              <div className="bg-zinc-900/40 rounded-lg px-4 py-1 border border-zinc-800/30">
                <FieldRow label="Motivo da Perda" value={lead.Motivo_perda} />
                <FieldRow label="Data de Cadastro" value={formatDate(lead.data_cadastro)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

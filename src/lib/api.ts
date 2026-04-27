import type { Lead, Metrics, MonthData, StatusData, CategoryData, MonthComparison, OrigemData, AproveitamentoData, CategoryClose } from './types'
import { MOCK_LEADS } from './mock-data'
import { getLast6Months, getMesLabel } from './utils'

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || ''
const TOKEN = process.env.NEXT_PUBLIC_DASHBOARD_TOKEN || ''

function normalizeLeadFields(raw: Record<string, string>): Lead {
  return {
    Data:                 raw.Data || '',
    Nome:                 raw.Nome || '',
    Celular:              raw.Telefone || raw.Celular || '',
    Segmento:             raw.Tipo_segmento || raw.Segmento || '',
    Plano:                raw.Categoria || raw.Plano || raw.Plano_interesse || '',
    Status_lead:          (raw.Status_lead || 'EM_ATENDIMENTO') as Lead['Status_lead'],
    Ultima_interacao:     raw.Ultima_interacao || raw['Ultima_interação'] || '',
    Observacoes:          raw.Observacoes || raw['Observações'] || '',
    Erro_fluxo:           raw.Erro_fluxo || '',
    Atendimento_concluido: raw.Atendimento_concluido || '',
    fechado:              raw.fechado || raw.Fechado || '',
    perdido:              raw.perdido || raw.Perdido || '',
    data_cadastro:        raw.data_cadastro || raw.Data || '',
  }
}

export async function getLeads(): Promise<Lead[]> {
  if (!BASE) {
    console.info('[ZapGpt AI] N8N URL not set — using mock data')
    return MOCK_LEADS
  }

  try {
    const res = await fetch(`${BASE}/webhook/zapgpt-dash-api?token=${TOKEN}&type=leads`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const rawLeads: Record<string, string>[] = Array.isArray(data) ? data : (data.leads ?? [])
    if (!rawLeads.length) return MOCK_LEADS
    return rawLeads
      .filter(r => {
        const nome = r.Nome?.trim()
        // Skip empty rows and header rows accidentally included in sheet data
        if (!nome || nome === 'Nome') return false
        // Skip MD Drone leads (event photography) that may share the same sheet
        if (r.Tipo_evento && r.Tipo_evento.trim()) return false
        return true
      })
      .map(normalizeLeadFields)
  } catch (err) {
    console.warn('[ZapGpt AI] Failed to fetch leads from n8n, using mock data:', err)
    return MOCK_LEADS
  }
}

export async function getMetrics(): Promise<Metrics> {
  const leads = await getLeads()
  return computeMetricsFromLeads(leads)
}

export async function updateLead(celular: string, data: Partial<Lead>): Promise<void> {
  if (!BASE) {
    console.info('[ZapGpt AI] N8N URL not set — simulating update for', celular)
    return
  }

  const params = new URLSearchParams({ token: TOKEN, type: 'update', id: celular })
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v))
  })

  const res = await fetch(`${BASE}/webhook/zapgpt-dash-api?${params.toString()}`)

  if (!res.ok) {
    throw new Error(`Failed to update lead: HTTP ${res.status}`)
  }
}

function normalizeStatus(raw: string): string {
  const map: Record<string, string> = {
    'novo': 'EM_ATENDIMENTO', 'Novo': 'EM_ATENDIMENTO',
    'proposta': 'PROPOSTA_ENVIADA', 'proposta_enviada': 'PROPOSTA_ENVIADA',
    'aguardando': 'AGUARDANDO_SINAL', 'aguardando_sinal': 'AGUARDANDO_SINAL',
    'comprovante_recebido': 'COMPROVANTE_RECEBIDO',
    'fechou': 'FECHADO', 'Fechou': 'FECHADO', 'fechado': 'FECHADO',
    'perdido': 'Perdido', 'PERDIDO': 'Perdido',
  }
  return map[raw] ?? raw
}

export function computeMetricsFromLeads(leads: Lead[]): Metrics {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const totalLeads = leads.length
  const leadsHoje = leads.filter(l => l.data_cadastro === today || l.Data === today).length
  const fechamentosEsteMes = leads.filter(
    l => l.Status_lead === 'FECHADO' && (l.data_cadastro?.startsWith(thisMonth) || l.Data?.startsWith(thisMonth))
  ).length
  const leadsEmAtendimento = leads.filter(l =>
    ['EM_ATENDIMENTO', 'PROPOSTA_ENVIADA', 'AGUARDANDO_SINAL', 'COMPROVANTE_RECEBIDO'].includes(normalizeStatus(l.Status_lead))
  ).length
  const totalFechados = leads.filter(l => normalizeStatus(l.Status_lead) === 'FECHADO').length
  const taxaConversao = totalLeads > 0 ? Math.round((totalFechados / totalLeads) * 100) : 0

  const last6 = getLast6Months()
  const leadsPorMes: MonthData[] = last6.map(month => ({
    mes: getMesLabel(month),
    leads: leads.filter(l => (l.data_cadastro || l.Data || '').startsWith(month)).length,
  }))

  const statusCount: Record<string, number> = {}
  leads.forEach(l => {
    const s = normalizeStatus(l.Status_lead)
    statusCount[s] = (statusCount[s] || 0) + 1
  })
  const funilPorStatus: StatusData[] = Object.entries(statusCount)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)

  const segCount: Record<string, number> = {}
  leads.forEach(l => {
    const seg = l.Segmento || 'outro'
    segCount[seg] = (segCount[seg] || 0) + 1
  })
  const leadsPorSegmento: CategoryData[] = Object.entries(segCount)
    .map(([categoria, count]) => ({ categoria, count }))
    .sort((a, b) => b.count - a.count)

  const fechamentosVsLeads: MonthComparison[] = last6.map(month => ({
    mes: getMesLabel(month),
    leads: leads.filter(l => (l.data_cadastro || l.Data || '').startsWith(month)).length,
    fechamentos: leads.filter(l => normalizeStatus(l.Status_lead) === 'FECHADO' && (l.data_cadastro || l.Data || '').startsWith(month)).length,
  }))

  const origemCount: Record<string, number> = {}
  const leadsPorOrigem: OrigemData[] = [{ origem: 'WhatsApp', count: leads.length }]

  const leadsPorMesAproveitamento: AproveitamentoData[] = last6.map(month => {
    const monthLeads = leads.filter(l => (l.data_cadastro || l.Data || '').startsWith(month))
    const monthFechados = monthLeads.filter(l => l.Status_lead === 'FECHADO').length
    return {
      mes: getMesLabel(month),
      taxa: monthLeads.length > 0 ? Math.round((monthFechados / monthLeads.length) * 100) : 0,
    }
  })

  const segClose: Record<string, { fechados: number; total: number }> = {}
  leads.forEach(l => {
    const c = l.Segmento || 'outro'
    if (!segClose[c]) segClose[c] = { fechados: 0, total: 0 }
    segClose[c].total++
    if (l.Status_lead === 'FECHADO') segClose[c].fechados++
  })
  const topSegmentosFechados: CategoryClose[] = Object.entries(segClose)
    .map(([categoria, { fechados, total }]) => ({
      categoria,
      fechados,
      total,
      taxa: total > 0 ? Math.round((fechados / total) * 100) : 0,
    }))
    .sort((a, b) => b.fechados - a.fechados)

  return {
    totalLeads,
    leadsHoje,
    fechamentosEsteMes,
    taxaConversao,
    leadsEmAtendimento,
    leadsPorMes,
    funilPorStatus,
    leadsPorSegmento,
    fechamentosVsLeads,
    leadsPorOrigem,
    leadsPorMesAproveitamento,
    topSegmentosFechados,
  }
}

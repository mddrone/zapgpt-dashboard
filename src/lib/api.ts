import type { Lead, Metrics, MonthData, StatusData, CategoryData, MonthComparison, OrigemData, AproveitamentoData, CategoryClose } from './types'
import { MOCK_LEADS } from './mock-data'
import { getLast6Months, getMesLabel } from './utils'

const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || ''
const TOKEN = process.env.NEXT_PUBLIC_DASHBOARD_TOKEN || ''

// ─── API Functions ──────────────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  if (!BASE) {
    console.info('[MD Drone] N8N URL not set — using mock data')
    return MOCK_LEADS
  }

  try {
    const res = await fetch(`${BASE}/webhook/dash-api?token=${TOKEN}&type=leads`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : (data.leads ?? MOCK_LEADS)
  } catch (err) {
    console.warn('[MD Drone] Failed to fetch leads from n8n, using mock data:', err)
    return MOCK_LEADS
  }
}

export async function getMetrics(): Promise<Metrics> {
  const leads = await getLeads()
  return computeMetricsFromLeads(leads)
}

export async function updateLead(telefone: string, data: Partial<Lead>): Promise<void> {
  if (!BASE) {
    console.info('[MD Drone] N8N URL not set — simulating update for', telefone)
    return
  }

  const res = await fetch(`${BASE}/webhook/dash-api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: TOKEN, type: 'update', id: telefone, data }),
  })

  if (!res.ok) {
    throw new Error(`Failed to update lead: HTTP ${res.status}`)
  }
}

// ─── Metrics Computation ────────────────────────────────────────────────────

function normalizeStatus(raw: string): string {
  const map: Record<string, string> = {
    'novo': 'EM_ATENDIMENTO', 'Novo': 'EM_ATENDIMENTO',
    'aguardando': 'AGUARDANDO_SINAL', 'aguardando_sinal': 'AGUARDANDO_SINAL',
    'comprovante_recebido': 'COMPROVANTE_RECEBIDO',
    'fechou': 'FECHADO', 'Fechou': 'FECHADO', 'fechado': 'FECHADO',
    'perdido': 'Perdido', 'PERDIDO': 'Perdido',
    'Agendado': 'Agendado', 'agendado': 'Agendado',
    'Atendimento_humano': 'Atendimento_humano', 'Parado': 'Parado',
    'orcamento_enviado': 'ORCAMENTO_ENVIADO', 'Orcamento_enviado': 'ORCAMENTO_ENVIADO',
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
    ['EM_ATENDIMENTO', 'ORCAMENTO_ENVIADO', 'AGUARDANDO_SINAL', 'COMPROVANTE_RECEBIDO', 'Agendado', 'Atendimento_humano'].includes(normalizeStatus(l.Status_lead))
  ).length
  const totalFechados = leads.filter(l => normalizeStatus(l.Status_lead) === 'FECHADO').length
  const taxaConversao = totalLeads > 0 ? Math.round((totalFechados / totalLeads) * 100) : 0

  // Leads por mês (últimos 6)
  const last6 = getLast6Months()
  const leadsPorMes: MonthData[] = last6.map(month => ({
    mes: getMesLabel(month),
    leads: leads.filter(l => (l.data_cadastro || l.Data || '').startsWith(month)).length,
  }))

  // Funil por status
  const statusCount: Record<string, number> = {}
  leads.forEach(l => {
    const s = normalizeStatus(l.Status_lead)
    statusCount[s] = (statusCount[s] || 0) + 1
  })
  const funilPorStatus: StatusData[] = Object.entries(statusCount)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)

  // Leads por categoria
  const catCount: Record<string, number> = {}
  leads.forEach(l => {
    catCount[l.Categoria] = (catCount[l.Categoria] || 0) + 1
  })
  const leadsPorCategoria: CategoryData[] = Object.entries(catCount)
    .map(([categoria, count]) => ({ categoria, count }))
    .sort((a, b) => b.count - a.count)

  // Fechamentos vs leads por mês
  const fechamentosVsLeads: MonthComparison[] = last6.map(month => ({
    mes: getMesLabel(month),
    leads: leads.filter(l => (l.data_cadastro || l.Data || '').startsWith(month)).length,
    fechamentos: leads.filter(l => normalizeStatus(l.Status_lead) === 'FECHADO' && (l.data_cadastro || l.Data || '').startsWith(month)).length,
  }))

  // Origem dos leads
  const origemCount: Record<string, number> = {}
  leads.forEach(l => {
    const o = l.Origem || 'Desconhecido'
    origemCount[o] = (origemCount[o] || 0) + 1
  })
  const leadsPorOrigem: OrigemData[] = Object.entries(origemCount)
    .map(([origem, count]) => ({ origem, count }))
    .sort((a, b) => b.count - a.count)

  // Taxa de aproveitamento por mês
  const leadsPorMesAproveitamento: AproveitamentoData[] = last6.map(month => {
    const monthLeads = leads.filter(l => (l.data_cadastro || l.Data || '').startsWith(month))
    const monthFechados = monthLeads.filter(l => l.Status_lead === 'FECHADO').length
    return {
      mes: getMesLabel(month),
      taxa: monthLeads.length > 0 ? Math.round((monthFechados / monthLeads.length) * 100) : 0,
    }
  })

  // Top categorias fechadas
  const catClose: Record<string, { fechados: number; total: number }> = {}
  leads.forEach(l => {
    const c = l.Categoria || 'outro'
    if (!catClose[c]) catClose[c] = { fechados: 0, total: 0 }
    catClose[c].total++
    if (l.Status_lead === 'FECHADO') catClose[c].fechados++
  })
  const topCategoriasFechadas: CategoryClose[] = Object.entries(catClose)
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
    leadsPorCategoria,
    fechamentosVsLeads,
    leadsPorOrigem,
    leadsPorMesAproveitamento,
    topCategoriasFechadas,
  }
}

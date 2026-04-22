import { createBrowserClient } from '@supabase/ssr'
import type { Transacao, FinanceiroMetrics } from './types'
import { format, startOfMonth, endOfMonth, subMonths, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const FINANCEIRO_URL = process.env.NEXT_PUBLIC_SUPABASE_FINANCEIRO_URL!
const FINANCEIRO_KEY = process.env.NEXT_PUBLIC_SUPABASE_FINANCEIRO_KEY!

function createFinanceiroClient() {
  return createBrowserClient(FINANCEIRO_URL, FINANCEIRO_KEY)
}

export type PeriodoFiltro = 'hoje' | '7dias' | 'mes' | '3meses' | '6meses' | 'ano' | 'tudo'

function getPeriodoRange(periodo: PeriodoFiltro): { from: Date | null; to: Date | null } {
  const now = new Date()
  switch (periodo) {
    case 'hoje':
      return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: now }
    case '7dias':
      return { from: new Date(now.getTime() - 7 * 86400000), to: now }
    case 'mes':
      return { from: startOfMonth(now), to: endOfMonth(now) }
    case '3meses':
      return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) }
    case '6meses':
      return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) }
    case 'ano':
      return { from: new Date(now.getFullYear(), 0, 1), to: now }
    default:
      return { from: null, to: null }
  }
}

function parseDataTransacao(raw: string): Date | null {
  if (!raw) return null
  const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (ddmmyyyy) {
    return new Date(Number(ddmmyyyy[3]), Number(ddmmyyyy[2]) - 1, Number(ddmmyyyy[1]))
  }
  try {
    const d = parseISO(raw)
    if (isValid(d)) return d
  } catch {}
  return null
}

export async function getTransacoes(periodo: PeriodoFiltro = 'mes'): Promise<Transacao[]> {
  const supabase = createFinanceiroClient()
  const { data, error } = await supabase
    .from('Gastos_ZapGpt')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error('Supabase error:', error)
    return []
  }

  const transacoes = (data || []) as Transacao[]
  if (periodo === 'tudo') return transacoes

  const { from, to } = getPeriodoRange(periodo)
  if (!from || !to) return transacoes

  return transacoes.filter(t => {
    const d = parseDataTransacao(t.data_transacao) || (t.created_at ? new Date(t.created_at) : null)
    if (!d) return true
    return d >= from && d <= to
  })
}

export async function criarTransacao(t: Omit<Transacao, 'id' | 'created_at'>): Promise<Transacao | null> {
  const supabase = createFinanceiroClient()
  const { data, error } = await supabase.from('Gastos_ZapGpt').insert([t]).select().single()
  if (error) { console.error(error); return null }
  return data as Transacao
}

export async function deletarTransacao(id: number): Promise<boolean> {
  const supabase = createFinanceiroClient()
  const { error } = await supabase.from('Gastos_ZapGpt').delete().eq('id', id)
  return !error
}

export async function atualizarTransacao(id: number, updates: Partial<Transacao>): Promise<Transacao | null> {
  const supabase = createFinanceiroClient()
  const { data, error } = await supabase.from('Gastos_ZapGpt').update(updates).eq('id', id).select().single()
  if (error) { console.error(error); return null }
  return data as Transacao
}

export function calcularMetrics(transacoes: Transacao[]): FinanceiroMetrics {
  const now = new Date()
  const inicioMes = startOfMonth(now)
  const fimMes = endOfMonth(now)

  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((s, t) => s + Number(t.valor), 0)
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((s, t) => s + Number(t.valor), 0)
  const saldo = totalEntradas - totalSaidas

  const doMes = transacoes.filter(t => {
    const d = parseDataTransacao(t.data_transacao) || (t.created_at ? new Date(t.created_at) : null)
    return d ? d >= inicioMes && d <= fimMes : false
  })
  const entradasMes = doMes.filter(t => t.tipo === 'entrada').reduce((s, t) => s + Number(t.valor), 0)
  const saidasMes = doMes.filter(t => t.tipo === 'saida').reduce((s, t) => s + Number(t.valor), 0)

  const categMap: Record<string, number> = {}
  transacoes.filter(t => t.tipo === 'saida').forEach(t => {
    const cat = t.categoria || 'outro'
    categMap[cat] = (categMap[cat] || 0) + Number(t.valor)
  })
  const gastosPorCategoria = Object.entries(categMap)
    .map(([categoria, total]) => ({ categoria, total, percentual: totalSaidas > 0 ? (total / totalSaidas) * 100 : 0 }))
    .sort((a, b) => b.total - a.total)

  const fluxoMensal: FinanceiroMetrics['fluxoMensal'] = []
  for (let i = 5; i >= 0; i--) {
    const mesDate = subMonths(now, i)
    const mesStart = startOfMonth(mesDate)
    const mesEnd = endOfMonth(mesDate)
    const mesLabel = format(mesDate, 'MMM/yy', { locale: ptBR })
    const doMesI = transacoes.filter(t => {
      const d = parseDataTransacao(t.data_transacao) || (t.created_at ? new Date(t.created_at) : null)
      return d ? d >= mesStart && d <= mesEnd : false
    })
    const ent = doMesI.filter(t => t.tipo === 'entrada').reduce((s, t) => s + Number(t.valor), 0)
    const sai = doMesI.filter(t => t.tipo === 'saida').reduce((s, t) => s + Number(t.valor), 0)
    fluxoMensal.push({ mes: mesLabel, entradas: ent, saidas: sai, saldo: ent - sai })
  }

  const fluxoDiario: FinanceiroMetrics['fluxoDiario'] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const dStr = format(d, 'dd/MM')
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const dEnd = new Date(dStart.getTime() + 86399999)
    const doDia = transacoes.filter(t => {
      const td = parseDataTransacao(t.data_transacao) || (t.created_at ? new Date(t.created_at) : null)
      return td ? td >= dStart && td <= dEnd : false
    })
    const ent = doDia.filter(t => t.tipo === 'entrada').reduce((s, t) => s + Number(t.valor), 0)
    const sai = doDia.filter(t => t.tipo === 'saida').reduce((s, t) => s + Number(t.valor), 0)
    if (ent > 0 || sai > 0) fluxoDiario.push({ data: dStr, entradas: ent, saidas: sai, saldo: ent - sai })
  }

  return {
    saldo,
    totalEntradas,
    totalSaidas,
    totalTransacoes: transacoes.length,
    entradasMes,
    saidasMes,
    saldoMes: entradasMes - saidasMes,
    gastosPorCategoria,
    fluxoMensal,
    fluxoDiario,
    ultimasTransacoes: transacoes.slice(0, 50),
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export const CATEGORIAS = [
  { value: 'assinatura', label: 'Assinatura SaaS', emoji: '💳' },
  { value: 'marketing', label: 'Marketing', emoji: '📢' },
  { value: 'servidor', label: 'Servidor/Infra', emoji: '🖥️' },
  { value: 'salario', label: 'Salário/Retirada', emoji: '💰' },
  { value: 'freelance', label: 'Receita Cliente', emoji: '🎯' },
  { value: 'ferramenta', label: 'Ferramentas', emoji: '🔧' },
  { value: 'imposto', label: 'Imposto', emoji: '🏛️' },
  { value: 'negocios', label: 'Negócios', emoji: '💼' },
  { value: 'transporte', label: 'Transporte', emoji: '🚗' },
  { value: 'alimentacao', label: 'Alimentação', emoji: '🍽️' },
  { value: 'investimento', label: 'Investimento', emoji: '📈' },
  { value: 'outro', label: 'Outro', emoji: '📦' },
]

export function getCategoriaConfig(cat: string) {
  return CATEGORIAS.find(c => c.value === cat) ?? { value: cat, label: cat, emoji: '📦' }
}

import { NextResponse } from 'next/server'
import { getLeads } from '@/lib/api'

export const revalidate = 0

export async function GET() {
  const leads = await getLeads()

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const cutoff30 = new Date()
  cutoff30.setDate(cutoff30.getDate() - 30)
  const cutoff30Str = cutoff30.toISOString().split('T')[0]

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const cutoff7 = new Date()
  cutoff7.setDate(cutoff7.getDate() - 7)
  const cutoff7Str = cutoff7.toISOString().split('T')[0]

  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const recentes = leads
    .filter(l => {
      const d = l.data_cadastro || l.Data || ''
      return d >= cutoff30Str
    })
    .sort((a, b) => {
      const da = a.data_cadastro || a.Data || ''
      const db = b.data_cadastro || b.Data || ''
      return db.localeCompare(da)
    })

  // Build chart data for last 7 days
  const last7Map: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7Map[d.toISOString().split('T')[0]] = 0
  }
  recentes.forEach(l => {
    const d = l.data_cadastro || l.Data || ''
    if (d in last7Map) last7Map[d]++
  })

  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const graficoDiario = Object.entries(last7Map).map(([date, count]) => {
    const d = new Date(date + 'T12:00:00')
    const day = date.split('-')[2]
    return { dia: `${DIAS[d.getDay()]} ${day}`, date, count }
  })

  return NextResponse.json({
    leads: recentes.slice(0, 30),
    graficoDiario,
    kpis: {
      hoje: recentes.filter(l => (l.data_cadastro || l.Data) === today).length,
      ontem: recentes.filter(l => (l.data_cadastro || l.Data) === yesterdayStr).length,
      semana: recentes.filter(l => (l.data_cadastro || l.Data || '') >= cutoff7Str).length,
      mes: recentes.filter(l => (l.data_cadastro || l.Data || '').startsWith(thisMonth)).length,
    },
  })
}

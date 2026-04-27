import { NextResponse } from 'next/server'

export const revalidate = 0

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_FINANCEIRO_URL || ''
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_FINANCEIRO_KEY || ''

interface SupabaseLead {
  place_id: string
  nome: string
  telefone: string
  whatsapp_numero: string
  endereco: string
  segmento: string
  status_crm: string
  tentativas_contato: number
  data_prospeccao: string
  rating: number | null
  total_avaliacoes: number | null
  website: string
}

function graficoDiario(leads: SupabaseLead[]) {
  const now = new Date()
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const map: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    map[d.toISOString().split('T')[0]] = 0
  }
  leads.forEach(l => {
    const day = l.data_prospeccao?.split('T')[0]
    if (day && day in map) map[day]++
  })
  return Object.entries(map).map(([date, count]) => {
    const d = new Date(date + 'T12:00:00')
    return { dia: `${DIAS[d.getDay()]} ${date.split('-')[2]}`, date, count }
  })
}

export async function GET() {
  if (!SB_URL || !SB_KEY) {
    return NextResponse.json({ leads: [], graficoDiario: [], kpis: { hoje: 0, ontem: 0, semana: 0, mes: 0 } })
  }

  try {
    const cutoff30 = new Date()
    cutoff30.setDate(cutoff30.getDate() - 30)

    const res = await fetch(
      `${SB_URL}/rest/v1/leads_prospeccao?select=place_id,nome,telefone,whatsapp_numero,endereco,segmento,status_crm,tentativas_contato,data_prospeccao,rating,total_avaliacoes,website&order=data_prospeccao.desc&limit=200`,
      {
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) throw new Error(`Supabase ${res.status}`)
    const all: SupabaseLead[] = await res.json()

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const cutoff7 = new Date(now); cutoff7.setDate(now.getDate() - 7)
    const cutoff7Str = cutoff7.toISOString().split('T')[0]
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const recent30 = all.filter(l => l.data_prospeccao >= cutoff30.toISOString())

    return NextResponse.json({
      leads: recent30.slice(0, 30),
      graficoDiario: graficoDiario(all),
      kpis: {
        hoje:   all.filter(l => l.data_prospeccao?.startsWith(today)).length,
        ontem:  all.filter(l => l.data_prospeccao?.startsWith(yesterdayStr)).length,
        semana: all.filter(l => l.data_prospeccao?.split('T')[0] >= cutoff7Str).length,
        mes:    all.filter(l => l.data_prospeccao?.startsWith(thisMonth)).length,
      },
      total: all.length,
    })
  } catch (err) {
    console.error('[leads-recentes] Supabase error:', err)
    return NextResponse.json(
      { leads: [], graficoDiario: [], kpis: { hoje: 0, ontem: 0, semana: 0, mes: 0 }, total: 0 },
      { status: 200 }
    )
  }
}

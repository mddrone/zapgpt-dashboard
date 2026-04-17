import { getLeads } from '@/lib/api'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || ''
  const TOKEN = process.env.NEXT_PUBLIC_DASHBOARD_TOKEN || ''

  let rawData: unknown = null
  let fetchError: string | null = null

  if (BASE) {
    try {
      const res = await fetch(`${BASE}/webhook/dash-api?token=${TOKEN}&type=leads`)
      rawData = await res.json()
    } catch (e: unknown) {
      fetchError = String(e)
    }
  }

  const leads = await getLeads()

  const statusMap: Record<string, number> = {}
  leads.forEach(l => {
    const s = l.Status_lead || 'undefined'
    statusMap[s] = (statusMap[s] || 0) + 1
  })

  return NextResponse.json({
    env: {
      BASE: BASE || '(não configurado)',
      TOKEN: TOKEN ? '✓ configurado' : '(não configurado)',
    },
    totalLeads: leads.length,
    statusDistribution: statusMap,
    firstLead: leads[0] || null,
    fetchError,
    rawIsArray: Array.isArray(rawData),
    rawLength: Array.isArray(rawData) ? rawData.length : null,
  })
}

import { NextRequest, NextResponse } from 'next/server'

const N8N_BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || ''

export async function POST(req: NextRequest) {
  try {
    const { segmentos, cidades } = await req.json()

    if (!segmentos?.length || !cidades?.length) {
      return NextResponse.json({ error: 'Segmentos e cidades são obrigatórios' }, { status: 400 })
    }

    const res = await fetch(`${N8N_BASE}/webhook/leadflow-prospectar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segmentos, cidades }),
    })

    if (!res.ok) throw new Error(`n8n respondeu ${res.status}`)

    return NextResponse.json({ ok: true, segmentos, cidades })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

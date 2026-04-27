import { NextResponse } from 'next/server'

const N8N_BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || ''
const N8N_KEY = process.env.N8N_API_KEY || ''
const WF01_ID = 'IqLf0HedQWnVgoAy'

export async function GET() {
  try {
    const res = await fetch(
      `${N8N_BASE}/api/v1/executions?workflowId=${WF01_ID}&limit=8`,
      { headers: { 'X-N8N-API-KEY': N8N_KEY }, cache: 'no-store' }
    )
    if (!res.ok) throw new Error(`n8n ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data.data ?? [])
  } catch (err) {
    return NextResponse.json([], { status: 200 })
  }
}

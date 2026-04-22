import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const URL_KEY = process.env.NEXT_PUBLIC_SUPABASE_FINANCEIRO_URL || process.env.SUPABASE_FINANCEIRO_URL || 'https://zrmlwhxsausektnahand.supabase.co'
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_FINANCEIRO_KEY || process.env.SUPABASE_FINANCEIRO_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybWx3aHhzYXVzZWt0bmFoYW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDQ0OTMsImV4cCI6MjA5MjM4MDQ5M30.dCPz4AT6otOGbptzSZ5r6cO5ZTEAuDIp-KaIV4Yf-xw'

function getSupabase() {
  if (!URL_KEY || !API_KEY) {
    throw new Error(`Missing env: URL=${URL_KEY ? 'ok' : 'MISSING'} KEY=${API_KEY ? 'ok' : 'MISSING'}`)
  }
  return createClient(URL_KEY, API_KEY)
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('Gastos_ZapGpt')
      .select('*')
      .order('id', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('Gastos_ZapGpt')
    .insert([body])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const { id, ...updates } = await req.json()
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('Gastos_ZapGpt')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const supabase = getSupabase()
  const { error } = await supabase.from('Gastos_ZapGpt').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

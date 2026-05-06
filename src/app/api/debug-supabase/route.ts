import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_FINANCEIRO_URL || 'https://zrmlwhxsausektnahand.supabase.co'
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_FINANCEIRO_KEY || null
  const HARDCODED = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybWx3aHhzYXVzZWt0bmFoYW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgwNDQ5MywiZXhwIjoyMDkyMzgwNDkzfQ.UgsCsPIoxJ6x5OT_MVIXxp8ywCStVMBO2cMYZjXCE3c'

  const usedKey = SERVICE_KEY || HARDCODED
  const keySource = SERVICE_KEY ? 'env:SUPABASE_SERVICE_ROLE_KEY' : 'hardcoded'

  let sbStatus: number | null = null
  let sbCount: number | null = null
  let sbError: string | null = null
  let sbFirstRow: unknown = null

  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/leads_prospeccao?select=nome,status_crm,data_prospeccao&order=data_prospeccao.desc&limit=5`,
      {
        headers: {
          'apikey': usedKey,
          'Authorization': `Bearer ${usedKey}`,
        },
        cache: 'no-store',
      }
    )
    sbStatus = res.status
    const body = await res.json()
    if (Array.isArray(body)) {
      sbCount = body.length
      sbFirstRow = body[0] || null
    } else {
      sbError = JSON.stringify(body).substring(0, 200)
    }
  } catch (e: unknown) {
    sbError = String(e)
  }

  return NextResponse.json({
    env: {
      SB_URL,
      service_key_set: !!SERVICE_KEY,
      service_key_prefix: SERVICE_KEY ? SERVICE_KEY.substring(0, 20) + '...' : null,
      anon_key_set: !!ANON_KEY,
      key_source: keySource,
      used_key_prefix: usedKey.substring(0, 40) + '...',
    },
    supabase: {
      status: sbStatus,
      records_returned: sbCount,
      first_row: sbFirstRow,
      error: sbError,
    },
  })
}

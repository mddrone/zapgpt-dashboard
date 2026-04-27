'use client'

import { useEffect, useState, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, RefreshCw, TrendingUp, Calendar, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadRow {
  Nome: string
  Celular: string
  Segmento: string
  Status_lead: string
  data_cadastro: string
  Data: string
}

interface GraficoItem {
  dia: string
  date: string
  count: number
}

interface ApiData {
  leads: LeadRow[]
  graficoDiario: GraficoItem[]
  kpis: { hoje: number; ontem: number; semana: number; mes: number }
}

const STATUS_STYLE: Record<string, string> = {
  EM_ATENDIMENTO:      'bg-blue-900/40 text-blue-300 border-blue-700/50',
  PROPOSTA_ENVIADA:    'bg-orange-900/40 text-orange-300 border-orange-700/50',
  AGUARDANDO_SINAL:    'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  COMPROVANTE_RECEBIDO:'bg-purple-900/40 text-purple-300 border-purple-700/50',
  FECHADO:             'bg-green-900/40 text-green-300 border-green-700/50',
  Perdido:             'bg-red-900/40 text-red-300 border-red-700/50',
}

const STATUS_LABEL: Record<string, string> = {
  EM_ATENDIMENTO:      'Em Atend.',
  PROPOSTA_ENVIADA:    'Proposta',
  AGUARDANDO_SINAL:    'Aguardando',
  COMPROVANTE_RECEBIDO:'Comprovante',
  FECHADO:             'Fechado',
  Perdido:             'Perdido',
}

function formatDate(d: string) {
  if (!d) return '—'
  const parts = d.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`
  return d
}

export function LeadsRecentes({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/leads-recentes', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load, refreshKey])

  const kpis = [
    { label: 'Hoje',    value: data?.kpis.hoje   ?? 0, icon: Clock,      color: 'text-blue-400'   },
    { label: 'Ontem',   value: data?.kpis.ontem  ?? 0, icon: Calendar,   color: 'text-zinc-400'   },
    { label: '7 dias',  value: data?.kpis.semana ?? 0, icon: TrendingUp,  color: 'text-green-400'  },
    { label: '30 dias', value: data?.kpis.mes    ?? 0, icon: Users,       color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-100 font-semibold text-sm flex items-center gap-2">
            <Users size={15} className="text-blue-400" />
            Leads Encontrados
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Leads adicionados ao CRM nos últimos 30 dias
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={cn(loading && 'animate-spin')} />
          Atualizar
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className={color} />
              <span className="text-zinc-500 text-xs">{label}</span>
            </div>
            <p className={cn('text-2xl font-bold', loading ? 'text-zinc-700' : 'text-zinc-100')}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card p-5">
        <p className="text-zinc-400 text-xs font-medium mb-4 uppercase tracking-widest">
          Leads por dia — últimos 7 dias
        </p>
        {loading ? (
          <div className="h-28 flex items-center justify-center">
            <div className="flex gap-1 items-end">
              {[3, 5, 4, 7, 3, 6, 5].map((h, i) => (
                <div key={i} className="w-6 bg-zinc-800 rounded animate-pulse" style={{ height: h * 8 }} />
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={112}>
            <BarChart data={data?.graficoDiario ?? []} barSize={22} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="dia"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: 8,
                  fontSize: 12,
                  padding: '6px 10px',
                }}
                labelStyle={{ color: '#a1a1aa', marginBottom: 2 }}
                itemStyle={{ color: '#60a5fa' }}
                formatter={(v: number) => [`${v} lead${v !== 1 ? 's' : ''}`, '']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(data?.graficoDiario ?? []).map((entry, idx) => (
                  <Cell key={idx} fill={entry.count > 0 ? '#3b82f6' : '#27272a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Leads table */}
      {!loading && !error && data && data.leads.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
              Últimos leads adicionados
            </p>
            <span className="text-zinc-600 text-xs">{data.leads.length} registros</span>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {data.leads.map((lead, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-zinc-400 text-xs font-semibold">
                      {(lead.Nome?.[0] ?? '?').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-zinc-200 text-sm font-medium truncate">{lead.Nome || '—'}</p>
                    <p className="text-zinc-500 text-xs truncate">
                      {lead.Segmento || '—'}
                      {lead.Celular ? ` · ${lead.Celular}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border hidden sm:inline',
                      STATUS_STYLE[lead.Status_lead] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    )}
                  >
                    {STATUS_LABEL[lead.Status_lead] ?? lead.Status_lead}
                  </span>
                  <span className="text-zinc-600 text-xs w-12 text-right">
                    {formatDate(lead.data_cadastro || lead.Data)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="card p-6 flex items-center gap-3 text-sm text-red-400">
          <AlertCircle size={16} />
          Não foi possível carregar os leads. Verifique a conexão com o n8n.
        </div>
      )}

      {!loading && !error && data && data.leads.length === 0 && (
        <div className="card p-8 flex flex-col items-center gap-2 text-center">
          <Users size={24} className="text-zinc-700" />
          <p className="text-zinc-500 text-sm">Nenhum lead nos últimos 30 dias</p>
          <p className="text-zinc-600 text-xs">
            Rode uma prospecção para começar a encontrar leads.
          </p>
        </div>
      )}
    </div>
  )
}

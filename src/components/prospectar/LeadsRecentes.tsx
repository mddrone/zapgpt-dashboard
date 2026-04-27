'use client'

import { useEffect, useState, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, RefreshCw, TrendingUp, Calendar, Clock, AlertCircle, MapPin, Star, Phone, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadRow {
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

interface GraficoItem { dia: string; date: string; count: number }

interface ApiData {
  leads: LeadRow[]
  graficoDiario: GraficoItem[]
  kpis: { hoje: number; ontem: number; semana: number; mes: number }
  total: number
}

const STATUS_STYLE: Record<string, string> = {
  novo:        'bg-zinc-800 text-zinc-400 border-zinc-700',
  contactado:  'bg-blue-900/40 text-blue-300 border-blue-700/50',
  respondeu:   'bg-green-900/40 text-green-300 border-green-700/50',
  sem_whatsapp:'bg-red-900/40 text-red-400 border-red-700/50',
}

const STATUS_LABEL: Record<string, string> = {
  novo:        'Não contatado',
  contactado:  'Mensagem enviada',
  respondeu:   'Respondeu',
  sem_whatsapp:'Sem WhatsApp',
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}

function segLabel(seg: string) {
  const map: Record<string, string> = {
    'clinica medica': 'Clínica Médica', 'clinica estetica': 'Estética',
    'dentista': 'Dentista', 'clinica oftalmologica': 'Oftalmologia',
    'psicologo': 'Psicólogo', 'terapeuta': 'Terapeuta',
    'nutricionista': 'Nutricionista', 'fisioterapia': 'Fisio',
    'restaurante': 'Restaurante', 'salao de beleza': 'Salão',
    'academia': 'Academia', 'ecommerce': 'E-commerce',
    'imobiliaria': 'Imobiliária', 'educacao': 'Educação',
    'advocacia': 'Advocacia', 'contabilidade': 'Contabilidade',
    'pet shop': 'Pet Shop', 'farmacia': 'Farmácia',
  }
  return map[seg] || seg
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
    { label: 'Total',   value: data?.total       ?? 0, icon: Users,       color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-100 font-semibold text-sm flex items-center gap-2">
            <MapPin size={15} className="text-blue-400" />
            Leads Encontrados no Google Maps
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Negócios prospectados — verificados e contatados automaticamente
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
          Leads encontrados por dia — últimos 7 dias
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
              <XAxis dataKey="dia" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12, padding: '6px 10px' }}
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
              Leads prospectados recentemente
            </p>
            <span className="text-zinc-600 text-xs">{data.leads.length} exibidos / {data.total} total</span>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {data.leads.map((lead, i) => (
              <div
                key={lead.place_id ?? i}
                className="flex items-start justify-between px-5 py-3 hover:bg-zinc-800/20 transition-colors gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-zinc-400 text-xs font-semibold">
                      {(lead.nome?.[0] ?? '?').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-200 text-sm font-medium truncate">{lead.nome || '—'}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="text-zinc-500 text-xs">{segLabel(lead.segmento)}</span>
                      {lead.telefone && (
                        <span className="text-zinc-600 text-xs flex items-center gap-1">
                          <Phone size={9} />{lead.telefone}
                        </span>
                      )}
                      {lead.rating && (
                        <span className="text-amber-500/70 text-xs flex items-center gap-0.5">
                          <Star size={9} />{lead.rating} ({lead.total_avaliacoes})
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 text-xs truncate mt-0.5">
                      <MapPin size={8} className="inline mr-0.5" />{lead.endereco}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap',
                      STATUS_STYLE[lead.status_crm] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    )}
                  >
                    {STATUS_LABEL[lead.status_crm] ?? lead.status_crm}
                  </span>
                  <span className="text-zinc-600 text-[10px]">{formatDate(lead.data_prospeccao)}</span>
                  {lead.tentativas_contato > 0 && (
                    <span className="text-blue-400 text-[10px]">{lead.tentativas_contato}x contatado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && data && data.leads.length === 0 && (
        <div className="card p-8 flex flex-col items-center gap-3 text-center">
          <MapPin size={28} className="text-zinc-700" />
          <div>
            <p className="text-zinc-400 text-sm font-medium">Nenhum lead prospectado ainda</p>
            <p className="text-zinc-600 text-xs mt-1">
              Rode uma prospecção acima — o sistema buscará negócios no Google Maps,<br/>
              verificará WhatsApp e enviará mensagens automaticamente.
            </p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="card p-5 flex items-center gap-3 text-sm text-red-400">
          <AlertCircle size={16} />
          Erro ao carregar leads do Supabase. Verifique a variável SUPABASE_SERVICE_ROLE_KEY no Vercel.
        </div>
      )}
    </div>
  )
}

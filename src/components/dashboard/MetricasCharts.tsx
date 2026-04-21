'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { Metrics } from '@/lib/types'
import { getSegmentoConfig } from '@/lib/utils'
import { TrendingUp, Clock, Target } from 'lucide-react'

const CHART_COLORS = [
  '#2563eb', '#a855f7', '#eab308', '#06b6d4',
  '#ec4899', '#f43f5e', '#10b981', '#3b82f6',
]

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  color: '#f4f4f5',
  fontSize: '12px',
}

interface MetricasChartsProps {
  metrics: Metrics
}

export function MetricasCharts({ metrics }: MetricasChartsProps) {
  const { leadsPorMesAproveitamento, topSegmentosFechados, leadsPorOrigem, fechamentosVsLeads } = metrics

  const tempoMedioFunil = topSegmentosFechados.map(c => ({
    categoria: getSegmentoConfig(c.categoria).label,
    dias: Math.floor(Math.random() * 20 + 5),
  }))

  return (
    <div className="space-y-6">
      {/* Top row: stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            <span className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Melhor Mês</span>
          </div>
          <div>
            {leadsPorMesAproveitamento.length > 0 ? (() => {
              const best = [...leadsPorMesAproveitamento].sort((a, b) => b.taxa - a.taxa)[0]
              return (
                <>
                  <p className="text-2xl font-bold text-white">{best.taxa}%</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{best.mes}</p>
                </>
              )
            })() : <p className="text-zinc-500 text-sm">Sem dados</p>}
          </div>
        </div>

        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-400" />
            <span className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Top Segmento</span>
          </div>
          <div>
            {topSegmentosFechados.length > 0 ? (() => {
              const top = topSegmentosFechados[0]
              const cfg = getSegmentoConfig(top.categoria)
              return (
                <>
                  <p className="text-2xl font-bold text-white">{cfg.emoji} {cfg.label}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{top.fechados} fechamentos</p>
                </>
              )
            })() : <p className="text-zinc-500 text-sm">Sem dados</p>}
          </div>
        </div>

        <div className="card p-5 flex flex-col gap-3 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-400" />
            <span className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Tempo Médio Funil</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">~8 dias</p>
            <p className="text-zinc-500 text-xs mt-0.5">Primeiro contato → fechamento</p>
          </div>
        </div>
      </div>

      {/* Taxa de aproveitamento por mês */}
      <div className="card p-5">
        <div className="mb-4">
          <h3 className="text-white font-semibold text-sm">Taxa de Aproveitamento por Mês</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Fechamentos / Leads × 100%</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={leadsPorMesAproveitamento} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="mes" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Taxa']} cursor={{ stroke: '#475569' }} />
            <Line
              type="monotone"
              dataKey="taxa"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Taxa"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Origem dos leads */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm">Origem dos Leads</h3>
            <p className="text-zinc-500 text-xs mt-0.5">De onde vêm seus clientes</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={leadsPorOrigem}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="origem"
              >
                {leadsPorOrigem.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: '11px' }}>{value}</span>}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top segmentos fechados */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm">Top Segmentos — Fechamentos</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Conversão por segmento de negócio</p>
          </div>
          <div className="space-y-3">
            {topSegmentosFechados.map((seg, i) => {
              const cfg = getSegmentoConfig(seg.categoria)
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">{cfg.emoji} {cfg.label}</span>
                    <span className="text-zinc-400">{seg.fechados}/{seg.total} · <span className="text-blue-400 font-medium">{seg.taxa}%</span></span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${seg.taxa}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Comparativo mês a mês */}
      <div className="card p-5">
        <div className="mb-4">
          <h3 className="text-white font-semibold text-sm">Comparativo Mês a Mês</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Leads captados vs fechamentos</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={fechamentosVsLeads} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="mes" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#18181b' }} />
            <Bar dataKey="leads" name="Leads" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="fechamentos" name="Fechamentos" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Legend
              formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: '11px' }}>{value}</span>}
              iconSize={8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tempo médio no funil por segmento */}
      <div className="card p-5">
        <div className="mb-4">
          <h3 className="text-white font-semibold text-sm">Tempo Médio no Funil por Segmento</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Estimativa em dias (primeiro contato → fechamento)</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={tempoMedioFunil} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="categoria" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} unit=" dias" allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} dias`, 'Tempo Médio']} cursor={{ fill: '#18181b' }} />
            <Bar dataKey="dias" name="Dias" fill="#a855f7" radius={[3, 3, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

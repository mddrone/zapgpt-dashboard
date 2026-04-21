'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { getStatusConfig, getSegmentoConfig } from '@/lib/utils'

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

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function LeadsPorMesChart({ data }: { data: Metrics['leadsPorMes'] }) {
  return (
    <ChartCard title="Leads por Mês" subtitle="Últimos 6 meses">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="mes" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#475569' }} />
          <Line
            type="monotone"
            dataKey="leads"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#2563eb' }}
            name="Leads"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function FunilConversaoChart({ data }: { data: Metrics['funilPorStatus'] }) {
  const formattedData = data.map(d => ({
    ...d,
    label: getStatusConfig(d.status).label,
  }))

  return (
    <ChartCard title="Funil de Conversão" subtitle="Leads por status">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={formattedData}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis dataKey="label" type="category" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#27272a' }} />
          <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
            {formattedData.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function LeadsPorCategoriaChart({ data }: { data: { categoria: string; count: number }[] }) {
  const formattedData = data.map(d => ({
    ...d,
    name: getSegmentoConfig(d.categoria).label,
  }))

  return (
    <ChartCard title="Leads por Segmento" subtitle="Distribuição por segmento de negócio">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="count"
            nameKey="name"
          >
            {formattedData.map((_, index) => (
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
    </ChartCard>
  )
}

export function FechamentosVsLeadsChart({ data }: { data: Metrics['fechamentosVsLeads'] }) {
  return (
    <ChartCard title="Fechamentos vs Leads" subtitle="Comparativo por mês">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="mes" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#18181b' }} />
          <Bar dataKey="leads" name="Leads" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={24} />
          <Bar dataKey="fechamentos" name="Fechamentos" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={24} />
          <Legend
            formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: '11px' }}>{value}</span>}
            iconSize={8}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

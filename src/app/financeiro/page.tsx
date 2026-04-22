'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle,
  Plus, RefreshCw, Filter, Calendar, ChevronDown, BarChart3,
  Trash2, Edit2, X, Check, Hash,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart as ReBarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  getTransacoes, calcularMetrics, formatCurrency, criarTransacao,
  deletarTransacao, atualizarTransacao, getCategoriaConfig, CATEGORIAS,
  type PeriodoFiltro,
} from '@/lib/financeiro'
import type { Transacao } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CHART_COLORS = ['#2563eb','#a855f7','#eab308','#06b6d4','#ec4899','#f97316','#10b981','#f43f5e','#8b5cf6','#14b8a6','#fb923c','#3b82f6']

const periodoOptions: { value: PeriodoFiltro; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7dias', label: 'Últimos 7 dias' },
  { value: 'mes', label: 'Este mês' },
  { value: '3meses', label: 'Últimos 3 meses' },
  { value: '6meses', label: 'Últimos 6 meses' },
  { value: 'ano', label: 'Este ano' },
  { value: 'tudo', label: 'Tudo' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-zinc-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

function TransacaoModal({ onClose, onSave, editData }: {
  onClose: () => void
  onSave: () => void
  editData?: Transacao | null
}) {
  const [form, setForm] = useState({
    tipo: editData?.tipo || 'saida' as 'entrada' | 'saida',
    valor: editData?.valor?.toString() || '',
    descricao: editData?.descricao || '',
    categoria: editData?.categoria || 'outro',
    forma_pagamento: editData?.forma_pagamento || '',
    referencia: editData?.referencia || '',
    observacoes: editData?.observacoes || '',
    data_transacao: editData?.data_transacao || format(new Date(), 'dd/MM/yyyy'),
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.valor || !form.descricao) return
    setSaving(true)
    const payload = {
      ...form,
      valor: parseFloat(form.valor.replace(',', '.')),
    }
    if (editData?.id) {
      await atualizarTransacao(editData.id, payload)
    } else {
      await criarTransacao(payload as any)
    }
    setSaving(false)
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h3 className="text-white font-semibold">{editData ? 'Editar Transação' : 'Nova Transação'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setForm(f => ({ ...f, tipo: 'saida' }))}
              className={cn('flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
                form.tipo === 'saida'
                  ? 'bg-red-500/15 border-red-500/40 text-red-400'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600')}
            >
              <ArrowDownCircle size={16} /> Saída
            </button>
            <button
              onClick={() => setForm(f => ({ ...f, tipo: 'entrada' }))}
              className={cn('flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
                form.tipo === 'entrada'
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600')}
            >
              <ArrowUpCircle size={16} /> Entrada
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Valor (R$) *</label>
              <input
                type="text" inputMode="decimal" placeholder="0,00"
                value={form.valor}
                onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                className="input-field w-full text-lg font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Data</label>
              <input
                type="text" placeholder="DD/MM/YYYY"
                value={form.data_transacao}
                onChange={e => setForm(f => ({ ...f, data_transacao: e.target.value }))}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Descrição *</label>
            <input
              type="text" placeholder="Ex: Assinatura Evolution API, Sinal cliente..."
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="input-field w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Categoria</label>
              <select
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="input-field w-full"
              >
                {CATEGORIAS.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Forma de pagamento</label>
              <select
                value={form.forma_pagamento}
                onChange={e => setForm(f => ({ ...f, forma_pagamento: e.target.value }))}
                className="input-field w-full"
              >
                <option value="">Não informado</option>
                <option value="pix">PIX</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Referência (cliente/plano)</label>
            <input
              type="text" placeholder="Ex: Cliente ZapGpt, Renovação plano Pro..."
              value={form.referencia}
              onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-zinc-800">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.valor || !form.descricao}
            className={cn('btn-primary flex-1 justify-center', form.tipo === 'saida' && 'bg-red-500 hover:bg-red-600 shadow-red-900/30')}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('tudo')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<Transacao | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [search, setSearch] = useState('')
  const [showPeriodoMenu, setShowPeriodoMenu] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTransacoes(periodo)
      setTransacoes(data)
    } catch (e) {
      console.error('Erro ao carregar transações:', e)
    } finally {
      setLoading(false)
    }
  }, [periodo])

  useEffect(() => { load() }, [load])

  const metrics = calcularMetrics(transacoes)

  const transacoesFiltradas = transacoes.filter(t => {
    if (filtroTipo !== 'todos' && t.tipo !== filtroTipo) return false
    if (filtroCategoria && t.categoria !== filtroCategoria) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        t.descricao?.toLowerCase().includes(s) ||
        t.referencia?.toLowerCase().includes(s) ||
        t.categoria?.toLowerCase().includes(s)
      )
    }
    return true
  })

  async function handleDelete(id: number) {
    await deletarTransacao(id)
    setDeleteConfirm(null)
    load()
  }

  const periodoLabel = periodoOptions.find(p => p.value === periodo)?.label || 'Este mês'

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="text-blue-400" size={26} />
            Financeiro
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Controle de entradas e saídas — ZapGpt AI</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowPeriodoMenu(!showPeriodoMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-all"
            >
              <Calendar size={14} />
              {periodoLabel}
              <ChevronDown size={14} />
            </button>
            {showPeriodoMenu && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-48 py-1">
                {periodoOptions.map(p => (
                  <button
                    key={p.value}
                    onClick={() => { setPeriodo(p.value); setShowPeriodoMenu(false) }}
                    className={cn('w-full text-left px-4 py-2 text-sm transition-colors',
                      periodo === p.value ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-300 hover:text-white hover:bg-zinc-800')}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={load} className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus size={16} />Nova
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cn('card p-5 flex flex-col gap-3 col-span-2 lg:col-span-1',
          metrics.saldo >= 0 ? 'border-blue-500/25' : 'border-red-500/25')}>
          <div className="flex items-start justify-between">
            <div className={cn('p-2.5 rounded-xl', metrics.saldo >= 0 ? 'bg-blue-500/15' : 'bg-red-500/15')}>
              <Wallet size={20} className={metrics.saldo >= 0 ? 'text-blue-400' : 'text-red-400'} />
            </div>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
              metrics.saldo >= 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400')}>
              {metrics.saldo >= 0 ? '▲ positivo' : '▼ negativo'}
            </span>
          </div>
          <div>
            <p className={cn('text-2xl font-bold tabular-nums', metrics.saldo >= 0 ? 'text-blue-400' : 'text-red-400')}>
              {formatCurrency(metrics.saldo)}
            </p>
            <p className="text-zinc-400 text-sm">Saldo do período</p>
            <p className="text-zinc-500 text-xs mt-1">Mês: {formatCurrency(metrics.saldoMes)}</p>
          </div>
        </div>

        <div className="card p-5 flex flex-col gap-3 border-blue-500/20">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-blue-500/15">
              <ArrowUpCircle size={20} className="text-blue-400" />
            </div>
            <TrendingUp size={16} className="text-blue-400 mt-1" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400 tabular-nums">{formatCurrency(metrics.totalEntradas)}</p>
            <p className="text-zinc-400 text-sm">Total Entradas</p>
            <p className="text-zinc-500 text-xs mt-1">Mês: {formatCurrency(metrics.entradasMes)}</p>
          </div>
        </div>

        <div className="card p-5 flex flex-col gap-3 border-red-500/20">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-red-500/15">
              <ArrowDownCircle size={20} className="text-red-400" />
            </div>
            <TrendingDown size={16} className="text-red-400 mt-1" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400 tabular-nums">{formatCurrency(metrics.totalSaidas)}</p>
            <p className="text-zinc-400 text-sm">Total Saídas</p>
            <p className="text-zinc-500 text-xs mt-1">Mês: {formatCurrency(metrics.saidasMes)}</p>
          </div>
        </div>

        <div className="card p-5 flex flex-col gap-3 border-purple-500/20">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/15">
              <Hash size={20} className="text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">{metrics.totalTransacoes}</p>
            <p className="text-zinc-400 text-sm">Transações</p>
            <p className="text-zinc-500 text-xs mt-1">{periodoLabel}</p>
          </div>
        </div>
      </div>

      {/* Gráficos — linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            Fluxo Mensal (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <ReBarChart data={metrics.fluxoMensal} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mes" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
              <Bar dataKey="entradas" name="Entradas" fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="saidas" name="Saídas" fill="#f43f5e" radius={[4,4,0,0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Filter size={16} className="text-purple-400" />
            Saídas por Categoria
          </h3>
          {metrics.gastosPorCategoria.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={metrics.gastosPorCategoria.slice(0, 8)}
                    dataKey="total"
                    nameKey="categoria"
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={72}
                    paddingAngle={3}
                  >
                    {metrics.gastosPorCategoria.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {metrics.gastosPorCategoria.slice(0, 5).map((c, i) => {
                  const cat = getCategoriaConfig(c.categoria)
                  return (
                    <div key={c.categoria} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-zinc-400">{cat.emoji} {cat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">{c.percentual.toFixed(0)}%</span>
                        <span className="text-white font-medium tabular-nums">{formatCurrency(c.total)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">Sem dados</div>
          )}
        </div>
      </div>

      {/* Gráficos — linha 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            Entradas vs Saídas — Diário (30 dias)
          </h3>
          {metrics.fluxoDiario.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics.fluxoDiario}>
                <defs>
                  <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="data" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#2563eb" fill="url(#gradEntradas)" strokeWidth={2} />
                <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#f43f5e" fill="url(#gradSaidas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">Sem movimentações nos últimos 30 dias</div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-yellow-400" />
            Ranking de Categorias (Saídas)
          </h3>
          {metrics.gastosPorCategoria.length > 0 ? (
            <div className="space-y-3">
              {metrics.gastosPorCategoria.slice(0, 7).map((c, i) => {
                const cat = getCategoriaConfig(c.categoria)
                const maxVal = metrics.gastosPorCategoria[0]?.total || 1
                return (
                  <div key={c.categoria}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-zinc-300 flex items-center gap-1.5">
                        <span>{cat.emoji}</span> {cat.label}
                      </span>
                      <span className="text-white font-semibold tabular-nums">{formatCurrency(c.total)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(c.total / maxVal) * 100}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">Sem dados de saídas</div>
          )}
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-zinc-800">
          <h3 className="text-white font-semibold">Transações</h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="text" placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field text-sm py-1.5 px-3 w-40"
            />
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value as any)}
              className="input-field text-sm py-1.5 px-3"
            >
              <option value="todos">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="input-field text-sm py-1.5 px-3"
            >
              <option value="">Todas categorias</option>
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">Data</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">Tipo</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">Descrição</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Pagamento</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden xl:table-cell">Referência</th>
                <th className="text-right px-5 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">Valor</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-zinc-800 rounded animate-pulse w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-zinc-600">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map(t => {
                  const cat = getCategoriaConfig(t.categoria)
                  const isEntrada = t.tipo === 'entrada'
                  return (
                    <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-5 py-3.5 text-zinc-600 text-xs">{t.id}</td>
                      <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">{t.data_transacao || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('badge',
                          isEntrada ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400')}>
                          {isEntrada ? '↑' : '↓'} {isEntrada ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-200 max-w-[200px] truncate">{t.descricao || '—'}</td>
                      <td className="px-5 py-3.5 text-zinc-400 hidden md:table-cell">
                        <span className="flex items-center gap-1">{cat.emoji} {cat.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 hidden lg:table-cell capitalize">{t.forma_pagamento || '—'}</td>
                      <td className="px-5 py-3.5 text-zinc-500 hidden xl:table-cell max-w-[150px] truncate">{t.referencia || '—'}</td>
                      <td className={cn('px-5 py-3.5 text-right font-semibold tabular-nums',
                        isEntrada ? 'text-blue-400' : 'text-red-400')}>
                        {isEntrada ? '+' : '-'}{formatCurrency(t.valor)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditData(t); setShowModal(true) }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          >
                            <Edit2 size={13} />
                          </button>
                          {deleteConfirm === t.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"><Check size={13} /></button>
                              <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-700 transition-all"><X size={13} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(t.id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            {transacoesFiltradas.length > 0 && (
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td colSpan={7} className="px-5 py-3 text-zinc-500 text-xs">
                    {transacoesFiltradas.length} transações
                  </td>
                  <td className="px-5 py-3 text-right text-xs font-semibold">
                    <span className="text-blue-400">
                      +{formatCurrency(transacoesFiltradas.filter(t => t.tipo === 'entrada').reduce((s,t) => s + Number(t.valor), 0))}
                    </span>
                    <span className="text-zinc-600 mx-1">/</span>
                    <span className="text-red-400">
                      -{formatCurrency(transacoesFiltradas.filter(t => t.tipo === 'saida').reduce((s,t) => s + Number(t.valor), 0))}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {showModal && (
        <TransacaoModal
          onClose={() => { setShowModal(false); setEditData(null) }}
          onSave={load}
          editData={editData}
        />
      )}
    </div>
  )
}

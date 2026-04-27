'use client'

import { useState } from 'react'
import { Search, Plus, X, MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEGMENTOS_PADRAO = [
  { id: 'clinica medica',        label: 'Clínica Médica',        emoji: '🏥' },
  { id: 'clinica estetica',      label: 'Clínica Estética',      emoji: '💆' },
  { id: 'dentista',              label: 'Dentista',              emoji: '🦷' },
  { id: 'clinica oftalmologica', label: 'Oftalmologia',          emoji: '👁️' },
  { id: 'psicologo',             label: 'Psicólogo',             emoji: '🧠' },
  { id: 'terapeuta',             label: 'Terapeuta',             emoji: '🧘' },
  { id: 'nutricionista',         label: 'Nutricionista',         emoji: '🥗' },
  { id: 'fisioterapia',          label: 'Fisioterapia',          emoji: '💪' },
  { id: 'restaurante',           label: 'Restaurante',           emoji: '🍽️' },
  { id: 'salao de beleza',       label: 'Salão de Beleza',       emoji: '💇' },
  { id: 'academia',              label: 'Academia',              emoji: '🏋️' },
  { id: 'ecommerce',             label: 'E-commerce',            emoji: '🛒' },
  { id: 'imobiliaria',           label: 'Imobiliária',           emoji: '🏠' },
  { id: 'educacao',              label: 'Educação / Cursos',     emoji: '📚' },
  { id: 'advocacia',             label: 'Advocacia',             emoji: '⚖️' },
  { id: 'contabilidade',         label: 'Contabilidade',         emoji: '📊' },
  { id: 'pet shop',              label: 'Pet Shop',              emoji: '🐾' },
  { id: 'farmacia',              label: 'Farmácia',              emoji: '💊' },
]

const CIDADES_SUGERIDAS = [
  'Niterói, RJ',
  'São Gonçalo, RJ',
  'Rio de Janeiro, RJ',
  'Maricá, RJ',
  'Itaboraí, RJ',
  'Cabo Frio, RJ',
  'Nova Friburgo, RJ',
  'Petrópolis, RJ',
]

const DEFAULT_SEGMENTOS = ['clinica medica', 'clinica estetica', 'dentista', 'clinica oftalmologica', 'psicologo', 'terapeuta']
const DEFAULT_CIDADES = ['Niterói, RJ', 'São Gonçalo, RJ']

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ProspectarForm() {
  const [segmentos, setSegmentos] = useState<string[]>(DEFAULT_SEGMENTOS)
  const [cidades, setCidades] = useState<string[]>(DEFAULT_CIDADES)
  const [cidadeInput, setCidadeInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function toggleSegmento(id: string) {
    setSegmentos(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function toggleCidade(cidade: string) {
    setCidades(prev =>
      prev.includes(cidade) ? prev.filter(c => c !== cidade) : [...prev, cidade]
    )
  }

  function addCidadeCustom() {
    const val = cidadeInput.trim()
    if (val && !cidades.includes(val)) {
      setCidades(prev => [...prev, val])
    }
    setCidadeInput('')
  }

  function removeCidade(cidade: string) {
    setCidades(prev => prev.filter(c => c !== cidade))
  }

  async function handleSubmit() {
    if (!segmentos.length || !cidades.length) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/prospectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentos, cidades }),
      })
      if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`)
      setStatus('success')
    } catch (err) {
      setErrorMsg(String(err))
      setStatus('error')
    }
  }

  function resetForm() {
    setStatus('idle')
    setErrorMsg('')
  }

  if (status === 'success') {
    return (
      <div className="card p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700/50 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-100 mb-1">Prospecção Iniciada!</h3>
          <p className="text-zinc-400 text-sm">
            Buscando leads no Google Maps para <span className="text-zinc-200 font-medium">{segmentos.length} segmentos</span> em <span className="text-zinc-200 font-medium">{cidades.length} cidades</span>.
          </p>
          <p className="text-zinc-500 text-xs mt-2">Os leads aparecerão no CRM nas próximas horas.</p>
        </div>

        <div className="w-full max-w-md bg-zinc-900 rounded-xl p-4 text-left mt-2 space-y-2">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-3">Resumo</p>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Segmentos</p>
            <div className="flex flex-wrap gap-1.5">
              {segmentos.map(s => {
                const cfg = SEGMENTOS_PADRAO.find(x => x.id === s)
                return (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 border border-blue-700/40 text-blue-300">
                    {cfg ? `${cfg.emoji} ${cfg.label}` : s}
                  </span>
                )
              })}
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1 mt-3">Cidades</p>
            <div className="flex flex-wrap gap-1.5">
              {cidades.map(c => (
                <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300">
                  <MapPin size={10} className="inline mr-1" />{c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button onClick={resetForm} className="btn-secondary text-sm mt-2">
          Nova Prospecção
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Segments */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-zinc-100 font-semibold text-sm">Segmentos de Negócio</h3>
            <p className="text-zinc-500 text-xs mt-0.5">{segmentos.length} selecionados</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSegmentos(SEGMENTOS_PADRAO.map(s => s.id))}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Todos
            </button>
            <span className="text-zinc-700">·</span>
            <button
              onClick={() => setSegmentos([])}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {SEGMENTOS_PADRAO.map(({ id, label, emoji }) => {
            const selected = segmentos.includes(id)
            return (
              <button
                key={id}
                onClick={() => toggleSegmento(id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left',
                  selected
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                )}
              >
                <span className="text-sm flex-shrink-0">{emoji}</span>
                <span className="leading-tight">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cities */}
      <div className="card p-5">
        <h3 className="text-zinc-100 font-semibold text-sm mb-1">Cidades / Regiões</h3>
        <p className="text-zinc-500 text-xs mb-4">{cidades.length} selecionadas</p>

        {/* Suggested cities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CIDADES_SUGERIDAS.map(cidade => {
            const selected = cidades.includes(cidade)
            return (
              <button
                key={cidade}
                onClick={() => toggleCidade(cidade)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  selected
                    ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                    : 'bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                )}
              >
                <MapPin size={10} className="flex-shrink-0" />
                {cidade}
              </button>
            )
          })}
        </div>

        {/* Custom city input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={cidadeInput}
              onChange={e => setCidadeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCidadeCustom()}
              placeholder="Adicionar cidade personalizada..."
              className="w-full bg-zinc-800/60 border border-zinc-700/40 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <button
            onClick={addCidadeCustom}
            disabled={!cidadeInput.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700/40 text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {/* Selected cities (custom) */}
        {cidades.filter(c => !CIDADES_SUGERIDAS.includes(c)).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {cidades.filter(c => !CIDADES_SUGERIDAS.includes(c)).map(c => (
              <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-purple-500/20 border border-purple-500/50 text-purple-300">
                <MapPin size={9} />
                {c}
                <button onClick={() => removeCidade(c)} className="ml-0.5 hover:text-white transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary + Submit */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-zinc-400">
            {segmentos.length === 0 || cidades.length === 0 ? (
              <span className="text-amber-400">Selecione ao menos 1 segmento e 1 cidade</span>
            ) : (
              <>
                Vai buscar <span className="text-zinc-200 font-semibold">{segmentos.length} segmentos</span> em{' '}
                <span className="text-zinc-200 font-semibold">{cidades.length} cidades</span>{' '}
                <span className="text-zinc-600">({segmentos.length * cidades.length} buscas)</span>
              </>
            )}
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === 'loading' || !segmentos.length || !cidades.length}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all',
              'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {status === 'loading' ? (
              <><Loader2 size={16} className="animate-spin" /> Iniciando...</>
            ) : (
              <><Search size={16} /> Prospectar Agora</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Loader2, Clock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Exec {
  id: number
  status: 'success' | 'error' | 'running' | 'waiting'
  mode: string
  startedAt: string
  stoppedAt: string | null
  finished: boolean
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function duration(exec: Exec) {
  if (!exec.stoppedAt || !exec.startedAt) return '—'
  const ms = new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function ExecucoesStatus({ refreshKey }: { refreshKey: number }) {
  const [execs, setExecs] = useState<Exec[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/execucoes-prospectar', { cache: 'no-store' })
      const data = await res.json()
      setExecs(data)
      setLastRefresh(Date.now())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load, refreshKey])

  // Auto-refresh every 10s if there's a running execution
  useEffect(() => {
    const hasRunning = execs.some(e => !e.finished)
    if (!hasRunning) return
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [execs, load])

  if (!loading && execs.length === 0) return null

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-100 font-semibold text-sm">Histórico de Execuções</h3>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={12} className={cn(loading && 'animate-spin')} />
          Atualizar
        </button>
      </div>

      <div className="space-y-2">
        {execs.map(exec => (
          <div
            key={exec.id}
            className={cn(
              'flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm',
              exec.status === 'success' && 'bg-green-900/20 border-green-800/40',
              exec.status === 'error'   && 'bg-red-900/20 border-red-800/40',
              !exec.finished            && 'bg-blue-900/20 border-blue-800/40'
            )}
          >
            <div className="flex items-center gap-2.5">
              {exec.status === 'success' && <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />}
              {exec.status === 'error'   && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
              {!exec.finished            && <Loader2 size={14} className="text-blue-400 animate-spin flex-shrink-0" />}
              <span className={cn(
                'font-medium',
                exec.status === 'success' && 'text-green-300',
                exec.status === 'error'   && 'text-red-300',
                !exec.finished            && 'text-blue-300'
              )}>
                {!exec.finished ? 'Rodando...' : exec.status === 'success' ? 'Concluído' : 'Erro'}
              </span>
              <span className="text-zinc-600 text-xs">#{exec.id}</span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                exec.mode === 'webhook' ? 'bg-blue-900/40 text-blue-400' : 'bg-zinc-800 text-zinc-500'
              )}>
                {exec.mode === 'webhook' ? 'manual' : exec.mode}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {duration(exec)}
              </span>
              <span>{timeAgo(exec.startedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {execs.some(e => !e.finished) && (
        <p className="text-xs text-blue-400 mt-3 flex items-center gap-1.5">
          <Loader2 size={11} className="animate-spin" />
          Atualizando automaticamente a cada 10 segundos...
        </p>
      )}
    </div>
  )
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { StatusLead, Segmento } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}

export function formatDateFull(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function getCurrentDatePT(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  EM_ATENDIMENTO: {
    label: 'Em Atendimento',
    color: 'text-blue-300',
    bg: 'bg-blue-900/40 border border-blue-700/50',
    dot: 'bg-blue-400',
  },
  PROPOSTA_ENVIADA: {
    label: 'Proposta Enviada',
    color: 'text-orange-300',
    bg: 'bg-orange-900/40 border border-orange-700/50',
    dot: 'bg-orange-400',
  },
  AGUARDANDO_SINAL: {
    label: 'Aguardando Sinal',
    color: 'text-yellow-300',
    bg: 'bg-yellow-900/40 border border-yellow-700/50',
    dot: 'bg-yellow-400',
  },
  COMPROVANTE_RECEBIDO: {
    label: 'Comprovante Recebido',
    color: 'text-purple-300',
    bg: 'bg-purple-900/40 border border-purple-700/50',
    dot: 'bg-purple-400',
  },
  FECHADO: {
    label: '✅ Fechado',
    color: 'text-green-300',
    bg: 'bg-green-900/40 border border-green-700/50',
    dot: 'bg-green-400',
  },
  Perdido: {
    label: 'Perdido',
    color: 'text-red-300',
    bg: 'bg-red-900/40 border border-red-700/50',
    dot: 'bg-red-400',
  },
}

export const SEGMENTO_CONFIG: Record<Segmento | string, { label: string; emoji: string }> = {
  restaurante: { label: 'Restaurante', emoji: '🍽️' },
  clinica: { label: 'Clínica', emoji: '🏥' },
  salao: { label: 'Salão de Beleza', emoji: '💇' },
  academia: { label: 'Academia', emoji: '🏋️' },
  ecommerce: { label: 'E-commerce', emoji: '🛒' },
  imobiliaria: { label: 'Imobiliária', emoji: '🏠' },
  educacao: { label: 'Educação', emoji: '📚' },
  outro: { label: 'Outro', emoji: '💼' },
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? {
    label: status,
    color: 'text-zinc-400',
    bg: 'bg-zinc-900/60 border border-zinc-700/50',
    dot: 'bg-zinc-500',
  }
}

export function getSegmentoConfig(segmento: string) {
  return SEGMENTO_CONFIG[segmento] ?? { label: segmento, emoji: '💼' }
}

export function getCategoriaConfig(categoria: string) {
  return getSegmentoConfig(categoria)
}

export function getMesLabel(dateStr: string): string {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  try {
    const [year, month] = dateStr.split('-')
    return `${meses[parseInt(month) - 1]}/${year.slice(2)}`
  } catch {
    return dateStr
  }
}

export function getLast6Months(): string[] {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
  }
  return months
}

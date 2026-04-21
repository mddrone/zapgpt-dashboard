'use client'

import { usePathname } from 'next/navigation'
import { getCurrentDatePT } from '@/lib/utils'
import { CalendarDays, Bell } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'CRM / Leads',
  '/pipeline': 'Pipeline',
  '/metricas': 'Métricas',
  '/financeiro': 'Financeiro',
  '/config': 'Configurações',
}

export function Header() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'ZapGpt AI'
  const dateStr = getCurrentDatePT()

  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-black/90 backdrop-blur-sm border-b border-zinc-900/80">
      <div className="ml-10 md:ml-0">
        <h1 className="text-white font-semibold text-base md:text-lg leading-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-xs">
          <CalendarDays size={14} className="text-blue-400" />
          <span className="capitalize">{formattedDate}</span>
        </div>

        <div className="w-px h-5 bg-zinc-800 hidden sm:block" />

        <button className="relative p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors">
          <Bell size={17} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-black" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-md">
          ZG
        </div>
      </div>
    </header>
  )
}

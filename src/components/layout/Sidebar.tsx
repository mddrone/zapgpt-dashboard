'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Kanban,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Zap,
  Menu,
  X,
  Wallet,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'CRM / Leads', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/metricas', label: 'Métricas', icon: BarChart3 },
  { href: '/prospectar', label: 'Prospectar', icon: Search },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/config', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-300 hover:text-blue-400 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col bg-zinc-900 border-r border-zinc-800/50 transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-60',
          'max-md:translate-x-[-100%] max-md:w-72',
          mobileOpen && 'max-md:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-zinc-800/50',
          collapsed && 'justify-center px-0'
        )}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Bot size={18} className="text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-400 border-2 border-zinc-900 animate-pulse" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm tracking-wide leading-tight">ZapGpt AI</p>
              <p className="text-blue-400 text-[10px] font-medium tracking-widest uppercase leading-tight">CRM Dashboard</p>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto md:hidden text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                  active
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  size={18}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    active ? 'text-blue-400' : 'text-zinc-600 group-hover:text-zinc-300'
                  )}
                />
                {!collapsed && <span>{label}</span>}
                {active && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden md:flex p-3 border-t border-zinc-800/50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all',
              collapsed && 'justify-center'
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Recolher</span></>}
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 text-[10px] text-zinc-700">
              <Zap size={10} />
              <span>Automação com IA</span>
            </div>
          </div>
        )}
      </aside>

      {/* Spacer for desktop layout */}
      <div className={cn(
        'hidden md:block flex-shrink-0 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-60'
      )} />
    </>
  )
}

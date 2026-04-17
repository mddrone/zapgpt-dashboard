import { getLeads } from '@/lib/api'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { Users } from 'lucide-react'

export const revalidate = 60

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-xs">
            Gerencie e acompanhe todos os seus leads
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
          <Users size={14} className="text-green-400" />
          <span className="text-zinc-300 text-sm font-medium">{leads.length} leads</span>
        </div>
      </div>

      <LeadsTable initialLeads={leads} />
    </div>
  )
}

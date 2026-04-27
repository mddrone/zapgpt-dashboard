import { Search } from 'lucide-react'
import { ProspectarForm } from '@/components/prospectar/ProspectarForm'
import { LeadsRecentes } from '@/components/prospectar/LeadsRecentes'

export const metadata = { title: 'Prospectar Leads — ZapGpt AI' }

export default function ProspectarPage() {
  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
          <Search size={18} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Prospectar Leads</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Busca automática no Google Maps — selecione segmentos e cidades e a IA faz o resto.
          </p>
        </div>
      </div>

      <ProspectarForm />

      <div>
        <LeadsRecentes refreshKey={0} />
      </div>
    </div>
  )
}

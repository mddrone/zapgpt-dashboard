import { getLeads, computeMetricsFromLeads } from '@/lib/api'
import { MetricasCharts } from '@/components/dashboard/MetricasCharts'

export const revalidate = 60

export default async function MetricasPage() {
  const leads = await getLeads()
  const metrics = computeMetricsFromLeads(leads)

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <p className="text-zinc-400 text-xs">
          Análise detalhada de performance e conversão
        </p>
      </div>
      <MetricasCharts metrics={metrics} />
    </div>
  )
}

export interface Lead {
  Data: string
  Nome: string
  Celular: string
  Email: string
  Origem: string
  Segmento: string
  Plano: string
  Status_lead: StatusLead
  Ultima_interacao: string
  Proxima_acao: string
  Followup_data_hora: string
  Erro_fluxo: string
  Atendimento_concluido: string
  Observacoes: string
  Followup_24h: string
  Followup_48h: string
  Followup_72h: string
  Demo_enviada: string
  Proposta_enviada: string
  Fechado: string
  Perdido: string
  Motivo_perda: string
  data_cadastro: string
}

export type StatusLead =
  | 'EM_ATENDIMENTO'
  | 'DEMO_ENVIADA'
  | 'PROPOSTA_ENVIADA'
  | 'AGUARDANDO_PAGAMENTO'
  | 'FECHADO'
  | 'Atendimento_humano'
  | 'Parado'
  | 'Perdido'

export type Segmento =
  | 'restaurante'
  | 'clinica'
  | 'salao'
  | 'academia'
  | 'ecommerce'
  | 'imobiliaria'
  | 'educacao'
  | 'outro'

export interface Metrics {
  totalLeads: number
  leadsHoje: number
  fechamentosEsteMes: number
  taxaConversao: number
  leadsEmAtendimento: number
  leadsPorMes: MonthData[]
  funilPorStatus: StatusData[]
  leadsPorSegmento: CategoryData[]
  fechamentosVsLeads: MonthComparison[]
  leadsPorOrigem: OrigemData[]
  leadsPorMesAproveitamento: AproveitamentoData[]
  topSegmentosFechados: CategoryClose[]
}

export interface MonthData {
  mes: string
  leads: number
}

export interface StatusData {
  status: string
  count: number
}

export interface CategoryData {
  categoria: string
  count: number
}

export interface MonthComparison {
  mes: string
  leads: number
  fechamentos: number
}

export interface OrigemData {
  origem: string
  count: number
}

export interface AproveitamentoData {
  mes: string
  taxa: number
}

export interface CategoryClose {
  categoria: string
  fechados: number
  total: number
  taxa: number
}

// ── Financeiro ──────────────────────────────────────────────────────────────

export interface Transacao {
  id: number
  data_transacao: string
  tipo: 'entrada' | 'saida'
  categoria: string
  descricao: string
  valor: number
  forma_pagamento: string
  referencia: string
  observacoes: string
  created_at: string
}

export interface FinanceiroMetrics {
  saldo: number
  totalEntradas: number
  totalSaidas: number
  totalTransacoes: number
  entradasMes: number
  saidasMes: number
  saldoMes: number
  gastosPorCategoria: { categoria: string; total: number; percentual: number }[]
  fluxoMensal: { mes: string; entradas: number; saidas: number; saldo: number }[]
  fluxoDiario: { data: string; entradas: number; saidas: number; saldo: number }[]
  ultimasTransacoes: Transacao[]
}

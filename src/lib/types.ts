export interface Lead {
  Data: string
  Nome: string
  Telefone: string
  Origem: string
  Tipo_evento: string
  Categoria: string
  Data_evento: string
  Horário_evento: string
  Cidade: string
  Local_evento: string
  Forma_atendimento: string
  Status_evento: string
  Status_lead: StatusLead
  Ultima_interação: string
  Proxima_ação: string
  Melhor_dia_horário: string
  Followup_data_hora: string
  Agendamento_pendente: string
  Agendamento_confirmado: string
  Responsável: string
  Erro_fluxo: string
  Atendimento_concluido: string
  Observações: string
  Followup_24h: string
  Followup_48h: string
  Followup_72h: string
  Portfolio_enviado: string
  Orcamento_enviado: string
  Fechado: string
  Perdido: string
  Motivo_perda: string
  data_cadastro: string
}

export type StatusLead =
  | 'EM_ATENDIMENTO'
  | 'ORCAMENTO_ENVIADO'
  | 'AGUARDANDO_SINAL'
  | 'COMPROVANTE_RECEBIDO'
  | 'FECHADO'
  | 'Agendado'
  | 'Atendimento_humano'
  | 'Parado'
  | 'Perdido'

export type Categoria =
  | 'casamento'
  | '15_anos'
  | 'aniversario'
  | 'ensaio'
  | 'infantil'
  | 'corporativo'
  | 'outro'

export interface Metrics {
  totalLeads: number
  leadsHoje: number
  fechamentosEsteMes: number
  taxaConversao: number
  leadsEmAtendimento: number
  leadsPorMes: MonthData[]
  funilPorStatus: StatusData[]
  leadsPorCategoria: CategoryData[]
  fechamentosVsLeads: MonthComparison[]
  leadsPorOrigem: OrigemData[]
  leadsPorMesAproveitamento: AproveitamentoData[]
  topCategoriasFechadas: CategoryClose[]
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

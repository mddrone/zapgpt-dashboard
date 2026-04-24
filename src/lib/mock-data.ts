import type { Lead, StatusLead, Segmento } from './types'

const statuses: StatusLead[] = [
  'EM_ATENDIMENTO',
  'EM_ATENDIMENTO',
  'EM_ATENDIMENTO',
  'PROPOSTA_ENVIADA',
  'AGUARDANDO_SINAL',
  'COMPROVANTE_RECEBIDO',
  'FECHADO',
  'FECHADO',
  'Perdido',
]

const segmentos: Segmento[] = [
  'restaurante',
  'clinica',
  'salao',
  'academia',
  'ecommerce',
  'imobiliaria',
  'educacao',
  'outro',
]

const planos = ['START', 'PRO', 'SMART', 'BUSINESS', 'ENTERPRISE', '']

const nomes = [
  'Ana Carolina Silva', 'Bruno Ferreira Santos', 'Camila Oliveira', 'Diego Martins',
  'Fernanda Costa', 'Gabriel Souza', 'Isabela Rocha', 'João Paulo Lima',
  'Larissa Mendes', 'Marcelo Alves', 'Natalia Pereira', 'Paulo Henrique',
  'Rafaela Gomes', 'Ricardo Barbosa', 'Sandra Melo', 'Thiago Carvalho',
  'Vanessa Nunes', 'Wagner Ribeiro', 'Yasmin Torres', 'André Batista',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPhone(): string {
  const ddd = ['11', '21', '31', '41', '51', '61', '71', '85']
  return `55${randomItem(ddd)}9${Math.floor(Math.random() * 9000 + 1000)}${Math.floor(Math.random() * 9000 + 1000)}`
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return d.toISOString().split('T')[0]
}

function randomPastDate(daysBack = 180): string {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - daysBack)
  return randomDate(start, end)
}

export function generateMockLeads(): Lead[] {
  const leads: Lead[] = []
  const today = new Date().toISOString().split('T')[0]

  for (let i = 0; i < 30; i++) {
    const status = randomItem(statuses)
    const isFechado = status === 'FECHADO'
    const isPerdido = status === 'Perdido'
    const isToday = i < 3
    const cadastro = isToday ? today : randomPastDate(150)

    leads.push({
      Data: cadastro,
      Nome: randomItem(nomes),
      Celular: randomPhone(),
      Segmento: randomItem(segmentos),
      Plano: randomItem(planos),
      Status_lead: status,
      Ultima_interacao: randomPastDate(30),
      Observacoes: randomItem([
        'Cliente quer automatizar atendimento',
        'Interesse no plano PRO',
        'Aguardando aprovação do sócio',
        'Pediu demonstração personalizada',
        'Segunda conversa agendada',
        '',
      ]),
      Erro_fluxo: '',
      Atendimento_concluido: isFechado || isPerdido ? 'sim' : 'nao',
      fechado: isFechado ? 'sim' : 'nao',
      perdido: isPerdido ? 'sim' : 'nao',
      data_cadastro: cadastro,
    })
  }

  return leads
}

export const MOCK_LEADS = generateMockLeads()

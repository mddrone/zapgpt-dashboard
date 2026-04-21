import type { Lead, StatusLead, Segmento } from './types'

const statuses: StatusLead[] = [
  'EM_ATENDIMENTO',
  'DEMO_ENVIADA',
  'PROPOSTA_ENVIADA',
  'AGUARDANDO_PAGAMENTO',
  'FECHADO',
  'Atendimento_humano',
  'Parado',
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

const planos = [
  'Starter R$197/mês',
  'Pro R$397/mês',
  'Premium R$697/mês',
  'Anual Pro',
  'Anual Premium',
]

const origens = [
  'Instagram',
  'WhatsApp',
  'Indicação',
  'Google',
  'Facebook',
  'Site',
  'Prospecção',
]

const nomes = [
  'Ana Carolina Silva',
  'Bruno Ferreira Santos',
  'Camila Oliveira',
  'Diego Martins',
  'Fernanda Costa',
  'Gabriel Souza',
  'Isabela Rocha',
  'João Paulo Lima',
  'Larissa Mendes',
  'Marcelo Alves',
  'Natalia Pereira',
  'Paulo Henrique',
  'Rafaela Gomes',
  'Ricardo Barbosa',
  'Sandra Melo',
  'Thiago Carvalho',
  'Vanessa Nunes',
  'Wagner Ribeiro',
  'Yasmin Torres',
  'André Batista',
  'Beatriz Cunha',
  'Carlos Eduardo',
  'Daniela Freitas',
  'Eduardo Pinto',
  'Flavia Azevedo',
  'Gustavo Moreira',
  'Helena Campos',
  'Igor Nascimento',
  'Julia Cardoso',
  'Lucas Teixeira',
  'Mariana Vieira',
  'Nicolas Duarte',
  'Olivia Machado',
  'Pedro Andrade',
  'Quezia Fernandes',
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

  for (let i = 0; i < 35; i++) {
    const status = randomItem(statuses)
    const segmento = randomItem(segmentos)
    const isFechado = status === 'FECHADO'
    const isPerdido = status === 'Perdido'
    const hasDemo = ['DEMO_ENVIADA', 'PROPOSTA_ENVIADA', 'AGUARDANDO_PAGAMENTO', 'FECHADO'].includes(status)

    const isToday = i < 3
    const cadastro = isToday ? today : randomPastDate(150)

    leads.push({
      Data: cadastro,
      Nome: randomItem(nomes),
      Celular: randomPhone(),
      Email: `lead${i}@exemplo.com`,
      Origem: randomItem(origens),
      Segmento: segmento,
      Plano: randomItem(planos),
      Status_lead: status,
      Ultima_interacao: randomPastDate(30),
      Proxima_acao: randomItem([
        'Enviar demo',
        'Ligar cliente',
        'Enviar proposta',
        'Confirmar pagamento',
        'Aguardar retorno',
        'Fechar contrato',
      ]),
      Followup_data_hora: randomPastDate(20),
      Erro_fluxo: Math.random() > 0.9 ? 'Sim' : 'Não',
      Atendimento_concluido: isFechado || isPerdido ? 'Sim' : 'Não',
      Observacoes: randomItem([
        'Cliente quer automatizar atendimento',
        'Interesse no plano Premium',
        'Aguardando aprovação do sócio',
        'Pediu desconto especial',
        'Segunda reunião agendada',
        '',
      ]),
      Followup_24h: Math.random() > 0.5 ? 'Enviado' : 'Pendente',
      Followup_48h: Math.random() > 0.5 ? 'Enviado' : 'Pendente',
      Followup_72h: Math.random() > 0.6 ? 'Enviado' : 'Pendente',
      Demo_enviada: hasDemo ? 'Sim' : 'Não',
      Proposta_enviada: ['PROPOSTA_ENVIADA', 'AGUARDANDO_PAGAMENTO', 'FECHADO'].includes(status) ? 'Sim' : 'Não',
      Fechado: isFechado ? 'Sim' : 'Não',
      Perdido: isPerdido ? 'Sim' : 'Não',
      Motivo_perda: isPerdido
        ? randomItem(['Preço alto', 'Escolheu concorrente', 'Sem budget agora', 'Sem retorno', 'Não viu valor'])
        : '',
      data_cadastro: cadastro,
    })
  }

  return leads
}

export const MOCK_LEADS = generateMockLeads()

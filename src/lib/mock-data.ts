import type { Lead, StatusLead, Categoria } from './types'

const statuses: StatusLead[] = [
  'EM_ATENDIMENTO',
  'ORCAMENTO_ENVIADO',
  'AGUARDANDO_SINAL',
  'COMPROVANTE_RECEBIDO',
  'FECHADO',
  'Agendado',
  'Atendimento_humano',
  'Parado',
  'Perdido',
]

const categorias: Categoria[] = [
  'casamento',
  '15_anos',
  'aniversario',
  'ensaio',
  'infantil',
  'corporativo',
  'outro',
]

const origens = [
  'Instagram',
  'WhatsApp',
  'Indicação',
  'Google',
  'Facebook',
  'Site',
  'TikTok',
]

const cidades = [
  'São Paulo',
  'Rio de Janeiro',
  'Curitiba',
  'Belo Horizonte',
  'Porto Alegre',
  'Campinas',
  'Florianópolis',
  'Salvador',
  'Brasília',
  'Fortaleza',
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

const locais = [
  'Espaço Arjun',
  'Buffet Vila Real',
  'Chácara Bela Vista',
  'Salão Nobre',
  'Casa de Festas Aurora',
  'Hotel Grand Hyatt',
  'Espaço Giardino',
  'Haras Santa Cruz',
  'Club de Campo',
  'Sítio das Flores',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPhone(): string {
  const ddd = ['11', '21', '31', '41', '51', '61', '71', '85']
  return `(${randomItem(ddd)}) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return d.toISOString().split('T')[0]
}

function randomFutureDate(): string {
  const start = new Date()
  const end = new Date()
  end.setMonth(end.getMonth() + 6)
  return randomDate(start, end)
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
    const categoria = randomItem(categorias)
    const isFechado = status === 'FECHADO'
    const isPerdido = status === 'Perdido'
    const hasOrcamento = ['ORCAMENTO_ENVIADO', 'AGUARDANDO_SINAL', 'COMPROVANTE_RECEBIDO', 'FECHADO'].includes(status)

    // Some leads from today
    const isToday = i < 3
    const cadastro = isToday ? today : randomPastDate(150)

    leads.push({
      Data: cadastro,
      Nome: randomItem(nomes),
      Telefone: randomPhone(),
      Origem: randomItem(origens),
      Tipo_evento: categoria === 'corporativo' ? 'Corporativo' : categoria === 'ensaio' ? 'Ensaio Fotográfico' : 'Evento Social',
      Categoria: categoria,
      Data_evento: randomFutureDate(),
      Horário_evento: `${Math.floor(Math.random() * 8 + 10)}:00`,
      Cidade: randomItem(cidades),
      Local_evento: randomItem(locais),
      Forma_atendimento: randomItem(['WhatsApp', 'Telefone', 'Instagram', 'Presencial']),
      Status_evento: randomItem(['Confirmado', 'Pendente', 'A verificar']),
      Status_lead: status,
      Ultima_interação: randomPastDate(30),
      Proxima_ação: randomItem([
        'Enviar portfólio',
        'Ligar cliente',
        'Enviar orçamento',
        'Confirmar data',
        'Aguardar retorno',
        'Fechar contrato',
      ]),
      Melhor_dia_horário: randomItem(['Segunda manhã', 'Terça tarde', 'Quarta', 'Quinta tarde', 'Sexta manhã']),
      Followup_data_hora: randomPastDate(20),
      Agendamento_pendente: Math.random() > 0.7 ? 'Sim' : 'Não',
      Agendamento_confirmado: Math.random() > 0.6 ? 'Sim' : 'Não',
      Responsável: randomItem(['Bruno', 'Equipe MD', 'Atendimento']),
      Erro_fluxo: Math.random() > 0.9 ? 'Sim' : 'Não',
      Atendimento_concluido: isFechado || isPerdido ? 'Sim' : 'Não',
      Observações: randomItem([
        'Cliente solicitou pacote completo',
        'Interesse em drone + foto',
        'Aguardando confirmação do local',
        'Pediu desconto especial',
        'Segunda consulta agendada',
        '',
      ]),
      Followup_24h: Math.random() > 0.5 ? 'Enviado' : 'Pendente',
      Followup_48h: Math.random() > 0.5 ? 'Enviado' : 'Pendente',
      Followup_72h: Math.random() > 0.6 ? 'Enviado' : 'Pendente',
      Portfolio_enviado: Math.random() > 0.4 ? 'Sim' : 'Não',
      Orcamento_enviado: hasOrcamento ? 'Sim' : 'Não',
      Fechado: isFechado ? 'Sim' : 'Não',
      Perdido: isPerdido ? 'Sim' : 'Não',
      Motivo_perda: isPerdido
        ? randomItem(['Preço alto', 'Escolheu outro fotógrafo', 'Cancelou evento', 'Sem retorno', 'Orçamento fora do prazo'])
        : '',
      data_cadastro: cadastro,
    })
  }

  return leads
}

export const MOCK_LEADS = generateMockLeads()

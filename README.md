# MD Drone — CRM Dashboard

Painel de gerenciamento de leads e vendas para o negócio de fotografia e vídeo MD Drone. Construído com Next.js 14, TypeScript, Tailwind CSS e Recharts.

## Funcionalidades

- **Dashboard** — KPIs, gráficos de leads por mês, funil de conversão, categorias e fechamentos
- **CRM / Leads** — Tabela completa com busca, filtros por status e categoria, modal com todos os 32 campos
- **Pipeline** — Kanban com colunas por status de lead
- **Métricas** — Taxa de aproveitamento, top categorias, tempo médio no funil, origem dos leads
- **Configurações** — Status da API, endpoints e instruções

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Rodando localmente

```bash
# 1. Clone ou copie o projeto
cd md-drone-dashboard

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_N8N_BASE_URL=https://hootingrhinoceros-n8n.cloudfy.live
NEXT_PUBLIC_DASHBOARD_TOKEN=mddrone2024
```

Se as variáveis não forem configuradas, o dashboard funciona com dados de demonstração (mock).

## Deploy no Vercel

### Opção 1: Via interface do Vercel

1. Faça push do projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_N8N_BASE_URL`
   - `NEXT_PUBLIC_DASHBOARD_TOKEN`
4. Clique em **Deploy**

### Opção 2: Via Vercel CLI

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Deploy
vercel

# Configure as variáveis de ambiente
vercel env add NEXT_PUBLIC_N8N_BASE_URL
vercel env add NEXT_PUBLIC_DASHBOARD_TOKEN

# Deploy em produção
vercel --prod
```

## Integração com n8n

O dashboard consome três endpoints via webhook do n8n:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/webhook/dash-api?token=TOKEN&type=leads` | Retorna array de leads |
| GET | `/webhook/dash-api?token=TOKEN&type=metrics` | Retorna métricas calculadas |
| POST | `/webhook/dash-api` | Atualiza um lead |

### Formato do POST (atualizar lead)

```json
{
  "token": "mddrone2024",
  "type": "update",
  "id": "telefone_do_lead",
  "data": {
    "Status_lead": "FECHADO"
  }
}
```

### Formato esperado dos leads (GET type=leads)

Array JSON com os campos do Google Sheets:

```json
[
  {
    "Nome": "Ana Silva",
    "Telefone": "(11) 9999-8888",
    "Status_lead": "EM_ATENDIMENTO",
    "Categoria": "casamento",
    ...
  }
]
```

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx          # Layout raiz com sidebar e header
│   ├── page.tsx            # Dashboard principal
│   ├── leads/page.tsx      # CRM / Leads
│   ├── pipeline/page.tsx   # Kanban pipeline
│   ├── metricas/page.tsx   # Métricas e análises
│   └── config/page.tsx     # Configurações
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── dashboard/
│   │   ├── KpiCard.tsx
│   │   ├── Charts.tsx
│   │   └── MetricasCharts.tsx
│   └── leads/
│       ├── LeadsTable.tsx
│       └── LeadModal.tsx
└── lib/
    ├── types.ts            # Interfaces TypeScript
    ├── mock-data.ts        # Dados de demonstração
    ├── api.ts              # Funções de API (n8n + fallback mock)
    └── utils.ts            # Utilitários e helpers
```

## Status dos leads e cores

| Status | Cor |
|--------|-----|
| EM_ATENDIMENTO | Azul |
| ORCAMENTO_ENVIADO | Amarelo |
| AGUARDANDO_SINAL | Laranja |
| COMPROVANTE_RECEBIDO | Roxo |
| FECHADO | Verde |
| Agendado | Ciano |
| Atendimento_humano | Índigo |
| Parado | Cinza |
| Perdido | Vermelho |

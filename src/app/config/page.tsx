import { ExternalLink, CheckCircle, AlertCircle, Key, Globe, Shield, Info } from 'lucide-react'

export default function ConfigPage() {
  const n8nBase = process.env.NEXT_PUBLIC_N8N_BASE_URL || ''
  const token = process.env.NEXT_PUBLIC_DASHBOARD_TOKEN || ''

  const isConfigured = !!n8nBase && !!token
  const maskedToken = token ? token.slice(0, 4) + '•'.repeat(Math.max(0, token.length - 4)) : '—'

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <p className="text-zinc-400 text-xs">
        Configurações do sistema e integrações
      </p>

      {/* Status card */}
      <div className={`card p-5 border ${isConfigured ? 'border-green-700/40' : 'border-yellow-700/40'}`}>
        <div className="flex items-start gap-3">
          {isConfigured ? (
            <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="text-white font-semibold text-sm">
              {isConfigured ? 'Sistema configurado' : 'Configuração pendente'}
            </h3>
            <p className="text-zinc-400 text-xs mt-1">
              {isConfigured
                ? 'A conexão com o n8n está configurada. Os dados serão buscados em tempo real.'
                : 'Configure as variáveis de ambiente para conectar com o n8n. Por enquanto, o dashboard exibe dados de demonstração.'}
            </p>
          </div>
        </div>
      </div>

      {/* API Config */}
      <div className="card p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Globe size={15} className="text-green-400" />
          Configuração da API
        </h3>

        <div className="space-y-3">
          <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800/30">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={12} className="text-zinc-500" />
              <span className="text-zinc-500 text-xs uppercase tracking-wide">URL do n8n (NEXT_PUBLIC_N8N_BASE_URL)</span>
            </div>
            <p className="text-slate-200 text-sm font-mono break-all">
              {n8nBase || <span className="text-zinc-500 italic">Não configurado</span>}
            </p>
          </div>

          <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800/30">
            <div className="flex items-center gap-2 mb-1">
              <Key size={12} className="text-zinc-500" />
              <span className="text-zinc-500 text-xs uppercase tracking-wide">Token (NEXT_PUBLIC_DASHBOARD_TOKEN)</span>
            </div>
            <p className="text-slate-200 text-sm font-mono">
              {maskedToken || <span className="text-zinc-500 italic">Não configurado</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="card p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Shield size={15} className="text-green-400" />
          Endpoints da API
        </h3>

        <div className="space-y-2">
          {[
            { method: 'GET', path: '/webhook/dash-api?token=TOKEN&type=leads', desc: 'Buscar todos os leads' },
            { method: 'GET', path: '/webhook/dash-api?token=TOKEN&type=metrics', desc: 'Buscar métricas' },
            { method: 'POST', path: '/webhook/dash-api', desc: 'Atualizar lead (body: {token, type:"update", id, data})' },
          ].map((ep, i) => (
            <div key={i} className="bg-zinc-950/60 rounded-lg p-3 border border-zinc-800/30">
              <div className="flex items-start gap-3">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${ep.method === 'GET' ? 'bg-blue-900/60 text-blue-400' : 'bg-green-900/60 text-green-400'}`}>
                  {ep.method}
                </span>
                <div>
                  <p className="text-zinc-300 text-xs font-mono">{ep.path}</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">{ep.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* n8n link */}
      {n8nBase && (
        <div className="card p-5 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <ExternalLink size={15} className="text-green-400" />
            Acesso ao n8n
          </h3>
          <a
            href={n8nBase}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <ExternalLink size={14} />
            Abrir n8n
          </a>
          <p className="text-zinc-500 text-xs">{n8nBase}</p>
        </div>
      )}

      {/* How to configure */}
      <div className="card p-5 space-y-3 border border-zinc-800/30">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Info size={15} className="text-green-400" />
          Como configurar
        </h3>
        <ol className="space-y-2 text-zinc-400 text-xs list-none">
          {[
            'Crie o arquivo .env.local na raiz do projeto',
            'Adicione NEXT_PUBLIC_N8N_BASE_URL com a URL da sua instância n8n',
            'Adicione NEXT_PUBLIC_DASHBOARD_TOKEN com o token de autenticação',
            'Reinicie o servidor de desenvolvimento (npm run dev)',
            'No n8n, crie um workflow com webhook em /webhook/dash-api que aceite os tipos: leads, metrics e update',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-4 bg-zinc-950/60 rounded-lg p-3 border border-zinc-800/30">
          <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-2">Conteúdo do .env.local</p>
          <pre className="text-zinc-300 text-xs font-mono whitespace-pre-wrap">
{`NEXT_PUBLIC_N8N_BASE_URL=https://hootingrhinoceros-n8n.cloudfy.live
NEXT_PUBLIC_DASHBOARD_TOKEN=mddrone2024`}
          </pre>
        </div>
      </div>

      {/* Status indicators */}
      <div className="card p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm">Status do Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Dashboard', ok: true },
            { label: 'Dados Mock (fallback)', ok: true },
            { label: 'API n8n', ok: isConfigured },
            { label: 'Autenticação', ok: !!token },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-950/40 rounded-lg px-3 py-2.5 border border-zinc-800/30">
              <span className="text-zinc-400 text-xs">{item.label}</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-400 animate-pulse-slow' : 'bg-red-400'}`} />
                <span className={`text-xs font-medium ${item.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {item.ok ? 'OK' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

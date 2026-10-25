// Agenda do dia: quem precisa de follow-up hoje (prospects e clientes), com o próximo passo sugerido.
// Uso: node motor-local/follow-ups.js
// Lê comercial/pipeline-prospeccao.csv e comercial/financeiro.csv. Gera comercial/follow-ups-AAAA-MM-DD.md.
// Regra: se "data_proximo_passo" estiver preenchida, ela manda. Se não, usa a cadência abaixo a partir de "data".
const fs = require('fs');
const path = require('path');
const { lerArquivo, data, dias } = require('./lib/csv');

const RAIZ = path.join(__dirname, '..');
// status → [dias sem movimento para agir, ação sugerida]
const CADENCIA = {
  'protótipo pronto': [0, 'Enviar a 1ª mensagem (scripts-abordagem.md)'],
  'mensagem enviada': [3, 'Follow-up 1: mandar o vídeo da LP no celular'],
  'follow-up 1': [4, 'Follow-up 2: um dado novo do diagnóstico (ex.: perda estimada)'],
  'follow-up 2': [7, 'Último toque: "posso encerrar por aqui?"'],
  'respondeu': [1, 'Marcar a call (roteiro-call.md)'],
  'call marcada': [0, 'Confirmar a call e preparar perda-estimada.html'],
  'proposta enviada': [2, 'Perguntar se ficou alguma dúvida na proposta'],
  'negociando': [3, 'Retomar com a condição combinada / prazo da proposta']
};

const hoje = new Date();
const itens = [];

for (const l of lerArquivo(path.join(RAIZ, 'comercial', 'pipeline-prospeccao.csv'))) {
  const st = (l.status || '').toLowerCase();
  if (/fechado|ganho|perdido|descartado/.test(st)) continue;
  const prox = data(l.data_proximo_passo);
  const regra = CADENCIA[st];
  let vence = prox;
  if (!vence && regra) { const base = data(l.data) || hoje; vence = new Date(base.getTime() + regra[0] * 86400000); }
  if (!vence || vence > hoje) continue;
  const atraso = dias(vence);
  const temMsg = l.slug && fs.existsSync(path.join(RAIZ, 'clientes', l.slug, 'contexto', 'scripts-abordagem.md'));
  itens.push({ tipo: 'Prospect', quem: l.empresa || l.slug, status: l.status, atraso, acao: l.proximo_passo || regra?.[1] || 'Definir próximo passo', contato: l.whatsapp || l.instagram || '', arquivo: temMsg ? `clientes/${l.slug}/contexto/scripts-abordagem.md` : '' });
}

for (const c of lerArquivo(path.join(RAIZ, 'comercial', 'financeiro.csv'))) {
  if ((c.status || '').toLowerCase() !== 'ativo') continue;
  const fim = data(c.fim);
  if (fim && dias(hoje, fim) <= 30 && dias(hoje, fim) >= 0) itens.push({ tipo: 'Renovação', quem: c.cliente, status: `vence em ${dias(hoje, fim)} dias`, atraso: 0, acao: 'Reunião de resultados + proposta de renovação (/4-relatorio-mensal)', contato: '', arquivo: '' });
  const venc = Number(c.dia_vencimento);
  if (venc && hoje.getDate() === venc) itens.push({ tipo: 'Cobrança', quem: c.cliente, status: 'vence hoje', atraso: 0, acao: `Confirmar pagamento da mensalidade (${c.mensal})`, contato: '', arquivo: '' });
  if (hoje.getDate() <= 5) {
    const mes = `${hoje.getFullYear()}-${String(hoje.getMonth()).padStart(2, '0')}`;
    const rel = path.join(RAIZ, 'clientes', c.slug || '', 'relatorios', `relatorio-${mes}.html`);
    if (c.slug && hoje.getMonth() > 0 && !fs.existsSync(rel)) itens.push({ tipo: 'Relatório', quem: c.cliente, status: `relatório de ${mes} pendente`, atraso: 0, acao: `/4-relatorio-mensal ${c.slug} ${mes} <investimento>`, contato: '', arquivo: '' });
  }
}

itens.sort((a, b) => b.atraso - a.atraso);
const dataHoje = hoje.toISOString().slice(0, 10);
const md = [`# Agenda · ${dataHoje}`, '', itens.length ? `${itens.length} ação(ões) para hoje.` : 'Nada pendente hoje.', '',
  '| Tipo | Quem | Status | Atraso | O que fazer | Contato | Mensagem pronta |', '|---|---|---|---|---|---|---|',
  ...itens.map(i => `| ${i.tipo} | ${i.quem} | ${i.status} | ${i.atraso ? `${i.atraso}d` : '–'} | ${i.acao} | ${i.contato} | ${i.arquivo ? `\`${i.arquivo}\`` : ''} |`),
  '', 'Depois de agir, atualize `status`, `data` e `data_proximo_passo` no pipeline (ou peça ao Claude).'].join('\n');
const saida = path.join(RAIZ, 'comercial', `follow-ups-${dataHoje}.md`);
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, md + '\n');
console.log(`${itens.length} ação(ões) hoje → ${saida}`);
itens.slice(0, 10).forEach(i => console.log(`  [${i.tipo}] ${i.quem}: ${i.acao}${i.atraso ? ` (${i.atraso}d atrasado)` : ''}`));

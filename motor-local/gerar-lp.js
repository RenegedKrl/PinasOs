// Gera a Landing Page a partir de um JSON de conteúdo (o Claude escreve só o conteúdo → economiza tokens).
// Uso: node motor-local/gerar-lp.js <slug> [--oficial] [--estilo editorial|suico|atelier] [--todos]
// Lê:  clientes/<slug>/site/lp-conteudo.json  (modelo: clientes/_modelo-padrao/site/lp-conteudo.exemplo.json)
// Gera: clientes/<slug>/site/index.html e privacidade.html
// Sem --oficial: noindex + faixa "Protótipo de demonstração".
// O estilo vem de "estilo" no JSON; --estilo sobrescreve. --todos gera index-<estilo>.html de cada um para comparar.
const fs = require('fs');
const path = require('path');
const { contexto, privacidade } = require('./lp/comum');

const ESTILOS = {
  editorial: require('./lp/estilos/editorial'),
  suico: require('./lp/estilos/suico'),
  atelier: require('./lp/estilos/atelier')
};

function gerar(slug, { oficial, estilo, saida }) {
  const pasta = path.join(__dirname, '..', 'clientes', slug, 'site');
  const arq = path.join(pasta, 'lp-conteudo.json');
  if (!fs.existsSync(arq)) { console.error(`Não encontrado: ${arq}`); process.exit(1); }
  const c = JSON.parse(fs.readFileSync(arq, 'utf-8'));
  const nomeEstilo = estilo || c.estilo || 'editorial';
  const render = ESTILOS[nomeEstilo];
  if (!render) { console.error(`Estilo desconhecido "${nomeEstilo}". Opções: ${Object.keys(ESTILOS).join(', ')}`); process.exit(1); }

  const x = contexto(c, oficial);
  const nome = saida || 'index.html';
  fs.writeFileSync(path.join(pasta, nome), render(x));
  fs.writeFileSync(path.join(pasta, 'privacidade.html'), privacidade(x));
  console.log(`LP gerada (${oficial ? 'OFICIAL' : 'protótipo'}, estilo ${nomeEstilo}): ${path.join(pasta, nome)}`);
  if (!x.whats) console.warn('Aviso: contato.whatsapp vazio — botões de WhatsApp não vão funcionar.');
}

const args = process.argv.slice(2);
const iE = args.indexOf('--estilo');
const estilo = iE > -1 ? args[iE + 1] : null;
const slug = args.find((a, i) => !a.startsWith('--') && (iE < 0 || i !== iE + 1));
if (!slug) { console.log('Uso: node motor-local/gerar-lp.js <slug> [--oficial] [--estilo editorial|suico|atelier] [--todos]'); process.exit(1); }

if (args.includes('--todos')) {
  for (const e of Object.keys(ESTILOS)) gerar(slug, { oficial: args.includes('--oficial'), estilo: e, saida: `index-${e}.html` });
} else {
  gerar(slug, { oficial: args.includes('--oficial'), estilo });
}

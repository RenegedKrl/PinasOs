// Ponte entre o Pinas OS e o Pinas Kit (pinaskit.vercel.app).
// Modo padrão: API pública de captação do Pinas Kit (função w-lead), a mesma do widget. Não precisa de senha:
//   PINAS_KIT_CHAVE = chave pública (data-pk) de uma captação SUA criada para receber os prospects.
// Modo alternativo: PINAS_KIT_URL (qualquer webhook que receba POST JSON) + PINAS_KIT_TOKEN/PINAS_KIT_AUTH.
// Detalhes: integracoes/pinas-kit.md
//
// Uso:
//   node motor-local/pinas-kit.js testar
//   node motor-local/pinas-kit.js enviar-prospect <slug> [status]
//   node motor-local/pinas-kit.js enviar-lote                 (todos os prospects prontos com WhatsApp, ainda não enviados)
//   node motor-local/pinas-kit.js importar <arquivo.csv>      (CSV exportado do Pinas Kit → comercial/pipeline-prospeccao.csv)
//   node motor-local/pinas-kit.js exportar                    (pipeline → comercial/exportar-pinas-kit.csv)
require('./lib/env');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PIPE = path.join(RAIZ, 'comercial', 'pipeline-prospeccao.csv');
const COLUNAS = ['data', 'empresa', 'nicho', 'cidade', 'site', 'instagram', 'whatsapp', 'slug', 'status', 'proximo_passo', 'data_proximo_passo', 'observacoes'];

function lerCsv(texto) {
  const sep = (texto.split('\n')[0].match(/;/g) || []).length > (texto.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const linhas = []; let campo = '', linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) { if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (ch === '"') aspas = false; else campo += ch; }
    else if (ch === '"') aspas = true;
    else if (ch === sep) { linha.push(campo); campo = ''; }
    else if (ch === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else if (ch !== '\r') campo += ch;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas.filter(l => l.some(c => c.trim()));
  const chaves = cab.map(c => c.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_'));
  return resto.map(l => Object.fromEntries(chaves.map((c, i) => [c, (l[i] || '').trim()])));
}
const csvCampo = v => (/[",\n;]/.test(String(v ?? '')) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
const escreverCsv = (arq, linhas) => fs.writeFileSync(arq, [COLUNAS.join(','), ...linhas.map(l => COLUNAS.map(c => csvCampo(l[c])).join(','))].join('\n') + '\n');
const slugify = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const primeiro = (o, ...ks) => ks.map(k => o[k]).find(v => v) || '';

const API = (process.env.PINAS_KIT_API || 'https://qdpwawkeiyvggcfonfsa.supabase.co/functions/v1').replace(/\/$/, '');
const ENVIADOS = path.join(RAIZ, 'comercial', '.pinas-kit-enviados.json');
const ERROS = { widget: 'chave (PINAS_KIT_CHAVE) não encontrada ou captação desativada', plano: 'assinatura do Pinas Kit vencida', origem: 'domínio não autorizado: em Configurações > Sites, cadastre o domínio de PINAS_KIT_ORIGEM ou deixe a lista vazia', limite: 'limite da API (10 contatos por hora por IP, 3 por telefone por dia). Rode de novo mais tarde', telefone: 'telefone inválido (precisa de DDD, 10 a 15 dígitos)' };

// Envia um contato pela API pública do Pinas Kit (w-lead), no mesmo formato do widget
async function enviarKit({ telefone, nome, opcao, mensagem, campanha }) {
  const chave = process.env.PINAS_KIT_CHAVE;
  if (!chave) throw new Error('PINAS_KIT_CHAVE não configurada no .env');
  const toque = { landing: 'https://pinas-os.local/prospeccao', ts: Date.now(), utm_source: 'pinas-os', utm_medium: 'prospeccao', utm_campaign: campanha || 'prospeccao-ativa' };
  const res = await fetch(`${API}/w-lead`, {
    method: 'POST',
    // A API confere a origem; o host do próprio Pinas Kit é sempre aceito
    headers: { 'content-type': 'application/json', origin: process.env.PINAS_KIT_ORIGEM || 'https://pinaskit.vercel.app' },
    body: JSON.stringify({ k: chave, phone: String(telefone || '').replace(/\D/g, ''), name: nome, option: opcao, message: mensagem, consent: false, method: 'page_form', t: 5000, attr: { first: toque, last: toque }, url: toque.landing }),
    signal: AbortSignal.timeout(20000)
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) { const e = new Error(ERROS[j.error] || `Pinas Kit respondeu ${res.status} ${j.error || ''}`); e.codigo = j.error || res.status; throw e; }
  return j;
}

async function enviar(payload) {
  const url = process.env.PINAS_KIT_URL;
  if (!url) throw new Error('Configure PINAS_KIT_CHAVE (recomendado) ou PINAS_KIT_URL no .env');
  const token = process.env.PINAS_KIT_TOKEN || '';
  const modo = (process.env.PINAS_KIT_AUTH || 'bearer').toLowerCase();
  const headers = { 'Content-Type': 'application/json' };
  let destino = url;
  if (token && modo === 'bearer') headers.Authorization = `Bearer ${token}`;
  if (token && modo === 'header') headers['X-Api-Key'] = token;
  if (token && modo === 'query') destino += (url.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);
  const res = await fetch(destino, { method: 'POST', headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
  const corpo = await res.text();
  if (!res.ok) throw new Error(`Pinas Kit respondeu ${res.status}: ${corpo.slice(0, 200)}`);
  return corpo;
}

function montarProspect(slug, status) {
  const base = path.join(RAIZ, 'clientes', slug);
  if (!fs.existsSync(base)) throw new Error(`Cliente não encontrado: ${base}`);
  const ler = rel => (fs.existsSync(path.join(base, rel)) ? fs.readFileSync(path.join(base, rel), 'utf-8') : null);
  const diag = JSON.parse(ler('contexto/diagnostico-automatico.json') || '{}');
  const ctx = ler('contexto/contexto-empresa.md') || '';
  // Só o que está na MESMA linha do rótulo; ignora campos vazios e placeholders
  const campo = rotulo => { const v = (ctx.match(new RegExp(`\\*\\*${rotulo}:\\*\\*[ \\t]*([^\\n]*)`, 'i')) || [])[1]?.trim() || ''; return /^\[|^-\s/.test(v) ? '' : v; };
  const lp = ler('site/lp-conteudo.json');
  return {
    tipo: 'prospect',
    origem: 'pinas-os',
    slug,
    empresa: campo('Nome') || (lp && JSON.parse(lp).marca?.nome) || slug,
    nicho: campo('Nicho'),
    cidade: campo('Cidade / região de atendimento'),
    site: diag.urlAnalisada || campo('Site atual / Instagram'),
    whatsapp: campo('WhatsApp comercial'),
    status: status || 'protótipo pronto',
    pontuacao: diag.oportunidadesPinas ? pontuar(diag) : null,
    oportunidades: diag.oportunidadesPinas || [],
    performanceMobile: diag.pageSpeed?.notaPerformanceMobile ?? null,
    temPixel: diag.tecnico?.metaPixel ?? null,
    prototipo: fs.existsSync(path.join(base, 'site', 'index.html')),
    videoDemo: fs.existsSync(path.join(base, 'site', 'demo-mobile.mp4')),
    abordagem: ler('contexto/scripts-abordagem.md')?.slice(0, 2000) || null,
    atualizadoEm: new Date().toISOString()
  };
}

// Prospect → contato do Pinas Kit: empresa como nome, status como "momento", diagnóstico na mensagem
function paraKit(p) {
  const tel = String(p.whatsapp || '').replace(/\D/g, '');
  if (tel.length < 10) throw Object.assign(new Error('prospect sem WhatsApp com DDD (preencha a coluna whatsapp no pipeline)'), { codigo: 'telefone' });
  const linhas = [
    `[Pinas OS] ${p.empresa}${p.nicho ? ` · ${p.nicho}` : ''}${p.cidade ? ` · ${p.cidade}` : ''}`,
    p.site ? `Site: ${p.site}` : '',
    p.pontuacao != null ? `Pontuação: ${p.pontuacao}${p.performanceMobile != null ? ` · Mobile ${p.performanceMobile}/100` : ''}${p.temPixel === false ? ' · sem Pixel' : ''}` : '',
    ...(p.oportunidades || []).slice(0, 4).map(o => `- ${o.split(' — ')[0]}`),
    p.prototipo ? `Protótipo pronto: clientes/${p.slug}/site/index.html${p.videoDemo ? ' (+ vídeo)' : ''}` : ''
  ].filter(Boolean);
  return { telefone: tel.startsWith('55') ? tel : '55' + tel, nome: p.empresa, opcao: p.status, mensagem: linhas.join('\n').slice(0, 1900), campanha: p.nicho ? `prospeccao-${p.nicho.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}` : undefined };
}
const lerEnviados = () => { try { return JSON.parse(fs.readFileSync(ENVIADOS, 'utf-8')); } catch { return {}; } };
function marcarEnviado(slug) { const e = lerEnviados(); e[slug] = new Date().toISOString(); fs.mkdirSync(path.dirname(ENVIADOS), { recursive: true }); fs.writeFileSync(ENVIADOS, JSON.stringify(e, null, 2)); }

// Mesma régua do prospectar-lote.js: quanto maior, mais dinheiro o lead está perdendo (e mais fácil vender)
function pontuar(diag) {
  const pesos = { CRÍTICO: 3, ALTO: 2, MÉDIO: 1, BAIXO: 0.5 };
  return (diag.oportunidadesPinas || []).reduce((s, o) => s + (pesos[o.split(' ')[0]] || 0), 0);
}

async function main() {
  const [cmd, a1, a2] = process.argv.slice(2);
  const viaKit = !!process.env.PINAS_KIT_CHAVE;
  if (cmd === 'testar') {
    if (viaKit) {
      // Telefone inválido de propósito: "telefone" prova que a chave e a origem foram aceitas, sem criar contato
      try { await enviarKit({ telefone: '1', nome: 'teste' }); } catch (e) {
        if (e.codigo === 'telefone') { console.log('Conexão com o Pinas Kit funcionando (chave e origem aceitas).'); return; }
        throw e;
      }
    } else {
      console.log(await enviar({ tipo: 'teste', origem: 'pinas-os', data: new Date().toISOString() }) || 'OK');
      console.log('Conexão com o webhook funcionando.');
    }
  } else if (cmd === 'enviar-prospect' && a1) {
    const p = montarProspect(a1, a2);
    if (viaKit) await enviarKit(paraKit(p)); else await enviar(p);
    marcarEnviado(a1);
    console.log(`Prospect "${p.empresa}" enviado ao Pinas Kit (pontuação ${p.pontuacao}, status "${p.status}").`);
  } else if (cmd === 'enviar-lote') {
    const feitos = lerEnviados();
    const fila = (fs.existsSync(PIPE) ? lerCsv(fs.readFileSync(PIPE, 'utf-8')) : [])
      .filter(l => l.slug && !feitos[l.slug] && l.whatsapp && !/^(novo|diagnosticado|perdido|descartado)$/i.test(l.status || 'novo'));
    let ok = 0;
    for (const l of fila) {
      try {
        const p = fs.existsSync(path.join(RAIZ, 'clientes', l.slug)) ? montarProspect(l.slug, l.status) : { empresa: l.empresa, status: l.status, oportunidades: [] };
        p.whatsapp = l.whatsapp || p.whatsapp; p.empresa = l.empresa || p.empresa; p.nicho = p.nicho || l.nicho; p.cidade = p.cidade || l.cidade; p.site = p.site || l.site;
        if (viaKit) await enviarKit(paraKit(p)); else await enviar(p);
        marcarEnviado(l.slug); ok++;
        console.log(`  enviado: ${p.empresa}`);
      } catch (e) {
        console.warn(`  ${l.slug}: ${e.message}`);
        if (e.codigo === 'limite') break;
      }
    }
    console.log(`${ok} de ${fila.length} enviado(s).`);
  } else if (cmd === 'importar' && a1) {
    const novos = lerCsv(fs.readFileSync(a1, 'utf-8'));
    const atuais = fs.existsSync(PIPE) ? lerCsv(fs.readFileSync(PIPE, 'utf-8')) : [];
    const chave = l => (l.site || l.instagram || l.empresa || '').toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const vistos = new Set(atuais.map(chave));
    let add = 0;
    for (const n of novos) {
      const l = {
        data: new Date().toISOString().slice(0, 10),
        empresa: primeiro(n, 'empresa', 'nome', 'name', 'razao_social', 'title'),
        nicho: primeiro(n, 'nicho', 'categoria', 'category', 'segmento'),
        cidade: primeiro(n, 'cidade', 'city', 'municipio', 'endereco', 'address'),
        site: primeiro(n, 'site', 'website', 'url', 'site_url'),
        instagram: primeiro(n, 'instagram', 'ig'),
        whatsapp: primeiro(n, 'whatsapp', 'telefone', 'phone', 'celular'),
        status: primeiro(n, 'status') || 'novo',
        observacoes: primeiro(n, 'observacoes', 'notas', 'notes')
      };
      if (!l.empresa && !l.site) continue;
      l.slug = slugify(l.empresa || l.site.replace(/^https?:\/\/(www\.)?/, ''));
      if (vistos.has(chave(l))) continue;
      vistos.add(chave(l)); atuais.push(l); add++;
    }
    fs.mkdirSync(path.dirname(PIPE), { recursive: true });
    escreverCsv(PIPE, atuais);
    console.log(`${add} prospect(s) novo(s) importado(s). Total no pipeline: ${atuais.length}.`);
    console.log('Próximo passo: node motor-local/prospectar-lote.js');
  } else if (cmd === 'exportar') {
    const atuais = fs.existsSync(PIPE) ? lerCsv(fs.readFileSync(PIPE, 'utf-8')) : [];
    const saida = path.join(RAIZ, 'comercial', 'exportar-pinas-kit.csv');
    escreverCsv(saida, atuais);
    console.log(`Exportado: ${saida} (${atuais.length} linhas)`);
  } else {
    console.log('Uso: node motor-local/pinas-kit.js testar | enviar-prospect <slug> [status] | enviar-lote | importar <csv> | exportar');
    process.exit(1);
  }
}

module.exports = { lerCsv, escreverCsv, pontuar, COLUNAS, PIPE };
if (require.main === module) main().catch(e => { console.error('Falha:', e.message); process.exit(1); });

// Partes comuns a todos os estilos de LP: helpers de texto, <head>, triagem, rastreamento e privacidade.
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// **negrito** e *itálico* (o itálico é o "toque de mão" dos estilos serifados)
const rico = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
const cor = (v, p) => (typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v.trim()) ? v.trim() : p);
const fonte = (v, p) => (typeof v === 'string' && /^[a-z0-9 ]+$/i.test(v) ? v : p);
const lista = v => (Array.isArray(v) ? v : []);
const romano = n => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n] || String(n + 1);
const dois = n => String(n + 1).padStart(2, '0');

// Textura de papel/grão: SVG feTurbulence inline (não pesa, não depende de imagem)
const GRAO = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23g)'/></svg>")`;

const ICONE_WHATS = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 7.8 19.6z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8a4 4 0 0 1-2.1-2.1l.8-1-1-2z" fill="currentColor" stroke="none"/></svg>';

function contexto(c, oficial) {
  const m = c.marca || {};
  const ct = c.contato || {};
  const whats = String(ct.whatsapp || '').replace(/\D/g, '');
  return {
    c, m, ct, oficial, whats,
    h: c.hero || {},
    tri: c.triagem || {},
    linkWhats: msg => `https://wa.me/${whats}?text=${encodeURIComponent(msg || `Olá! Vim pelo site da ${m.nome || ''} e quero mais informações.`)}`,
    ano: new Date().getFullYear()
  };
}

function head(x, { fontes, css }) {
  const { c, m, h, oficial } = x;
  const familias = fontes.map(f => `family=${f}`).join('&');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.seo?.titulo || m.nome)}</title>
<meta name="description" content="${esc(c.seo?.descricao)}">
${oficial ? '' : '<meta name="robots" content="noindex,nofollow">\n'}<meta property="og:title" content="${esc(c.seo?.titulo || m.nome)}">
<meta property="og:description" content="${esc(c.seo?.descricao)}">
${h.imagem ? `<meta property="og:image" content="${esc(h.imagem)}">\n<link rel="preload" as="image" href="${esc(h.imagem)}">\n` : ''}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${familias}&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
img{max-width:100%;display:block;height:auto}
a{color:inherit}
button{font:inherit;color:inherit}
.proto{background:#F4D35E;color:#2B2100;text-align:center;font:600 13px/1.4 system-ui,sans-serif;padding:7px 14px}
.passo{display:none}.passo.ativo{display:block}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
</style>
</head>`;
}

const faixaPrototipo = x => (x.oficial ? '' : `<div class="proto">Protótipo de demonstração criado pela Pinas · não é o site oficial de ${esc(x.m.nome)}</div>`);

// Triagem: a marcação (classes/atributos) é usada pelo script; o visual é de cada estilo.
function triagem(x, { marcador = i => String.fromCharCode(65 + i) } = {}) {
  const { m, tri } = x;
  const perguntas = lista(tri.perguntas).slice(0, 2);
  return `<div class="tri-box">
    <div class="barra" aria-hidden="true"><i></i></div>
    ${perguntas.map((q, i) => `<div class="passo${i === 0 ? ' ativo' : ''}" data-passo="${i}" data-chave="${esc(q.chave || `pergunta${i + 1}`)}">
      <div class="tri-n">${i + 1} de ${perguntas.length + 1}</div>
      <h3>${esc(q.pergunta)}</h3>
      <div class="opcoes">${lista(q.opcoes).map((o, j) => `<button type="button" data-valor="${esc(o)}"><span class="op-k">${marcador(j)}</span><span>${esc(o)}</span></button>`).join('')}</div>
      ${i > 0 ? '<button type="button" class="voltar">Voltar</button>' : ''}
    </div>`).join('')}
    <form class="passo" data-passo="${perguntas.length}" id="form-lead" novalidate>
      <div class="tri-n">${perguntas.length + 1} de ${perguntas.length + 1}</div>
      <h3>${esc(tri.tituloContato || 'Para quem a nossa equipe vai responder?')}</h3>
      <label class="campo"><span>Seu nome</span><input name="nome" autocomplete="given-name" required></label>
      <label class="campo"><span>WhatsApp com DDD</span><input name="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 90000-0000" required></label>
      <label class="lgpd"><input type="checkbox" name="consentimento" required data-consentimento><span>Concordo em ser contatado(a) pela ${esc(m.nome)} e li o <a href="privacidade.html" target="_blank">aviso de privacidade</a>.</span></label>
      <button class="btn btn-enviar" type="submit">${esc(tri.ctaFinal || 'Continuar no WhatsApp')}</button>
      <button type="button" class="voltar">Voltar</button>
    </form>
  </div>`;
}

const botaoFlutuante = x => (x.whats ? `<a class="flutuante" href="${x.linkWhats()}" data-cta="flutuante" aria-label="Falar no WhatsApp">${ICONE_WHATS}<span>WhatsApp</span></a>` : '');

function script(x) {
  const r = x.c.rastreamento || {};
  return `<script>
// ===== CONFIGURAÇÃO (vazio = desativado) =====
const CONFIG = {
  PIXEL_ID: ${JSON.stringify(r.pixelId || '')},
  GTM_ID: ${JSON.stringify(r.gtmId || '')},
  WEBHOOK_URL: ${JSON.stringify(r.webhookUrl || '')},
  WHATSAPP: ${JSON.stringify(x.whats)},
  EMPRESA: ${JSON.stringify(x.m.nome || '')}
};
// =============================================
if (CONFIG.PIXEL_ID) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CONFIG.PIXEL_ID); fbq('track', 'PageView');
}
window.dataLayer = window.dataLayer || [];
if (CONFIG.GTM_ID) {
  (function(w,d,s,l,i){w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer',CONFIG.GTM_ID);
}
const evento = (meta, gtm, dados) => {
  try { if (window.fbq) fbq('track', meta, dados || {}); } catch (e) {}
  window.dataLayer.push(Object.assign({ event: gtm }, dados || {}));
};
const CHAVES = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid'];
const origem = (() => {
  let salvo = {};
  try { salvo = JSON.parse(sessionStorage.getItem('pinas_origem') || '{}'); } catch (e) {}
  const q = new URLSearchParams(location.search);
  CHAVES.forEach(k => { if (q.get(k)) salvo[k] = q.get(k); });
  if (!salvo.pagina) salvo.pagina = location.href.split('?')[0];
  if (!salvo.referrer && document.referrer) salvo.referrer = document.referrer;
  try { sessionStorage.setItem('pinas_origem', JSON.stringify(salvo)); } catch (e) {}
  return salvo;
})();
document.querySelectorAll('[data-cta]').forEach(a => a.addEventListener('click', () => {
  if (a.href && a.href.includes('wa.me')) evento('Contact', 'clique_whatsapp', { local: a.dataset.cta });
}));
const passos = [...document.querySelectorAll('.passo')];
const barra = document.querySelector('.barra i');
const respostas = {};
let atual = 0;
const ir = n => {
  passos[atual].classList.remove('ativo');
  atual = n;
  passos[atual].classList.add('ativo');
  if (barra) barra.style.width = ((atual + 1) / passos.length * 100) + '%';
  const foco = passos[atual].querySelector('button, input');
  if (foco) foco.focus({ preventScroll: true });
};
passos.forEach((p, i) => {
  p.querySelectorAll('.opcoes button').forEach(b => b.addEventListener('click', () => {
    respostas[p.dataset.chave] = b.dataset.valor;
    if (i === 0) evento('ViewContent', 'triagem_inicio');
    ir(i + 1);
  }));
  const v = p.querySelector('.voltar');
  if (v) v.addEventListener('click', () => ir(i - 1));
});
const form = document.getElementById('form-lead');
form.addEventListener('submit', e => {
  e.preventDefault();
  const nome = form.nome.value.trim();
  const tel = form.telefone.value.replace(/\\D/g, '');
  if (!nome) return form.nome.focus();
  if (tel.length < 10) { form.telefone.setCustomValidity('Informe o WhatsApp com DDD'); form.telefone.reportValidity(); return; }
  form.telefone.setCustomValidity('');
  if (!form.consentimento.checked) { form.consentimento.reportValidity(); return; }
  const lead = { nome, telefone: tel.startsWith('55') ? tel : '55' + tel, respostas, origem, empresa: CONFIG.EMPRESA, data: new Date().toISOString() };
  evento('Lead', 'lead', { origem: origem.utm_source || 'direto' });
  if (CONFIG.WEBHOOK_URL) {
    const corpo = JSON.stringify(lead);
    const ok = navigator.sendBeacon && navigator.sendBeacon(CONFIG.WEBHOOK_URL, new Blob([corpo], { type: 'text/plain' }));
    if (!ok) fetch(CONFIG.WEBHOOK_URL, { method: 'POST', body: corpo, keepalive: true, mode: 'no-cors' }).catch(() => {});
  }
  const titulos = [...document.querySelectorAll('.passo h3')];
  const linhas = ['Olá! Meu nome é ' + nome + '.'];
  Object.values(respostas).forEach((r, i) => linhas.push(titulos[i].innerText + ' ' + r));
  if (origem.utm_campaign) linhas.push('(via ' + origem.utm_campaign + ')');
  const url = 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\\n'));
  setTimeout(() => { location.href = url; }, 250);
});
// Revelação suave ao rolar (só se o navegador suportar e o usuário não pedir menos movimento)
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-revela]').forEach(el => { el.classList.add('revela'); io.observe(el); });
}
</script>`;
}

function privacidade(x) {
  const { m, ct, whats, oficial } = x;
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Aviso de privacidade · ${esc(m.nome)}</title>${oficial ? '' : '<meta name="robots" content="noindex,nofollow">'}
<style>body{font-family:Georgia,serif;max-width:680px;margin:0 auto;padding:48px 20px;line-height:1.75;color:#1c1917;background:#faf8f4}h1{font-size:32px;font-weight:400;margin-bottom:20px}h2{font:600 15px/1.4 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;margin-top:32px}</style></head><body>
<h1>Aviso de privacidade</h1>
<p><b>${esc(m.nome)}</b>${ct.cnpj ? `, CNPJ ${esc(ct.cnpj)},` : ''} é a controladora dos dados enviados por este site.</p>
<h2>Quais dados coletamos</h2><p>Nome, número de WhatsApp, as respostas do formulário e informações de origem da visita (como o anúncio ou a campanha que trouxe você até aqui).</p>
<h2>Para que usamos</h2><p>Só para responder ao seu contato, agendar atendimento e acompanhar sua solicitação. Base legal: consentimento (art. 7º, I, LGPD) e procedimentos preliminares a contrato (art. 7º, V).</p>
<h2>Cookies e anúncios</h2><p>Este site pode usar ferramentas de medição (Meta Pixel e Google Tag Manager) para entender quais anúncios funcionam e mostrar anúncios relevantes.</p>
<h2>Por quanto tempo guardamos</h2><p>Até 24 meses após o último contato, ou até você pedir a exclusão.</p>
<h2>Seus direitos</h2><p>Você pode pedir acesso, correção ou exclusão dos seus dados quando quiser${ct.email ? `, pelo e-mail ${esc(ct.email)}` : whats ? ', pelo nosso WhatsApp' : ''}.</p>
<p><a href="index.html">← Voltar</a></p></body></html>`;
}

module.exports = { esc, rico, cor, fonte, lista, romano, dois, GRAO, ICONE_WHATS, contexto, head, faixaPrototipo, triagem, botaoFlutuante, script, privacidade };

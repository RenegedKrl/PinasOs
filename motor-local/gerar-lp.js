// Gera a Landing Page completa a partir de um JSON de conteúdo (economiza tokens: o Claude escreve só o conteúdo).
// Uso: node motor-local/gerar-lp.js <slug> [--oficial]
// Lê:  clientes/<slug>/site/lp-conteudo.json  (modelo: clientes/_modelo-padrao/site/lp-conteudo.exemplo.json)
// Gera: clientes/<slug>/site/index.html e privacidade.html
// Sem --oficial: inclui noindex + faixa "Protótipo de demonstração".
const fs = require('fs');
const path = require('path');

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Permite **negrito** nos textos sem abrir brecha para HTML arbitrário
const rico = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const cor = (v, p) => (typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v.trim()) ? v.trim() : p);
const fonte = (v, p) => (typeof v === 'string' && /^[a-z0-9 ]+$/i.test(v) ? v : p);
const lista = v => (Array.isArray(v) ? v : []);

const ICONES = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  estrela: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor"/>',
  local: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  whatsapp: '<path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 7.8 19.6z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8a4 4 0 0 1-2.1-2.1l.8-1-1-2z" fill="currentColor" stroke="none"/>'
};
const icone = (n, t = 20) => `<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[n] || ''}</svg>`;

function gerar(slug, oficial) {
  const pasta = path.join(__dirname, '..', 'clientes', slug, 'site');
  const arq = path.join(pasta, 'lp-conteudo.json');
  if (!fs.existsSync(arq)) { console.error(`Não encontrado: ${arq}`); process.exit(1); }
  const c = JSON.parse(fs.readFileSync(arq, 'utf-8'));
  const m = c.marca || {}, ct = c.contato || {}, r = c.rastreamento || {};
  const h = c.hero || {}, tri = c.triagem || {};
  const fT = fonte(m.fonteTitulo, 'Sora'), fX = fonte(m.fonteTexto, 'Inter');
  const fontes = [...new Set([fT, fX])].map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800`).join('&');
  const whats = String(ct.whatsapp || '').replace(/\D/g, '');
  const linkWhats = msg => `https://wa.me/${whats}?text=${encodeURIComponent(msg || `Olá! Vim pelo site da ${m.nome || ''} e quero mais informações.`)}`;

  const ano = new Date().getFullYear();
  const perguntas = lista(tri.perguntas).slice(0, 2);
  const servicos = lista(c.servicos?.itens);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.seo?.titulo || m.nome)}</title>
<meta name="description" content="${esc(c.seo?.descricao)}">
${oficial ? '' : '<meta name="robots" content="noindex,nofollow">\n'}<meta property="og:title" content="${esc(c.seo?.titulo || m.nome)}">
<meta property="og:description" content="${esc(c.seo?.descricao)}">
${h.imagem ? `<meta property="og:image" content="${esc(h.imagem)}">\n<link rel="preload" as="image" href="${esc(h.imagem)}">\n` : ''}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fontes}&display=swap" rel="stylesheet">
<style>
:root{--p:${cor(m.corPrimaria, '#0F766E')};--pt:${cor(m.corPrimariaTexto, '#FFFFFF')};--e:${cor(m.corEscura, '#0C0A09')};--c:${cor(m.corClara, '#FAFAF9')};--s:${cor(m.corSuave, '#E7E5E4')};--ft:'${fT}',system-ui,sans-serif;--fx:'${fX}',system-ui,sans-serif;--r:14px}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:var(--fx);color:var(--e);background:var(--c);line-height:1.6;font-size:17px;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:var(--ft);line-height:1.1;letter-spacing:-.02em}
h2{font-size:clamp(28px,4.5vw,44px);margin-bottom:16px}
img{max-width:100%;display:block;height:auto}
a{color:inherit}
.w{max-width:1120px;margin:0 auto;padding:0 20px}
section{padding:clamp(64px,9vw,112px) 0}
.eyebrow{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--p);margin-bottom:14px}
.lead{font-size:clamp(17px,2vw,20px);opacity:.8;max-width:620px}
.btn{display:inline-flex;align-items:center;gap:10px;background:var(--p);color:var(--pt);font-weight:700;font-size:17px;padding:17px 28px;border-radius:999px;text-decoration:none;border:0;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 8px 24px -8px var(--p)}
.btn:hover{transform:translateY(-2px);box-shadow:0 14px 30px -10px var(--p)}
.btn svg{transition:transform .15s}.btn:hover svg{transform:translateX(3px)}
.btn-sec{background:transparent;color:var(--e);box-shadow:inset 0 0 0 2px var(--s)}
.proto{background:#FDE68A;color:#78350F;text-align:center;font-size:13px;padding:6px 12px;font-weight:600}
.topo{background:var(--e);color:var(--c);font-size:14px;padding:10px 0;text-align:center}
.topo span{display:inline-flex;align-items:center;gap:6px}
header{padding:18px 0;border-bottom:1px solid var(--s);background:var(--c)}
header .w{display:flex;justify-content:space-between;align-items:center;gap:16px}
.logo{font-family:var(--ft);font-weight:800;font-size:22px;text-decoration:none}
.logo img{height:40px;width:auto}
header .btn{padding:11px 20px;font-size:15px}
.hero{padding:clamp(48px,7vw,96px) 0}
.hero .w{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.hero h1{font-size:clamp(36px,6vw,64px);margin-bottom:20px}
.hero .lead{margin-bottom:32px}
.hero-img{border-radius:24px;overflow:hidden;aspect-ratio:4/5;background:var(--s)}
.hero-img img{width:100%;height:100%;object-fit:cover}
.prova{display:flex;align-items:center;gap:12px;margin-top:28px;font-size:15px}
.prova .estrelas{display:flex;color:#F59E0B}
.contraste{background:var(--e);color:var(--c)}
.contraste .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px}
.col{border-radius:var(--r);padding:32px}
.col h3{font-size:20px;margin-bottom:18px}
.col.antes{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
.col.depois{background:var(--p);color:var(--pt)}
.col li{list-style:none;display:flex;gap:12px;padding:8px 0;align-items:flex-start}
.col li svg{flex:none;margin-top:3px}
.col.antes li svg{opacity:.5}
.bento{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.card{background:#fff;border:1px solid var(--s);border-radius:var(--r);padding:28px}
.card h3{font-size:21px;margin-bottom:10px}
.card p{opacity:.75}
.card.destaque{grid-column:span 2;grid-row:span 2;background:var(--p);color:var(--pt);border:0;display:flex;flex-direction:column;justify-content:flex-end;padding:40px;min-height:320px}
.bento .card:last-child:nth-child(5){grid-column:span 2}
.sem-img .w{grid-template-columns:1fr!important;max-width:820px}
.card.destaque h3{font-size:clamp(26px,3vw,34px)}
.card.destaque p{opacity:.9;font-size:18px}
.aut .w{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:center}
.aut-img{border-radius:24px;overflow:hidden;aspect-ratio:1;background:var(--s)}
.aut-img img{width:100%;height:100%;object-fit:cover}
.numeros{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px}
.numeros strong{display:block;font-family:var(--ft);font-size:clamp(30px,4vw,42px);color:var(--p);line-height:1}
.numeros span{font-size:14px;opacity:.7}
.dep{background:#fff}
.deps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.dep-card{border:1px solid var(--s);border-radius:var(--r);padding:28px;display:flex;flex-direction:column;gap:18px;background:var(--c)}
.dep-card .estrelas{display:flex;color:#F59E0B}
.dep-card footer{margin-top:auto;font-size:14px}
.dep-card footer b{display:block;font-size:16px}
.triagem{background:var(--e);color:var(--c)}
.tri-box{max-width:640px;margin:40px auto 0;background:var(--c);color:var(--e);border-radius:24px;padding:clamp(24px,5vw,44px)}
.barra{height:6px;background:var(--s);border-radius:9px;margin-bottom:28px;overflow:hidden}
.barra i{display:block;height:100%;width:33%;background:var(--p);transition:width .3s}
.passo{display:none}.passo.ativo{display:block}
.passo h3{font-size:24px;margin-bottom:20px}
.opcoes{display:grid;gap:10px}
.opcoes button{text-align:left;font:inherit;font-weight:600;padding:16px 18px;border-radius:12px;border:2px solid var(--s);background:#fff;cursor:pointer;transition:border-color .15s}
.opcoes button:hover,.opcoes button:focus-visible{border-color:var(--p);outline:0}
.campo{display:block;margin-bottom:14px}
.campo span{display:block;font-size:14px;font-weight:600;margin-bottom:6px}
.campo input{width:100%;font:inherit;padding:14px 16px;border-radius:12px;border:2px solid var(--s);background:#fff}
.campo input:focus{outline:0;border-color:var(--p)}
.lgpd{display:flex;gap:10px;font-size:14px;margin:6px 0 20px;align-items:flex-start}
.lgpd input{margin-top:4px;width:18px;height:18px;accent-color:var(--p);flex:none}
.voltar{background:none;border:0;font:inherit;font-size:14px;opacity:.6;cursor:pointer;margin-top:16px;text-decoration:underline}
.tri-box .btn{width:100%;justify-content:center}
.faq-lista{max-width:760px;margin:40px auto 0}
details{border-bottom:1px solid var(--s);padding:20px 0}
summary{font-weight:700;font-size:18px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px}
summary::after{content:'+';font-size:24px;line-height:1;color:var(--p)}
details[open] summary::after{content:'−'}
details p{margin-top:12px;opacity:.8}
.final{text-align:center}
.final .lead{margin:0 auto 32px}
.rodape{background:var(--e);color:var(--c);padding:48px 0 32px;font-size:15px}
.rodape .w{display:grid;grid-template-columns:2fr 1fr 1fr;gap:32px}
.rodape p{opacity:.75;display:flex;gap:8px;align-items:flex-start;margin-bottom:8px}
.rodape small{grid-column:1/-1;opacity:.5;border-top:1px solid rgba(255,255,255,.1);padding-top:24px;margin-top:8px}
.flutuante{position:fixed;right:18px;bottom:18px;width:60px;height:60px;border-radius:50%;background:#25D366;color:#fff;display:grid;place-items:center;box-shadow:0 10px 30px rgba(0,0,0,.25);z-index:50}
.centro{text-align:center}.centro .lead{margin:0 auto}
@media (max-width:860px){
  .hero .w,.aut .w,.contraste .grid{grid-template-columns:1fr}
  .hero-img{aspect-ratio:4/3}
  .bento,.deps{grid-template-columns:1fr}
  .bento .card:last-child:nth-child(5){grid-column:auto}
  .card.destaque{grid-column:auto;grid-row:auto;min-height:240px;padding:32px}
  .rodape .w{grid-template-columns:1fr}
  header .btn{display:none}
  .hero{padding-top:24px}
  .hero .btn{width:100%;justify-content:center}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
</style>
</head>
<body>
${oficial ? '' : `<div class="proto">Protótipo de demonstração criado pela Pinas — não é o site oficial de ${esc(m.nome)}</div>\n`}${c.topo?.texto ? `<div class="topo"><span>${icone('local', 16)} ${esc(c.topo.texto)}</span></div>` : ''}
<header><div class="w">
  <a class="logo" href="./">${m.logo ? `<img src="${esc(m.logo)}" alt="${esc(m.nome)}" width="160" height="40">` : esc(m.nome)}</a>
  <a class="btn" href="#triagem" data-cta="header">${esc(h.cta || 'Falar no WhatsApp')}</a>
</div></header>

<main>
<section class="hero${h.imagem ? '' : ' sem-img'}"><div class="w">
  <div>
    ${h.eyebrow ? `<span class="eyebrow">${esc(h.eyebrow)}</span>` : ''}
    <h1>${rico(h.titulo)}</h1>
    <p class="lead">${rico(h.subtitulo)}</p>
    <a class="btn" href="#triagem" data-cta="hero">${esc(h.cta || 'Quero agendar')} ${icone('seta')}</a>
    ${h.provaSocial ? `<div class="prova"><span class="estrelas">${icone('estrela', 18).repeat(5)}</span><span>${rico(h.provaSocial)}</span></div>` : ''}
  </div>
  ${h.imagem ? `<div class="hero-img"><img src="${esc(h.imagem)}" alt="${esc(h.imagemAlt || m.nome)}" width="800" height="1000" fetchpriority="high"></div>` : ''}
</div></section>

${c.contraste ? `<section class="contraste"><div class="w">
  <h2>${rico(c.contraste.titulo)}</h2>
  <div class="grid">
    <div class="col antes"><h3>${esc(c.contraste.tituloAntes || 'Como costuma ser')}</h3><ul>${lista(c.contraste.antes).map(i => `<li>${icone('x', 18)}<span>${rico(i)}</span></li>`).join('')}</ul></div>
    <div class="col depois"><h3>${esc(c.contraste.tituloDepois || `Com a ${m.nome}`)}</h3><ul>${lista(c.contraste.depois).map(i => `<li>${icone('check', 18)}<span>${rico(i)}</span></li>`).join('')}</ul></div>
  </div>
</div></section>` : ''}

${servicos.length ? `<section><div class="w">
  ${c.servicos.eyebrow ? `<span class="eyebrow">${esc(c.servicos.eyebrow)}</span>` : ''}
  <h2>${rico(c.servicos.titulo)}</h2>
  <div class="bento">${servicos.map((s, i) => `<article class="card${i === 0 ? ' destaque' : ''}"><h3>${esc(s.titulo)}</h3><p>${rico(s.texto)}</p></article>`).join('')}</div>
</div></section>` : ''}

${c.autoridade ? `<section class="aut${c.autoridade.imagem ? '' : ' sem-img'}" style="background:#fff"><div class="w">
  ${c.autoridade.imagem ? `<div class="aut-img"><img src="${esc(c.autoridade.imagem)}" alt="${esc(c.autoridade.imagemAlt || m.nome)}" width="700" height="700" loading="lazy"></div>` : ''}
  <div>
    <span class="eyebrow">${esc(c.autoridade.eyebrow || 'Quem cuida de você')}</span>
    <h2>${rico(c.autoridade.titulo)}</h2>
    <p class="lead">${rico(c.autoridade.texto)}</p>
    ${lista(c.autoridade.numeros).length ? `<div class="numeros">${lista(c.autoridade.numeros).map(n => `<div><strong>${esc(n.valor)}</strong><span>${esc(n.rotulo)}</span></div>`).join('')}</div>` : ''}
  </div>
</div></section>` : ''}

${lista(c.depoimentos?.itens).length ? `<section class="dep"><div class="w centro">
  <h2>${rico(c.depoimentos.titulo)}</h2>
  <div class="deps" style="text-align:left">${lista(c.depoimentos.itens).map(d => `<figure class="dep-card"><span class="estrelas">${icone('estrela', 16).repeat(5)}</span><blockquote>${rico(d.texto)}</blockquote><footer><b>${esc(d.nome)}</b>${esc(d.detalhe)}</footer></figure>`).join('')}</div>
</div></section>` : ''}

<section class="triagem" id="triagem"><div class="w centro">
  <h2>${rico(tri.titulo || 'Vamos entender o que você precisa')}</h2>
  <p class="lead">${rico(tri.subtitulo || 'Responda 3 perguntas rápidas e fale direto com a nossa equipe no WhatsApp.')}</p>
  <div class="tri-box" style="text-align:left">
    <div class="barra"><i></i></div>
    ${perguntas.map((q, i) => `<div class="passo${i === 0 ? ' ativo' : ''}" data-passo="${i}" data-chave="${esc(q.chave || `pergunta${i + 1}`)}">
      <h3>${esc(q.pergunta)}</h3>
      <div class="opcoes">${lista(q.opcoes).map(o => `<button type="button" data-valor="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      ${i > 0 ? '<button type="button" class="voltar">Voltar</button>' : ''}
    </div>`).join('')}
    <form class="passo" data-passo="${perguntas.length}" id="form-lead" novalidate>
      <h3>${esc(tri.tituloContato || 'Para quem a nossa equipe vai responder?')}</h3>
      <label class="campo"><span>Seu nome</span><input name="nome" autocomplete="given-name" required></label>
      <label class="campo"><span>WhatsApp com DDD</span><input name="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 90000-0000" required></label>
      <label class="lgpd"><input type="checkbox" name="consentimento" required data-consentimento><span>Concordo em ser contatado(a) pela ${esc(m.nome)} e li o <a href="privacidade.html" target="_blank">aviso de privacidade</a>.</span></label>
      <button class="btn" type="submit">${icone('whatsapp')} ${esc(tri.ctaFinal || 'Continuar no WhatsApp')}</button>
      <button type="button" class="voltar">Voltar</button>
    </form>
  </div>
</div></section>

${lista(c.faq?.itens).length ? `<section><div class="w">
  <h2 class="centro">${rico(c.faq.titulo || 'Perguntas frequentes')}</h2>
  <div class="faq-lista">${lista(c.faq.itens).map(f => `<details><summary>${esc(f.pergunta)}</summary><p>${rico(f.resposta)}</p></details>`).join('')}</div>
</div></section>` : ''}

${c.ctaFinal ? `<section class="final" style="background:#fff"><div class="w">
  <h2>${rico(c.ctaFinal.titulo)}</h2>
  <p class="lead">${rico(c.ctaFinal.texto)}</p>
  <a class="btn" href="#triagem" data-cta="final">${esc(c.ctaFinal.cta || h.cta || 'Falar agora')} ${icone('seta')}</a>
</div></section>` : ''}
</main>

<footer class="rodape"><div class="w">
  <div>
    <div class="logo" style="margin-bottom:14px">${esc(m.nome)}</div>
    ${ct.endereco ? `<p>${icone('local', 18)} ${esc(ct.endereco)}</p>` : ''}
    ${ct.horario ? `<p>${icone('relogio', 18)} ${esc(ct.horario)}</p>` : ''}
  </div>
  <div>
    ${whats ? `<p><a href="${linkWhats()}" data-cta="rodape">WhatsApp</a></p>` : ''}
    ${ct.telefone ? `<p><a href="tel:${esc(String(ct.telefone).replace(/\D/g, ''))}">${esc(ct.telefone)}</a></p>` : ''}
    ${ct.instagram ? `<p><a href="${esc(ct.instagram)}" target="_blank" rel="noopener">Instagram</a></p>` : ''}
  </div>
  <div><p><a href="privacidade.html">Aviso de privacidade</a></p></div>
  <small>© ${ano} ${esc(m.nome)}${ct.cnpj ? ` · CNPJ ${esc(ct.cnpj)}` : ''}</small>
</div></footer>

${whats ? `<a class="flutuante" href="${linkWhats()}" data-cta="flutuante" aria-label="Falar no WhatsApp">${icone('whatsapp', 30)}</a>` : ''}

<script>
// ===== CONFIGURAÇÃO (vazio = desativado) =====
const CONFIG = {
  PIXEL_ID: ${JSON.stringify(r.pixelId || '')},
  GTM_ID: ${JSON.stringify(r.gtmId || '')},
  WEBHOOK_URL: ${JSON.stringify(r.webhookUrl || '')},
  WHATSAPP: ${JSON.stringify(whats)},
  EMPRESA: ${JSON.stringify(m.nome || '')}
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

// UTMs e IDs de clique: guardados na sessão para não se perderem ao navegar
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
  if (a.href.includes('wa.me')) evento('Contact', 'clique_whatsapp', { local: a.dataset.cta });
}));

// Triagem em passos
const passos = [...document.querySelectorAll('.passo')];
const barra = document.querySelector('.barra i');
const respostas = {};
let atual = 0;
const ir = n => {
  passos[atual].classList.remove('ativo');
  atual = n;
  passos[atual].classList.add('ativo');
  barra.style.width = ((atual + 1) / passos.length * 100) + '%';
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
form.addEventListener('submit', async e => {
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
    // sendBeacon sobrevive à troca de página; fetch como alternativa
    const ok = navigator.sendBeacon && navigator.sendBeacon(CONFIG.WEBHOOK_URL, new Blob([corpo], { type: 'text/plain' }));
    if (!ok) fetch(CONFIG.WEBHOOK_URL, { method: 'POST', body: corpo, keepalive: true, mode: 'no-cors' }).catch(() => {});
  }

  const linhas = ['Olá! Meu nome é ' + nome + '.'];
  Object.values(respostas).forEach((r, i) => linhas.push(document.querySelectorAll('.passo h3')[i].innerText + ' ' + r));
  if (origem.utm_campaign) linhas.push('(via ' + origem.utm_campaign + ')');
  const url = 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\\n'));
  setTimeout(() => { location.href = url; }, 250);
});
</script>
</body>
</html>
`;

  const privacidade = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Aviso de privacidade — ${esc(m.nome)}</title>${oficial ? '' : '<meta name="robots" content="noindex,nofollow">'}
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:40px 20px;line-height:1.7;color:#1c1917}h1{font-size:28px;margin-bottom:16px}h2{font-size:19px;margin-top:28px}</style></head><body>
<h1>Aviso de privacidade</h1>
<p><b>${esc(m.nome)}</b>${ct.cnpj ? `, CNPJ ${esc(ct.cnpj)}` : ''}, é a controladora dos dados enviados por este site.</p>
<h2>Quais dados coletamos</h2><p>Nome, número de WhatsApp, as respostas do formulário e informações de origem da visita (como o anúncio ou campanha que trouxe você até aqui).</p>
<h2>Para que usamos</h2><p>Exclusivamente para responder ao seu contato, agendar atendimento e acompanhar sua solicitação. Base legal: consentimento (art. 7º, I, LGPD) e procedimentos preliminares a contrato (art. 7º, V).</p>
<h2>Cookies e anúncios</h2><p>Este site pode usar ferramentas de medição (Meta Pixel e Google Tag Manager) para entender quais anúncios funcionam e mostrar anúncios relevantes.</p>
<h2>Por quanto tempo guardamos</h2><p>Até 24 meses após o último contato, ou até você pedir a exclusão.</p>
<h2>Seus direitos</h2><p>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento${ct.email ? ` pelo e-mail ${esc(ct.email)}` : whats ? ' pelo nosso WhatsApp' : ''}.</p>
<p><a href="index.html">← Voltar</a></p></body></html>`;

  fs.writeFileSync(path.join(pasta, 'index.html'), html);
  fs.writeFileSync(path.join(pasta, 'privacidade.html'), privacidade);
  console.log(`LP gerada (${oficial ? 'OFICIAL' : 'protótipo'}): ${path.join(pasta, 'index.html')}`);
  if (!whats) console.warn('Aviso: contato.whatsapp vazio — botões de WhatsApp não vão funcionar.');
}

const args = process.argv.slice(2);
const slug = args.find(a => !a.startsWith('--'));
if (!slug) { console.log('Uso: node motor-local/gerar-lp.js <slug> [--oficial]'); process.exit(1); }
gerar(slug, args.includes('--oficial'));

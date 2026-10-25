# O que falta para o Pinas OS ficar 100%

Atualizado em 25/10/2026. Riscar conforme for resolvendo.

## Depende de você (bloqueia uso real)
- [ ] **Instalar no seu computador** e rodar `npm run testar` (README, seção 2).
- [ ] **Preencher o `.env`**: chave do PageSpeed, `PINAS_WHATSAPP`, dados do Pinas Kit.
- [x] ~~Pinas Kit: descobrir como integrar~~ feito: pela API pública `w-lead` (li o código do repositório `pinas_kit`), sem senha.
- [ ] **Pinas Kit, 2 minutos**: criar a captação "Prospects Pinas OS" na sua conta, copiar a chave (`data-pk`) para `PINAS_KIT_CHAVE` no `.env` e rodar `node motor-local/pinas-kit.js testar`. Não consegui testar contra o servidor real daqui (rede bloqueada); testei contra uma cópia local com as mesmas validações.
- [ ] **Trocar a senha do Pinas Kit** (poguerio9): ela foi enviada em texto no chat. A integração não precisa dela.
- [ ] **Testar o coletor de referências** com os sites reais (Behance, Biblioteca de Anúncios, Instagram). Daqui não foi possível: a rede bloqueia esses sites. Pode precisar de ajuste nos seletores.
- [ ] **Testar a locução** (edge-tts) no seu computador.
- [ ] **n8n no ar** com URL pública + Planilha Mestre criada (README, seção 10).
- [ ] **Revisar o contrato** com um advogado.
- [ ] **Hospedagem das LPs dos clientes**: criar conta grátis no Cloudflare Pages ou Netlify.

## Melhorias que eu (Claude) posso fazer depois
- [ ] **Pinas Kit, melhoria do lado do Kit**: um endpoint de API com token por conta (sem o limite de 10/hora por IP) e etiquetas no contato. Sugestões em `integracoes/pinas-kit.md`.
- [ ] **Publicação automática** das LPs via Cloudflare Pages/Netlify CLI (hoje é manual, de propósito).
- [ ] **Relatório puxando dados direto** da API de Anúncios da Meta (hoje o investimento é digitado). Precisa de app na Meta e token.
- [ ] **Teste A/B** de headline na LP (duas versões + `utm_content`).
- [ ] **Página da própria Pinas** (site da agência) usando um dos 3 estilos.
- [ ] **Mais estilos de LP** depois de ver as referências reais do Behance (ex.: um estilo "popular/varejo" para nichos de ticket baixo).
- [ ] **Agendar a rotina** (`/8-rotina` toda manhã) com o agendador do Claude Code ou do sistema.

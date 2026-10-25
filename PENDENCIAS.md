# O que falta para o Pinas OS ficar 100%

Atualizado em 25/10/2026. Riscar conforme for resolvendo.

## Depende de você (bloqueia uso real)
- [ ] **Instalar no seu computador** e rodar `npm run testar` (README, seção 2).
- [ ] **Preencher o `.env`**: chave do PageSpeed, `PINAS_WHATSAPP`, dados do Pinas Kit.
- [ ] **Pinas Kit**: o endereço `pinaskit.vercel.app` não existe (domínio não encontrado). Confirmar o endereço certo e dizer se ele tem API/webhook, quais campos aceita e se exporta CSV. Ver `integracoes/pinas-kit.md`.
- [ ] **Trocar a senha do Pinas Kit**: ela foi enviada em texto no chat. Para integrar, prefira um token de API ou um usuário só para o Pinas OS.
- [ ] **Testar o coletor de referências** com os sites reais (Behance, Biblioteca de Anúncios, Instagram). Daqui não foi possível: a rede bloqueia esses sites. Pode precisar de ajuste nos seletores.
- [ ] **Testar a locução** (edge-tts) no seu computador.
- [ ] **n8n no ar** com URL pública + Planilha Mestre criada (README, seção 10).
- [ ] **Revisar o contrato** com um advogado.
- [ ] **Hospedagem das LPs dos clientes**: criar conta grátis no Cloudflare Pages ou Netlify.

## Melhorias que eu (Claude) posso fazer depois
- [ ] **Pinas Kit de verdade**: assim que souber a API, trocar o envio genérico pelo formato exato. Se não houver API, automatizar o navegador para cadastrar leads (precisa do endereço certo e de um usuário dedicado).
- [ ] **Publicação automática** das LPs via Cloudflare Pages/Netlify CLI (hoje é manual, de propósito).
- [ ] **Relatório puxando dados direto** da API de Anúncios da Meta (hoje o investimento é digitado). Precisa de app na Meta e token.
- [ ] **Teste A/B** de headline na LP (duas versões + `utm_content`).
- [ ] **Página da própria Pinas** (site da agência) usando um dos 3 estilos.
- [ ] **Mais estilos de LP** depois de ver as referências reais do Behance (ex.: um estilo "popular/varejo" para nichos de ticket baixo).
- [ ] **Agendar a rotina** (`/8-rotina` toda manhã) com o agendador do Claude Code ou do sistema.

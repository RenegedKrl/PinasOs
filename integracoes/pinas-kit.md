# Integração com o Pinas Kit

O Pinas OS usa a **API pública de captação** do Pinas Kit (função `w-lead` no Supabase, a mesma que o widget `w.js` usa).
**Não precisa de login nem senha**, só da chave pública de uma captação (o `data-pk` do código de instalação).

API: `https://qdpwawkeiyvggcfonfsa.supabase.co/functions/v1` (projeto do `pinas_kit`, ver `docs/STATUS.md` lá).

## 1. Leads das LPs dos clientes → Pinas Kit do cliente
Cada cliente da agência que usa o Pinas Kit tem a própria conta e captação.
1. No Pinas Kit do cliente: **Captação → Nova** → copie a chave do código de instalação (`data-pk="..."`).
2. Em **Configurações → Sites**, cadastre o domínio da LP (a API só aceita leads de domínios cadastrados; lista vazia aceita qualquer um).
3. No `clientes/<slug>/site/lp-conteudo.json`:
   ```json
   "rastreamento": { "pinasKitChave": "CHAVE_DO_CLIENTE" }
   ```
4. `node motor-local/gerar-lp.js <slug> --oficial`

Ao concluir a triagem, a LP envia ao Pinas Kit: nome, WhatsApp, respostas (campo "momento"), as perguntas e respostas (mensagem), UTMs e fbclid/gclid.
O contato aparece em **Contatos** com a origem certa ("Meta Ads", "Google Ads", "Instagram"…) e entra no Funil. O visitante continua indo para o WhatsApp com a mensagem completa.

## 2. Prospects do Pinas OS → o SEU Pinas Kit
1. Na sua conta: crie uma captação só para isso (ex.: "Prospects Pinas OS") e copie a chave.
2. No `.env`:
   ```
   PINAS_KIT_CHAVE=sua-chave
   ```
3. Teste (não cria contato): `node motor-local/pinas-kit.js testar`
4. Enviar:
   - um: `node motor-local/pinas-kit.js enviar-prospect <slug> "protótipo pronto"`
   - todos os prontos com WhatsApp: `node motor-local/pinas-kit.js enviar-lote` (não repete quem já foi; controle em `comercial/.pinas-kit-enviados.json`)

Cada prospect vira um contato com: nome = empresa, momento = status, mensagem = nicho, cidade, site, pontuação, principais falhas e se o protótipo está pronto. Origem: `pinas-os` / campanha `prospeccao-<nicho>`.

### Limites da API (do próprio Pinas Kit)
- 10 contatos por hora por IP e 3 por telefone por dia. O `enviar-lote` para sozinho no limite: rode de novo depois.
- A conta precisa estar com assinatura ativa ou em teste.
- O prospect precisa ter WhatsApp com DDD na coluna `whatsapp` do pipeline.
- A origem enviada é `PINAS_KIT_ORIGEM` (padrão `https://pinaskit.vercel.app`, sempre aceita). Se trocar o domínio do Pinas Kit, atualize.

## 3. Importar a lista de prospecção do Pinas Kit
Contatos → **Exportar** (CSV) → `node motor-local/pinas-kit.js importar arquivo.csv` → `node motor-local/prospectar-lote.js`.

## 4. Webhook genérico (alternativa)
Se preferir outro sistema: `PINAS_KIT_URL` (+ `PINAS_KIT_TOKEN`, `PINAS_KIT_AUTH=bearer|header|query`) e deixe `PINAS_KIT_CHAVE` vazio. O payload JSON completo está em `montarProspect()` de `motor-local/pinas-kit.js`.

## Sugestões para o Pinas Kit (no repositório pinas_kit)
- Um endpoint autenticado por token (ex.: `POST /functions/v1/api-leads` com chave de API da conta) para integrações de servidor, sem o limite por IP pensado para visitantes.
- Campo `etiquetas` no `w-lead` (ex.: "prospect", nicho) para separar prospects de leads de verdade.

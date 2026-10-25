# Integração com o Pinas Kit

O Pinas OS conversa com o Pinas Kit de três jeitos. Use o que o Pinas Kit suportar.

## 1. Webhook (recomendado)
Configure no `.env`:
```
PINAS_KIT_URL=https://seu-pinas-kit/api/webhook
PINAS_KIT_TOKEN=seu-token
PINAS_KIT_AUTH=bearer        # bearer | header (X-Api-Key) | query (?token=)
```
Teste: `node motor-local/pinas-kit.js testar`

### O que o Pinas OS envia (POST JSON)
**Prospect** (`node motor-local/pinas-kit.js enviar-prospect <slug> [status]`, chamado no fim do `/1-prospectar`):
```json
{
  "tipo": "prospect", "origem": "pinas-os", "slug": "clinica-x",
  "empresa": "Clínica X", "nicho": "Odontologia", "cidade": "Campinas", "site": "https://...",
  "whatsapp": "5519...", "status": "protótipo pronto", "pontuacao": 11.5,
  "oportunidades": ["CRÍTICO (Tráfego): Sem Pixel da Meta ..."],
  "performanceMobile": 34, "temPixel": false, "prototipo": true, "videoDemo": true,
  "abordagem": "texto das mensagens...", "atualizadoEm": "2026-10-25T10:00:00Z"
}
```
**Lead** (vindo da LP, enviado pelo nó "Enviar ao Pinas Kit" do workflow n8n):
```json
{ "tipo": "lead", "origem": "lp-pinas", "cliente": "clinica-x", "data": "...", "nome": "Maria",
  "telefone": "5519...", "resposta1": "Implante", "resposta2": "Este mês",
  "utm_source": "meta", "utm_campaign": "...", "status": "Novo lead", "link_whatsapp": "https://wa.me/..." }
```
Se o Pinas Kit espera outros nomes de campo, ajuste `montarProspect()` em `motor-local/pinas-kit.js` (um lugar só).

## 2. CSV (sem API)
- **Do Pinas Kit para o OS:** exporte os prospects como CSV e rode
  `node motor-local/pinas-kit.js importar arquivo.csv`
  Reconhece colunas como nome/empresa, categoria/nicho, site/website/url, telefone/whatsapp, cidade, instagram (com `,` ou `;`). Duplicados são ignorados.
- **Do OS para o Pinas Kit:** `node motor-local/pinas-kit.js exportar` → `comercial/exportar-pinas-kit.csv`.

## 3. Fluxo completo sugerido
1. Pinas Kit encontra empresas (Google Maps etc.) → exporta CSV.
2. `pinas-kit.js importar` → `prospectar-lote.js` (diagnostica todos e ranqueia).
3. `/0-piloto-automatico` nos 5 melhores do ranking.
4. Cada prospect pronto volta ao Pinas Kit com `enviar-prospect` (status, pontuação, mensagens).
5. Leads das LPs dos clientes chegam no Pinas Kit pelo n8n.

## O que eu (Claude) preciso saber do Pinas Kit para fechar a integração
- Ele tem API/webhook? Qual URL e como autentica?
- Quais campos ele aceita para prospect e para lead?
- Ele exporta CSV? Com quais colunas?

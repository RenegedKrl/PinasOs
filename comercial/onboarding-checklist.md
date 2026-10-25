# Onboarding do cliente — o que pedir no dia 1

## Primeiro passo
Mande o formulário de briefing: `node motor-local/gerar-briefing.js <slug> --nome "Empresa"` (publique a pasta `briefing/` ou mande o arquivo). Ele cobre quase tudo abaixo.
Depois do pagamento, cadastre o cliente em `comercial/financeiro.csv` (modelo em `financeiro.modelo.csv`), com `url_lp` para a auditoria semanal.

## Acessos (nunca peça senha — peça para adicionar o e-mail da Pinas)
- [ ] Meta Business (Gerenciador de Negócios) → adicionar Pinas como **parceiro** com acesso a: conta de anúncios, Pixel/conjunto de dados, página do Facebook, Instagram.
- [ ] Forma de pagamento cadastrada **pelo cliente** na conta de anúncios.
- [ ] Google Ads → convite de acesso padrão (se houver Google).
- [ ] Google Tag Manager → acesso de publicação (ou criar um novo na conta do cliente).
- [ ] Domínio: acesso ao DNS (Registro.br / Hostinger / Cloudflare) ou alguém que aponte o registro.
- [ ] Google Meu Negócio → gerente.

## Materiais
- [ ] Logo em PNG/SVG
- [ ] 10–20 fotos reais (equipe, espaço, atendimento, antes/depois **com autorização** do paciente/cliente)
- [ ] 3–5 depoimentos reais (print do Google/WhatsApp com autorização)
- [ ] Lista de serviços com preço médio e qual é o mais lucrativo
- [ ] Número de WhatsApp comercial e quem atende
- [ ] Horário de atendimento, endereço, CNPJ, e-mail para LGPD

## Operação
- [ ] Quem da equipe vai usar o CRM (nome + WhatsApp)
- [ ] Reunião de treinamento marcada (1h)
- [ ] Reunião mensal de resultado marcada (recorrente)
- [ ] Grupo de WhatsApp Pinas + cliente criado

## Técnico (Pinas faz)
- [ ] `node motor-local/novo-cliente.js <slug>` e preencher contexto
- [ ] Planilha Mestre criada a partir de `crm/leads-modelo.csv`
- [ ] Workflow n8n importado e testado com um lead de teste
- [ ] LP oficial publicada e `verificar-lp.js --oficial` aprovado
- [ ] Evento `Lead` aparecendo no Gerenciador de Eventos da Meta

---
description: Gera proposta comercial e contrato preenchidos para um prospect
argument-hint: <slug> <pacote: start|maquina|completo> [observações]
---
# Skill 5: Proposta e contrato

Argumentos: `$ARGUMENTS`.

1. Leia `clientes/<slug>/contexto/contexto-empresa.md` (seções "3 vazamentos" e "Notas da reunião") e `comercial/tabela-precos.md`.
2. Preencha `comercial/proposta-modelo.md` → `clientes/<slug>/contexto/proposta.md`:
   - `{{DIAGNOSTICO_3_PONTOS}}` = os 3 vazamentos em linguagem do dono, com o dado real do diagnóstico.
   - Valores do pacote escolhido. Se o usuário passou outro valor nas observações, use o dele.
   - Validade: 7 dias. Datas no formato dd/mm/aaaa.
   - Qualquer `{{CAMPO}}` sem informação: pergunte ao usuário no final, em lista única. Não invente CNPJ, endereço ou nomes.
3. Preencha `comercial/contrato-modelo.md` → `clientes/<slug>/contexto/contrato.md` com os mesmos dados. Mantenha o aviso "revise com um advogado".
4. Gere uma versão para enviar por WhatsApp (até 8 linhas) em `clientes/<slug>/contexto/proposta-whatsapp.txt`: o problema, os 3 serviços, o investimento e o próximo passo.
5. Atualize a linha do prospect em `comercial/pipeline-prospeccao.csv` para `proposta enviada`.

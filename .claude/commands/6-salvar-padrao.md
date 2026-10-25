---
description: Salva um padrão aprovado (LP, criativo ou regra) na biblioteca global para reutilizar
argument-hint: <o que salvar, ex: "hero da clinica-x" ou "regra: nunca usar azul em advocacia">
---
# Skill 6: Salvar padrão / aprendizado

Pedido: `$ARGUMENTS`

Decida o destino:
- **Seção ou estrutura de LP** → `assets-globais/inspiracoes-lp/padroes-conversao.md`
- **Fundo/criativo que performou** → `assets-globais/inspiracoes-criativos/padroes-fundos.md` (seção Histórico, com CTR/CPL se o usuário informar)
- **Informação de nicho** (objeção, pergunta de triagem, restrição de conselho) → seção do nicho em `assets-globais/inspiracoes-lp/nichos.md`
- **Regra de comportamento definitiva** → `## Histórico de aprendizado` da skill correspondente em `.claude/commands/`, e remova a linha equivalente de `APRENDIZADOS.md`

Regras:
- Descreva a **estrutura**, não copie o código inteiro (máx. 10 linhas por padrão).
- Sem dados pessoais de clientes ou leads.
- Antes de adicionar, procure (`grep`) se já existe algo parecido; se existir, atualize em vez de duplicar. Se contradizer uma regra existente, pergunte ao usuário qual vale.
- Confirme ao usuário em 1 linha onde salvou.

# Planos Footlink — matriz de valores para a Cláusula Sexta

Esta é a fonte da **coluna direita** da tabela "DO PREÇO E DAS LICENÇAS" (Cláusula Sexta).
A **coluna esquerda** (rótulos das features) vem de `features.md`.

Fonte: `2026-03 - Footlink - Tabela de Planos.xlsx`, abas "Clubes - Planos" e "Agentes - Planos".
Preços aqui são **tabela cheia** (referência); o valor real do contrato vem sempre do **pedido de venda**, nunca daqui.

---

## CLUBES

Planos vigentes: **Starter, Basic, Essential, Elite, Multi-Club** (+ licença **Feminino**, especial).

A tabela do contrato usa granularidade condensada (≈13 linhas), não as 36 linhas técnicas da planilha.
Para cada feature, o valor por plano:

| Feature (rótulo curto) | Starter | Basic | Essential | Elite | Multi-Club |
|---|---|---|---|---|---|
| Meu Clube | Não | Sim | Sim | Sim | Sim |
| Meu Feed | Sim | Sim | Sim | Sim | Sim |
| Footlink Originals | Sim | Sim | Sim | Sim | Sim |
| Busca de Atletas | Sim | Sim | Sim | Sim | Sim |
| Perfil de Atletas | Sim | Sim | Sim | Sim | Sim |
| Competições | Sim | Sim | Sim | Sim | Sim |
| Projetos | Não | 5 | até 10 | Ilimitado | Ilimitado |
| Monitoramento | Até 200 | Até 500 | até 1.000 | Ilimitado | Ilimitado |
| Avaliações | Não | Até 1.000 | até 2.000 | Ilimitado | Ilimitado |
| Mercado de Transferências | Até 5 | Até 10 | até 20 | Ilimitado | Ilimitado |
| Chat Integrado | Recebe e envia | Recebe e envia | Recebe e envia | Recebe e envia | Recebe e envia |
| Agências | Sim | Sim | Sim | Sim | Sim |

Notas de granularidade (confirmadas nos contratos reais Goiás-Essential e SP-Elite):
- "Projetos", "Monitoramento", "Avaliações", "Mercado de Transferências" mostram o **limite numérico** do plano.
- Elite e Multi-Club: esses quatro viram **"Ilimitado"**.
- Licença **Feminino**: mesma configuração do plano-base do clube, porém "Acessa apenas dados de atletas do feminino". É uma licença gratuita/adicional, não um plano isolado.

## Preço de licença adicional — CLUBES (tabela cheia mensal, referência)
Starter 365 · Basic 575 · Essential 730 (1 lic) / 630 (combo 3) · Elite 330 (10) / 300 (20) / 275 (30) · Multi-Club 600/500.
**Sempre usar o valor do pedido de venda ("Valor para Licenças Adicionais").**

---

## AGENTES

Planos vigentes: **Single, Starter, Growth, Pro, Prime**. (LATAM/GLOBAL = legado, não usar.)

| Feature (rótulo curto) | Single | Starter | Growth | Pro | Prime |
|---|---|---|---|---|---|
| Número de Atletas | 1 | Até 10 | Até 30 | Até 100 | Ilimitado |
| Minha Agência | Não | Não | Sim | Sim | Sim |
| Meu Feed | Sim | Sim | Sim | Sim | Sim |
| Footlink Originals | Não | Sim | Sim | Sim | Sim |
| Busca de Atletas | Não | Somente Masc. ou Fem. | Sim | Sim | Sim |
| Perfil de Atletas | Somente do seu agenciado | Sim | Sim | Sim | Sim |
| Competições / Dados base BR | Não | Sim | Sim | Sim | Sim |
| Análise de Mercado | Não | Sim | Sim | Sim | Sim |
| Monitoramento | Não | Até 50 | 200 | 500 | Ilimitado |
| Projetos (Time Sombra) | Não | Não | 1 | 3 | Ilimitado |
| Avaliações | Não | Não | 200 | 1.000 | Ilimitado |
| Mercado de Transferências | Somente seu agenciado | Até 2 anúncios | Até 5 anúncios | Até 10 | Ilimitado |
| Chat Integrado | Recebe e envia | Recebe e envia | Recebe e envia | Recebe e envia | Recebe e envia |

## Preço de licença adicional — AGENTES (tabela cheia mensal, referência)
Single 300 · Starter 350 · Growth 600/550 · Pro 700/650/550 · Prime 750/700/650.
**Sempre usar o valor do pedido de venda ("Valor para Licenças Adicionais").**

---

## MAPA DE NOMENCLATURA (pedido de venda → plano canônico)

O pedido de venda pode trazer o nome em qualquer caixa e, às vezes, o nome legado.
Normalizar assim:

- Clube: "elite"→Elite, "essential"/"essencial"→Essential, "basic"/"básico"→Basic, "starter"→Starter, "multi-club"/"multi club"/"multiclub"→Multi-Club, "feminino"→Feminino.
- Agente (nomes atuais): "single"→Single, "starter"→Starter, "growth"→Growth, "pro"→Pro, "prime"→Prime.

### De (legado) → Para (atual) — planos de AGENTE
Mapa confirmado pelo Fabiano:
- "Brasil" → **Starter**
- "Latam" → **Pro**
- "Global" → **Prime**
- **Growth** e **Single** são planos novos (não têm equivalente legado).

Comportamento com nome legado no pedido: **não converter automaticamente.** A skill detecta o nome
legado, **sugere** o plano novo correspondente (ex.: "o pedido diz 'Latam'; o plano atual equivalente
é 'Pro' — confirmo?") e **espera a confirmação do usuário** antes de gerar. O contrato final sempre
usa o **nome do plano novo** — nunca o legado —, mesmo que contratos antigos assinados (ex.: Elenko)
ainda trouxessem "LATAM". Se o pedido trouxer um nome legado fora deste mapa, parar e perguntar.

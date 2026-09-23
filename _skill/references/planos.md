# Planos Footlink — matriz de valores para a Cláusula Sexta

Esta é a fonte da **coluna direita** da tabela "DO PREÇO E DAS LICENÇAS" (Cláusula Sexta).
A **coluna esquerda** (rótulos das features) vem de `features.md`.

O valor real do contrato (mensal, total, licença adicional) vem **sempre do pedido de venda**,
nunca daqui. As tabelas abaixo definem só a **configuração de features por plano** (o que cada
plano entrega) e o mapa de nomes.

## Linha de produto (importante)

A Footure passou a ter duas linhas de produto:
- **Footlink Scout** — a plataforma atual (scouting, análise de mercado, base de atletas). É o que
  todos os contratos atuais licenciam. Por isso os planos levam o prefixo **"Scout"**.
- **Footlink Manager** — produto novo de gestão interna de clubes e agências (ainda não contratado).

Todo plano, de clube ou de agente, leva o prefixo **Scout**. No contrato, o cabeçalho da tabela da
Cláusula Sexta imprime **"PLANO FOOTLINK SCOUT <PLANO>"** (ex.: "PLANO FOOTLINK SCOUT ESSENTIAL").

## Chave = PERFIL + PLANO (regra dura)

Como o prefixo Scout vale para os dois perfis, os nomes **Scout BASIC, Scout ESSENTIAL e Scout ELITE
existem tanto em clube quanto em agente**, com features e preços diferentes. Portanto **o plano
sozinho nunca identifica a configuração** — a chave é sempre `perfil + plano`. Um "Scout Essential"
de agente ≠ um "Scout Essential" de clube. Se o pedido não deixar o perfil claro, parar e perguntar.

---

## CLUBES — planos: Scout STARTER / Scout BASIC / Scout ESSENTIAL / Scout ELITE / Scout MULTI-CLUB

(+ licença **Feminino**, especial — mesma config do plano-base, "Acessa apenas dados de atletas do
feminino"; é licença gratuita/adicional, não plano isolado.)

Tabela do contrato = granularidade condensada (~13 linhas). Valor por plano:

| Feature (rótulo curto) | Starter | Basic | Essential | Elite | Multi-Club |
|---|---|---|---|---|---|
| Meu Clube | Não | Sim | Sim | Sim | Sim |
| Meu Feed | Sim | Sim | Sim | Sim | Sim |
| Footlink Originals | Sim | Sim | Sim | Sim | Sim |
| Busca de Atletas | Sim | Sim | Sim | Sim | Sim |
| Perfil de Atletas | Sim | Sim | Sim | Sim | Sim |
| Competições | Sim | Sim | Sim | Sim | Sim |
| Projetos | Não | até 05 | até 10 | Ilimitado | Ilimitado |
| Monitoramento | Até 200 | até 500 | até 1.000 | Ilimitado | Ilimitado |
| Avaliações | Não | até 1.000 | até 2.000 | Ilimitado | Ilimitado |
| Mercado de Transferências | Até 5 | até 10 | até 20 | Ilimitado | Ilimitado |
| Chat Integrado | Recebe e envia | Recebe e envia | Recebe e envia | Recebe e envia | Recebe e envia |
| Agências | Sim | Sim | Sim | Sim | Sim |

Confirmado nos contratos reais 2026: Pantanal (Basic: Proj 05/Mon 500/Aval 1.000/Merc 10),
Londrina (Essential: 10/1.000/2.000/20), Elite → tudo "Ilimitado".

---

## AGENTES — planos: Scout SINGLE / Scout BASIC / Scout ESSENTIAL / Scout PRIME / Scout ELITE

Fonte: descritivo de planos de agente **atualizado** (set/2026). A tabela do contrato de agente segue
esta estrutura agrupada (não a matriz técnica S/N dos contratos antigos Elenko/TFA, que é legado):

**CAPACIDADE**

| Feature | Single | Basic | Essential | Prime | Elite |
|---|---|---|---|---|---|
| Atletas agenciados | 1 | 10 | 30 | 100 | Ilimitado |
| Monitoramento de atletas | Não incluído | 50 | 200 | 500 | Ilimitado |
| Projetos com time sombra | Não incluído | Não incluído | 1 | 3 | Ilimitado |
| Avaliações de atletas | Não incluído | Não incluído | 200 | 1.000 | Ilimitado |
| Anúncios simultâneos de atletas sem contrato | Só o seu agenciado | 2 | 5 | 10 | Ilimitado |

**MINHA AGÊNCIA**

| Feature | Single | Basic | Essential | Prime | Elite |
|---|---|---|---|---|---|
| Gestão da carteira e análise de minutagem | Não incluído | Não incluído | Sim | Sim | Sim |
| Gestão de contratos | Não incluído | Não incluído | Sim | Sim | Sim |
| Workflow de gestão de mercado | Não incluído | Não incluído | Sim | Sim | Sim |

**BASE DE ATLETAS**

| Feature | Single | Basic | Essential | Prime | Elite |
|---|---|---|---|---|---|
| Busca na base completa | Não incluído | Sim | Sim | Sim | Sim |
| Modalidades e categorias | Não incluído | Masculino ou feminino | Todas | Todas | Todas |
| Perfil, desempenho, contratos, avaliações e relatórios | Só o seu agenciado | Toda a base | Toda a base | Toda a base | Toda a base |
| Competições de base brasileiras | Não incluído | Sim | Sim | Sim | Sim |
| Análise de mercado | Não incluído | Sim | Sim | Sim | Sim |

**MERCADO**

| Feature | Single | Basic | Essential | Prime | Elite |
|---|---|---|---|---|---|
| Mercado de transferências e janelas | Não incluído | Sim | Sim | Sim | Sim |
| Ver perfis de atletas desejados pelos clubes | Não incluído | Não incluído | Sim | Sim | Sim |
| Footlink Originals | Não incluído | Sim | Sim | Sim | Sim |

---

## Licença adicional
Preço de licença adicional vem **sempre do pedido de venda** ("Valor para Licenças Adicionais").
Valores de referência antigos podem estar desatualizados com a nova precificação Scout — não usar
valores fixos daqui; usar o do pedido.

---

## MAPA DE NOMENCLATURA (pedido de venda → plano canônico Scout)

O pedido pode trazer o nome em qualquer caixa e, às vezes, um nome de gerações anteriores.
O contrato **sempre** imprime o nome atual (Scout ...). Normalização:

- **Clube** (nomes atuais, só adicionar prefixo Scout): starter→Scout Starter, basic→Scout Basic,
  essential/essencial→Scout Essential, elite→Scout Elite, multi-club/multiclub→Scout Multi-Club,
  feminino→licença Feminino.
- **Agente** (nomes atuais): single→Scout Single, basic→Scout Basic, essential→Scout Essential,
  prime→Scout Prime, elite→Scout Elite.

### De (legado) → Para (atual) — planos de AGENTE (3 camadas)

| Camada 1 (legado antigo) | Camada 2 (intermediário) | Atual (usar no contrato) |
|---|---|---|
| Brasil | Starter | **Scout Basic** |
| — | Single | **Scout Single** |
| — | Growth | **Scout Essential** |
| Latam | Pro | **Scout Prime** |
| Global | Prime | **Scout Elite** |

Comportamento com nome de geração anterior no pedido (Brasil/Latam/Global, ou
Single/Starter/Growth/Pro/Prime): **não converter em silêncio.** Detectar, **sugerir** o nome Scout
correspondente (ex.: "o pedido diz 'Latam'; o plano atual é 'Scout Prime' — confirmo?") e **esperar
confirmação** antes de gerar. Nome fora deste mapa: parar e perguntar. Contratos antigos assinados
(Elenko "LATAM", TFA "GLOBAL") são legado e não devem ser reproduzidos.

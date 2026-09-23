# Prompt — Módulo de Geração de Contrato (fechamento de venda) · Footlink

> **Onde isto se encaixa:** este é o **motor de geração de contrato** dentro do sistema de
> fechamento de venda (Fase 1 do projeto). Quando um pedido de venda é aprovado, o sistema chama este
> módulo para produzir o contrato `.docx` automaticamente, pronto para revisão jurídica e assinatura.
> Cole este prompt no Claude do Antigravity com a pasta deste pacote na raiz do projeto.

> **Material de apoio (neste pacote, em `_skill/`) — é a FONTE DA VERDADE, não reescreva as regras de
> cabeça:**
> - `_skill/scripts/gerar_contrato.js` — gerador do contrato .docx (Node + lib `docx`). **Portar**
>   para uma API route do Next em TypeScript, **mantendo a lógica intacta**.
> - `_skill/scripts/parcelas.py` — lógica da tabela de parcelas (convenções `ciclo`/`calendario`).
>   **Re-implementar em TypeScript** (o projeto é 100% TS; não rodar Python).
> - `_skill/references/planos.md` — configuração de features por plano (chave perfil+plano), linha
>   Scout e mapa de nomenclatura (3 camadas). **Vira dado** (constantes TS/JSON).
> - `_skill/references/features.md` — rótulos das features (clube condensado; agente agrupado) + API.
> - `_skill/references/clausulas.md` — texto-base de todas as cláusulas, fixo/variável/opcional.
> - `_skill/assets/footlink-logo.png` — logo do cabeçalho.
> - `_skill/SKILL.md` — visão geral das regras (ler para entender; não é código do app).
> - `_validacao/*.docx` — dois contratos-gabarito (Pantanal clube/PIX; Elenko agente/Scout Prime)
>   gerados pela skill. O módulo portado deve reproduzi-los.

---

## 1. Objetivo

Dado um **pedido de venda aprovado**, gerar o contrato `.docx` da Footure sem intervenção manual,
salvá-lo versionado no Storage e mover o pedido para o estado `CONTRATO_GERADO`. O documento é sempre
**rascunho para revisão humana** (jurídico baixa, edita, sobe nova versão) — nunca vai direto para
assinatura.

## 2. Stack (já definida no projeto)

Next.js (App Router) + TypeScript · Supabase (Postgres/Auth/Storage) · Vercel. A geração do .docx usa
a biblioteca **`docx`** (npm) — a mesma do `gerar_contrato.js`, que porta direto para uma API route
(ex.: `app/api/contratos/gerar/route.ts`). Sem Python no runtime.

## 3. Entrada: dados do pedido aprovado

O módulo recebe o `pedido` (tabela `pedidos`) já aprovado. Campos relevantes:

`perfil` (clube|agente) · `cliente` (razão social) · `cnpj` · `endereco` · `representante_legal` ·
`plano` · `produtos` (footlink, api?) · `licencas_pagas` · `licencas_gratuitas` ·
`forma_pagamento` (boleto|pix|avista) · `valor_mensal` · `valor_total` · `valor_licenca_adicional` ·
`valor_mensal_api?` · `valor_mensal_software?` · `primeiro_pagamento` · `dia_vencimento` ·
`convencao_parcelas` (ciclo|calendario) · `divulgacao` (nenhuma|simples|obrigacao) ·
`percentual_desconto_divulgacao?` · `multa_tipo` · `multa_texto?` · `foro` · `condicao_especial?` ·
`vigencia_inicio` · `vigencia_fim`.

## 4. Mapeamento pedido → JSON do gerador (objeto `D`)

O `gerar_contrato.js` recebe um objeto `D`. Monte-o a partir do pedido:

| Campo D | Origem |
|---|---|
| `perfil` | `pedido.perfil` |
| `robusta` | `false` por padrão; `true` só se o cliente exigir a linhagem robusta (flag no pedido) |
| `cliente`, `cnpj`, `endereco`, `repLegal` | dados cadastrais do pedido (confirmados) |
| `plano` | nome Scout canônico (ex.: "Scout Essential") — ver regra de nomenclatura |
| `api`, `apiValorTexto`, `apiModelo` | de `produtos.api` + valores; `apiModelo` = 'combinado' (padrão) ou 'distintos' |
| `pagamento` | 'parcelado' se boleto/pix; 'vista' se à vista |
| `metodo` | 'boleto' ou 'pix' |
| `total`, `mensal` | valores por extenso (gerar o extenso) |
| `mensalApi`, `mensalSoftware` | só se `apiModelo='distintos'` |
| `licAdicional` | `valor_licenca_adicional` formatado |
| `diaVenc`, `primeiroVenc`, `vencAvista` | do pedido |
| `vigIni`, `vigFim` | do pedido |
| `divulgacao`, `postDivulgacao`, `setimaCustom` | ver regra de divulgação |
| `multaTexto` | do `multa_tipo` (texto pronto em clausulas.md para "3 mensalidades") |
| `foro` | `pedido.foro` (default Porto Alegre - RS) |
| `local` | "Porto Alegre, <data por extenso>" |
| `features` | montada de `features.md` × `planos.md` pela chave **perfil+plano** |
| `parcelas` | gerada pela função de parcelas (ver §6) |

## 5. Regras de negócio que DEVEM ser codificadas (não perder na tradução)

Estas são a razão de o módulo existir. Cada uma está detalhada nos arquivos `_skill/`:

1. **Linha Scout / nomenclatura.** O contrato imprime "PLANO FOOTLINK SCOUT <PLANO>". A chave de
   configuração é **perfil + plano** — Scout Basic/Essential/Elite existem em clube E agente com
   features/preços diferentes; o plano sozinho nunca basta. Se o perfil não estiver claro, **bloquear
   e exigir definição** (não gerar).
2. **Nomenclatura legada.** Se o pedido trouxer nome de geração anterior (Brasil/Latam/Global ou
   Single/Starter/Growth/Pro/Prime), **não converter em silêncio**: sugerir o nome Scout (mapa de 3
   camadas em `planos.md`) e **exigir confirmação humana** antes de gerar.
3. **Linhagem enxuta (padrão) vs robusta (opção).** `robusta=false` por padrão: SLA "mais elevado
   possível", LGPD condensada (Art. 7º), §1º de obrigação integral, multa 3 mensalidades. `robusta=true`
   só quando o cliente exigir: SLA 98%, LGPD reforçada, garantia de features, compliance.
4. **Multa.** Default = 3 mensalidades (texto pronto). Exceções (0, retenção total, 2 mensalidades) só
   quando o pedido explicitar em `multa_texto`.
5. **Divulgação — 3 níveis:** `nenhuma` (omite a cláusula) · `simples` (cláusula própria autorizando
   redes) · `obrigacao` (obrigação de fazer com desconto, entra na 7ª). Desconto por divulgação:
   **5% se a parcela mensal < R$ 1.000; 10% se ≥ R$ 1.000**, mas o percentual é **sempre informado no
   pedido** (pode variar). Os valores já descontados vão em `total`/`mensal`; narração comercial
   complexa vai em `setimaCustom`.
6. **API.** Entra no objeto (item ii), na PI, na mora e como **segunda tabela separada** na Cláusula
   Sexta. Cobrança: `combinado` (soma num boleto único — padrão recente) ou `distintos` (boletos
   separados).
7. **Pagamento.** `boleto` (dia 10 típico) ou `pix` (inclui bloco de dados bancários + exigência de
   NF + dia 25). À vista = parcela única, sem tabela de parcelas.
8. **Numeração dinâmica das cláusulas.** A cláusula de divulgação `simples` é standalone (Décima) e
   **desloca** vigência/rescisão/etc. O `gerar_contrato.js` já resolve isso — preserve essa lógica ao
   portar (não hardcodar ordinais).
9. **Título** sempre "INSTRUMENTO PARTICULAR DE USO DO SOFTWARE FOOTLINK". **Foro** default Porto
   Alegre/RS.

## 6. Como portar (passos)

1. **Dados das features:** transformar as tabelas de `planos.md` (clube condensado + agente agrupado
   por seções Capacidade/Minha Agência/Base/Mercado) em constantes TS, indexadas por `perfil+plano`,
   devolvendo a lista `features` no formato do gerador (`[rótulo, valor]`, seção = `['#','CAPACIDADE']`).
   Os rótulos literais vêm de `features.md`.
2. **Parcelas:** reimplementar `parcelas.py` em TS — duas convenções (`ciclo`: dia→dia-1 do mês
   seguinte; `calendario`: mês-calendário cheio), 12 linhas, a partir do 1º vencimento.
3. **Gerador:** portar `gerar_contrato.js` para uma API route TS, mantendo todas as ramificações
   (linhagem, pagamento, divulgação, API, numeração dinâmica, cabeçalho/rodapé/logo, página de
   assinaturas). O logo é `_skill/assets/footlink-logo.png` (mover para os assets do projeto).
4. **Extenso monetário:** função que gera o valor por extenso em pt-BR (ex.: "R$ 6.600,00 (seis mil e
   seiscentos reais)").
5. **Persistência:** salvar o .docx no Supabase Storage; criar registro em `contratos` (versão 1,
   `pedido_id`, path); pedido → `CONTRATO_GERADO`.

## 7. Saída e revisão

- Arquivo `.docx` no Storage, nome `{CLIENTE}_Footlink_Contrato_{PLANO}_{PAGAMENTO}.docx`.
- Estado do pedido → `CONTRATO_GERADO` → jurídico revisa (baixa, edita, **sobe nova versão** —
  versionar, não sobrescrever) → `PRONTO_PARA_ASSINATURA`.
- Nenhuma geração vai direto para assinatura.

## 8. Critérios de aceite (validar antes de seguir)

Gere estes dois casos pelo módulo portado e compare com `_validacao/`:

1. **Clube Scout Basic, PIX, parcelado** (tipo Pantanal): título "DE USO"; SLA "mais elevado
   possível"; sem LGPD reforçada; tabela "PLANO FOOTLINK SCOUT BASIC" com Proj até 05 / Mon até 500 /
   Aval até 1.000 / Merc até 10; bloco de dados bancários PIX; cláusula de divulgação simples como
   Décima; vigência Décima Primeira; rescisão Décima Segunda com multa 3 mensalidades; foro Porto Alegre.
2. **Agente Scout Prime, boleto, parcelado** (tipo Elenko): tabela "PLANO FOOTLINK SCOUT PRIME"
   agrupada (Capacidade/Minha Agência/Base/Mercado) com Atletas 100 / Mon 500 / Proj 3 / Aval 1.000 /
   Anúncios 10; §1º obrigação integral; sem divulgação → vigência Décima, rescisão Décima Primeira;
   nome do plano impresso como **Scout Prime** (nunca "LATAM").

Se ambos baterem com os gabaritos, o motor está fiel. Divergência → corrigir antes de plugar Bling,
comissionamento e assinatura (Fases 2 e 3).

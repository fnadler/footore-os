---
name: footlink-contract
description: >
  Gera contratos de uso do software Footlink (produto SaaS da Footure) a partir de um Pedido de Venda.
  Use SEMPRE que o usuário enviar um pedido de venda do Footlink (.xlsx ou dados soltos) e pedir para
  elaborar, montar, gerar, redigir ou "fazer o contrato" de um clube ou de um agente/agência. Vale
  também quando o pedido não usa a palavra "contrato" mas descreve o mesmo resultado: transformar as
  informações de uma venda do Footlink (perfil clube/agente, plano, licenças, valores, forma de
  pagamento) no instrumento particular de uso pronto para assinatura. Cobre clubes (planos Scout
  Starter/Basic/Essential/Elite/Multi-Club) e agentes (Scout Single/Basic/Essential/Prime/Elite), com
  ou sem API, à vista ou parcelado (boleto ou PIX). Entrega .docx.
license: Proprietary.
---

# Gerador de contratos Footlink

Transforma um **Pedido de Venda** do Footlink em um **contrato .docx** pronto para revisão e assinatura.

A CONTRATADA é sempre a mesma (Footure). O que muda: perfil (clube/agente), escopo (Footlink e/ou
API), plano, licenças, valores, forma de pagamento (à vista/parcelado; boleto/PIX), divulgação e
alguns blocos negociáveis. O resto é fixo.

## Linha de produto e nomenclatura (ler primeiro)

A Footure tem duas linhas: **Footlink Scout** (plataforma atual — é o que se contrata hoje; planos
levam o prefixo **"Scout"**) e **Footlink Manager** (gestão interna, ainda não contratado). O contrato
imprime **"PLANO FOOTLINK SCOUT <PLANO>"**.

**Chave = PERFIL + PLANO (regra dura).** Scout BASIC, ESSENTIAL e ELITE existem em clube E agente, com
features e preços diferentes. O plano sozinho nunca identifica a configuração — sempre `perfil + plano`.
Se o perfil não estiver claro no pedido, **pare e pergunte**.

## Fluxo (siga em ordem)

1. **Ler o pedido.** `.xlsx` → `python scripts/parse_pedido.py <arquivo>`. Dados soltos → colete os
   mesmos campos (lista em "Campos do pedido").
2. **Normalizar e validar** (ver "Validações"). Faça as perguntas necessárias ANTES de gerar.
3. **Montar os dados** (JSON) combinando pedido + `references/clausulas.md` (cláusulas) +
   `references/features.md` × `references/planos.md` (Cláusula Sexta, pela chave perfil+plano).
4. **Gerar** com `node scripts/gerar_contrato.js <dados.json> <saida.docx>` (leia
   `/mnt/skills/public/docx/SKILL.md` se precisar editar o .docx depois). Saída em `/mnt/user-data/outputs/`.
5. **Renderizar e conferir** (converter para imagem e ler). Cheque plano, valores, datas, foro, multa,
   numeração das cláusulas.
6. **Enviar para revisão** com um bloco de "pontos que variaram / confira antes de assinar".
7. **Ajustar** e repetir até aprovação.

## Campos do pedido

Perfil (clube/agente) · Produtos (Footlink / +API) · Licenças Pagas · Licenças Gratuitas · Plano ·
Forma de Pagamento (boleto/pix/à vista) · Valor Mensal · Valor Total · Valor Licença Adicional ·
Data do 1º pagamento · Dia de vencimento · Divulgará parceria? · Condição especial · dados cadastrais.

## Decisões fixas (não perguntar)

- **Saída: .docx.** Título: **"INSTRUMENTO PARTICULAR DE USO DO SOFTWARE FOOTLINK"**.
- **CONTRATADA fixa:** Footure (dados em `references/clausulas.md`).
- **Linhagem PADRÃO = ENXUTA** para clube E agente: SLA "o mais elevado possível", LGPD condensada
  (Art. 7º), §1º de obrigação integral 12 meses, multa 3 mensalidades. É o padrão real 2026.
- **Linhagem ROBUSTA = OPÇÃO** (só quando o cliente exigir): SLA 98%, garantia de features, LGPD
  reforçada controladora/operadora, compliance, não-vínculo. Foi específica de São Paulo/Corinthians.
  No gerador, `robusta: true`. **No enxuto o clube sai sem LGPD reforçada — decisão consciente do Fabiano.**
- **Juros de mora:** 1% a.m. + multa 2% + IGPM-FGV.
- **Foro:** Porto Alegre/RS, salvo imposição do cliente.

## Variáveis (do pedido ou de pergunta)

- **Multa de rescisão** é negociável. Default = 3 mensalidades (texto pronto em clausulas.md). Exceções
  só se o pedido explicitar (SP=0; Bragantino à vista=retenção total; Corinthians=2 mensalidades).
- **Divulgação** tem 3 níveis (`divulgacao`): `nenhuma` · `simples` (cláusula própria autorizando
  redes) · `obrigacao` (obrigação de fazer com desconto — entra na 7ª). Regra de desconto por
  divulgação: **5% se parcela < R$ 1.000; 10% se ≥ R$ 1.000**, percentual **sempre informado no
  pedido** (varia). Os valores finais descontados vão em `total`/`mensal`; narração complexa vai em
  `setimaCustom`.
- **API** (`api: true`): entra no objeto (item ii), na PI, na mora, e como **segunda tabela separada**
  na 6ª. Cobrança: `apiModelo: 'combinado'` (padrão recente — soma num boleto único, ex.: Londrina) ou
  `'distintos'` (boletos separados, ex.: Corinthians).
- **Pagamento** (`metodo`): `boleto` (dia 10 típico) ou `pix` (bloco de dados bancários + NF + dia 25).
- **Parcelas** (`scripts/parcelas.py`): `ciclo` (dia a dia, ex.: 25/08 a 24/09) ou `calendario`
  (mês cheio). Escolher pela convenção do pedido/modelo.

## Validações que evitam erro

1. **Dados cadastrais do pedido são rascunho.** CNPJ costuma vir de filial; endereço diverge. Liste
   razão social, CNPJ e endereço para o usuário confirmar.
2. **Representante legal:** se faltar, placeholder `[REPRESENTANTE LEGAL — nome, qualificação, CPF]`.
   Situações especiais entram no nome (ex.: "– Em Recuperação Judicial").
3. **Perfil ambíguo:** como Scout Basic/Essential/Elite existem nos dois perfis, se o pedido não
   deixar claro clube vs agente, **pare e pergunte**.
4. **Nome de plano de geração anterior** (Brasil/Latam/Global ou Single/Starter/Growth/Pro/Prime):
   **não converter em silêncio** — sugerir o nome Scout (ver mapa em `planos.md`) e pedir confirmação.
5. **Coerência de valores:** Mensal × 12 ≈ Total? Se não bater (desconto, licença grátis, divulgação),
   perguntar, não assumir.
6. **Licenças gratuitas:** refletir em "Licenças Contempladas".
7. **Foro divergente:** cliente grande costuma impor foro — perguntar antes de assumir Porto Alegre.

## Geração do .docx (gerador consolidado)

`scripts/gerar_contrato.js` embute todo o acabamento: cabeçalho com logo, rodapé com metadados,
numeração dinâmica das cláusulas (divulgação `simples` é standalone e desloca as seguintes — o gerador
cuida disso), tabela de features (clube condensada; agente agrupada por seções), tabela de API
separada, PIX com dados bancários, e página exclusiva de assinaturas.

Campos do JSON: `perfil` · `robusta`(bool) · `cliente` · `cnpj` · `endereco` · `repLegal?` · `plano`
("Scout Essential") · `api`(bool) · `apiValorTexto?` · `apiModelo`('combinado'|'distintos') ·
`pagamento`('parcelado'|'vista') · `metodo`('boleto'|'pix') · `total` · `mensal` · `mensalApi?` ·
`mensalSoftware?` · `licAdicional` · `diaVenc` · `primeiroVenc` · `vencAvista?` · `vigIni` · `vigFim` ·
`divulgacao`('nenhuma'|'simples'|'obrigacao') · `postDivulgacao?` · `setimaCustom?` · `multaTexto` ·
`foro` · `local` · `features`(lista `[rótulo,valor]`; seção = `['#','CAPACIDADE']`) · `parcelas`.

A `features` do agente usa marcadores de seção `['#','CAPACIDADE']`, `['#','MINHA AGÊNCIA']`,
`['#','BASE DE ATLETAS']`, `['#','MERCADO']` conforme `features.md`.

## Revisão e ajuste

Ao entregar, sempre um bloco **"pontos que variaram / confira antes de assinar"**: plano, licenças,
valores, forma de pagamento e 1º vencimento, multa, foro, dados cadastrais, representante legal. O
contrato sai para revisão humana, nunca direto para assinatura.

## Arquivos da skill

- `references/clausulas.md` — cláusulas, fixo/variável/opcional; enxuta (padrão) vs robusta (opção).
- `references/features.md` — rótulos das features (clube condensado; agente agrupado) + API.
- `references/planos.md` — configuração por plano + linha Scout + mapa de nomenclatura (3 camadas).
- `scripts/parse_pedido.py` — extrai campos do pedido .xlsx.
- `scripts/parcelas.py` — tabela de 12 parcelas (`calendario`/`ciclo`).
- `scripts/gerar_contrato.js` — gerador consolidado do .docx.
- `assets/footlink-logo.png` — logo do cabeçalho (mestre é o SVG; regerar o PNG se mudar).

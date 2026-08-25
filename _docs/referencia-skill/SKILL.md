---
name: footlink-contract
description: >
  Gera contratos de licença de uso do software Footlink (produto SaaS da Footure) a partir de um
  Pedido de Venda. Use SEMPRE que o usuário enviar um pedido de venda do Footlink (.xlsx ou os dados
  soltos) e pedir para elaborar, montar, gerar, redigir ou "fazer o contrato" de um clube ou de um
  agente/agência. Vale também quando o pedido não usa a palavra "contrato" mas descreve o mesmo
  resultado: transformar as informações de uma venda do Footlink (perfil clube/agente, plano,
  licenças, valores, forma de pagamento) no instrumento particular de licença de uso pronto para
  assinatura. Cobre clubes (planos Starter/Basic/Essential/Elite/Multi-Club) e agentes
  (Single/Starter/Growth/Pro/Prime), com ou sem API, à vista ou parcelado. Entrega .docx.
license: Proprietary.
---

# Gerador de contratos Footlink

Transforma um **Pedido de Venda** do Footlink em um **contrato .docx** pronto para revisão e assinatura.

A CONTRATADA é sempre a mesma (Footure). O que muda a cada contrato é: perfil do cliente
(clube ou agente), escopo (Assinatura Footlink e/ou API), plano, licenças, valores, forma de
pagamento (à vista ou parcelado) e alguns blocos jurídicos negociáveis. O resto é fixo.

## Fluxo (siga em ordem)

1. **Ler o pedido.** Se vier um `.xlsx`, rode `python scripts/parse_pedido.py <arquivo>` para extrair
   os campos. Se vierem dados soltos no chat, colete os mesmos campos (lista em "Campos do pedido").
2. **Normalizar e validar** (ver "Validações que evitam erro" — esta etapa é o que separa um contrato
   correto de um errado com aparência de certo). Faça as perguntas necessárias ANTES de gerar.
3. **Montar o contrato** combinando: esqueleto fixo + linhagem do perfil + variações do pedido
   (ver `references/clausulas.md`) + tabela de features (ver `references/features.md` × `references/planos.md`).
4. **Gerar o .docx** seguindo a skill `docx` (leia `/mnt/skills/public/docx/SKILL.md` antes de escrever
   qualquer código de geração). Salve em `/mnt/user-data/outputs/`.
5. **Renderizar e conferir** (converter para imagem e ler — ver skill docx). Cheque valores, datas,
   plano, foro, multa.
6. **Enviar para revisão** com `present_files` + um **resumo dos pontos que variaram** e uma lista
   explícita do que precisa de conferência humana (dados cadastrais, representante legal, multa).
7. **Ajustar** conforme o retorno do usuário e repetir 4–6 até ele aprovar a versão final.

## Campos do pedido (o que a venda fornece)

Perfil (clube/agente) · Produtos Contratados (Assinatura Footlink / + API) · Licenças Pagas ·
Licenças Gratuitas · Plano Contratado · Forma de Pagamento · Valor Mensal · Valor Total do Contrato ·
Valor para Licenças Adicionais · Data do primeiro pagamento · Dia para pagamento recorrente ·
Cliente divulgará parceria? (S/N) · Condição especial · dados cadastrais (razão social, CNPJ, endereço).

## Decisões fixas (não perguntar, já definido)

- **Saída: .docx.**
- **CONTRATADA fixa:** Footure (dados em `references/clausulas.md`), representada por Emílio César dos
  Santos Fialho (+ Eduardo Robaina Dias quando o modelo do cliente pedir dois representantes).
- **Base de CLUBE = linhagem robusta** (SLA 98%, garantia de features, LGPD reforçada, compliance).
  **LGPD reforçada é padrão em clube** — o produto trata dados de atletas menores de idade; não omitir.
- **Base de AGENTE = linhagem Elenko** (obrigação financeira integral 12 meses; multa 3 mensalidades).
- **Planos de agente vigentes:** Single/Starter/Growth/Pro/Prime. LATAM/GLOBAL = legado → confirmar
  equivalente antes de gerar.
- **Juros de mora (default):** 1% a.m. + multa 2% + IGPM-FGV.
- **Foro (default):** Porto Alegre/RS. Só muda se o cliente impuser.

## Variáveis que vêm do pedido ou de pergunta

- **Multa de rescisão** é **negociável**, não fixa. Default parcelado = 3 mensalidades; à vista =
  regra do pedido. São Paulo negociou **zero**. Se o pedido não disser, use o default e **sinalize
  na revisão** que a multa é um ponto a confirmar.
- **Divulgação de parceria:** cláusula de redes sociais só entra se o pedido disser "Sim".
- **API:** só entra no objeto e na Cláusula Sexta se o produto contratado incluir API.
- **Convenção da tabela de parcelas:** default `calendario` (padrão Goiás/2026); use `ciclo` só se
  o modelo do cliente exigir (Corinthians). Gere com `scripts/parcelas.py`.

## Validações que evitam erro (fazer sempre)

1. **Dados cadastrais do pedido são rascunho, não verdade.** Nos casos reais o CNPJ do pedido veio de
   filial e o endereço divergia do contrato final (São Paulo: pedido trouxe filial de Cotia; contrato
   usou a matriz do Morumbi). **Sempre liste razão social, CNPJ e endereço para o usuário confirmar**
   antes de fechar. Não confie cegamente.
2. **Representante legal do cliente:** o pedido raramente traz. Se faltar, insira placeholder
   `[REPRESENTANTE LEGAL — nome, qualificação, CPF]` e avise.
3. **Plano legado (agente):** se vier "Brasil"/"Latam"/"Global", **não converter em silêncio** —
   sugerir o plano novo correspondente (Brasil→Starter, Latam→Pro, Global→Prime) e **pedir
   confirmação** antes de gerar. O contrato sempre usa o nome novo. Nome legado fora do mapa: parar
   e perguntar. (Growth e Single são planos novos, sem legado.)
4. **Coerência de valores:** confira Valor Mensal × 12 ≈ Valor Total (parcelado). Se não bater
   (descontos, licença grátis, condição especial), pergunte em vez de assumir. Ex.: Barra FC teve 10%
   à vista + licença grátis — o total não é mensal×12.
5. **Licenças gratuitas:** se houver, refletir no item "Licenças Contempladas" (ex.: "20 licenças +
   01 licença Feminino gratuita").
6. **Forma de pagamento:** "Boleto"/"Pix"/"à vista" muda as Cláusulas Sétima, Oitava e a multa.
   Parcelado → tabela de 12 parcelas. À vista → parcela única, sem tabela.
7. **Foro divergente:** se o cliente for grande e tiver histórico de impor foro (São Paulo, Corinthians),
   pergunte antes de assumir Porto Alegre.

## Montagem do contrato

Leia `references/clausulas.md` para o texto-base e o que é fixo/variável/opcional por cláusula.
Leia `references/features.md` (rótulos) e `references/planos.md` (valores por plano) para a Cláusula Sexta.

Estrutura (numeração renumera se uma cláusula opcional for omitida):
Título → Partes → 1ª Objeto (+API) → 2ª PI → 3ª-5ª Suporte (SLA) → 6ª Preço/Licenças (tabela features) →
7ª Valor → 8ª Pagamento (+tabela parcelas) → 9ª Mora → 10ª Divulgação (se Sim) →
Vigência/Rescisão (multa) → Confidencialidade (+LGPD reforçada em clube) → Disposições Gerais
(+compliance/não-vínculo/estatuto se aplicável) → Foro → Fechamento/assinaturas.

## Geração do .docx

A geração é feita pelo gerador consolidado `scripts/gerar_contrato.js`, que já embute todo o
acabamento padrão: cabeçalho com o logo Footlink (`assets/footlink-logo.png`, alinhado à esquerda),
rodapé com título + razão social do contratante + início da vigência em todas as páginas, bloco LGPD
reforçado nos contratos de clube, e **página exclusiva de assinaturas** (aberta pela frase de fecho
padrão da Footure, com blocos Contratante/Contratada e duas testemunhas alinhadas).

Fluxo: monte um objeto de dados normalizado (JSON) e rode
`node scripts/gerar_contrato.js <dados.json> <saida.docx>`. Salve a saída em `/mnt/user-data/outputs/`
com nome `{CLIENTE}_Footlink_Contrato_{PLANO}_{PAGAMENTO}.docx`. Depois **renderize e confira**
(converter para imagem e ler — ver skill docx).

Campos do JSON de dados (montados a partir do pedido + referências):
`perfil` (clube/agente) · `cliente` · `cnpj` · `endereco` · `repLegal` (opcional) · `plano` ·
`api` (bool) · `pagamento` (parcelado/vista) · `total` · `mensal` · `licAdicional` · `diaVenc` ·
`primeiroVenc` · `vencAvista` (se à vista) · `vigIni` · `vigFim` · `divulga` (bool) · `foro` ·
`multaTexto` (texto da multa negociada) · `local` · `features` (lista [rótulo, valor]) ·
`parcelas` (lista [n, mês, período, vencimento], de `scripts/parcelas.py`).

O gerador escolhe a linhagem pelo campo `perfil`: **clube** → SLA 98%, garantia de features (1ª §1º),
canais de suporte, LGPD reforçada; **agente** → SLA "mais elevado possível", §1º de obrigação
financeira integral, LGPD condensada. Não é preciso montar essas diferenças à mão.

Se precisar de ajuste pontual de texto que o gerador não cobre, gere o .docx e edite pelo método de
edição da skill docx (unzip → editar `word/document.xml` → zip).

## Revisão e ajuste

Ao entregar, escreva um bloco curto de **"pontos que variaram / confira antes de assinar"**:
plano e licenças, valor total e mensal, forma de pagamento e 1º vencimento, multa de rescisão,
foro, dados cadastrais do cliente, representante legal. Isso é obrigatório — o contrato sai para
revisão humana, não direto para assinatura. Depois, itere conforme o retorno.

## Arquivos da skill

- `references/clausulas.md` — texto-base das cláusulas, fixo/variável/opcional, por perfil.
- `references/features.md` — rótulos literais das features (coluna esquerda da Cláusula Sexta).
- `references/planos.md` — valores por plano (coluna direita) + mapa de nomenclatura.
- `scripts/parse_pedido.py` — extrai campos do pedido de venda .xlsx.
- `scripts/parcelas.py` — gera a tabela de 12 parcelas (convenções `calendario`/`ciclo`).
- `scripts/gerar_contrato.js` — gerador consolidado do .docx (clube/agente, à vista/parcelado,
  com/sem API), com todo o acabamento padrão embutido.
- `assets/footlink-logo.png` — logo para o cabeçalho (mestre é o SVG do cliente; regerar o PNG a
  partir dele se o logo mudar).

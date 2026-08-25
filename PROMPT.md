# Prompt — Sistema de Fechamento de Venda Footlink

> **Como usar este documento:** cole-o como instrução inicial do projeto no Claude dentro do Google
> Antigravity. Ele especifica o sistema inteiro em 3 fases. Construa a **Fase 1 completa e funcional**
> primeiro; deixe as **portas** (interfaces/stubs documentados) prontas para as Fases 2 e 3, mas não
> as implemente até a Fase 1 estar validada.
>
> **Material de apoio (já no projeto, em `_docs/`):**
> - `_docs/referencia-skill/scripts/gerar_contrato.js` — gerador do contrato .docx. **Portar** para
>   uma API route do Next (ex.: `app/api/contratos/gerar/route.ts`), mantendo a lógica intacta.
> - `_docs/referencia-skill/scripts/parcelas.py` — lógica das parcelas (convenções calendário/ciclo).
>   **Re-implementar em TypeScript** (o projeto é 100% TS; não rodar Python).
> - `_docs/referencia-skill/references/{clausulas,features,planos}.md` — fonte da verdade do texto das
>   cláusulas, dos rótulos de features e dos valores por plano + mapa de nomenclatura legada.
>   **Atualização (execução da Fase 1):** `features.md`/`planos.md` divergem entre si para AGENTE —
>   `planos.md` tem uma linha "Análise de Mercado" que não existe em contrato nenhum e não lista
>   "Número de Atletas"/"Atletas Agenciados"/"Agências", que `features.md` tem. Reconciliado contra o
>   texto real dos 4 `.docx`-modelo (ELENKO confirma 15 linhas para agente, não 13). A partir de agora
>   `src/lib/contratos/planos.ts` é a fonte da verdade operante — ver o comentário no topo do arquivo.
> - `_docs/referencia-skill/assets/footlink-logo.png` — logo do cabeçalho.
> - `_docs/referencia-skill/SKILL.md` — regras de negócio (ler para entender; não virar código do app).
> - `_docs/contratos-modelo/*.docx` — 4 contratos-gabarito para validar a geração (ver seção 10).

---

## 1. Contexto e objetivo

A Footure vende licenças do software **Footlink** (SaaS de gestão de atletas de futebol) para dois
perfis de cliente: **clubes** e **agentes/agências**. Hoje o processo é manual: o vendedor preenche
uma planilha de pedido de venda, alguém gera o contrato no Word a partir de modelos, revisa, e envia
para assinatura. Já existe uma **skill de geração de contrato** (`footlink-contract`) que transforma
os dados de um pedido em um `.docx` pronto — ela é o núcleo reaproveitado aqui.

O objetivo é um **sistema web** que substitui a planilha por um formulário, orquestra o fluxo de
aprovação com humanos em pontos-chave, gera o contrato automaticamente, e (em fases seguintes) integra
com o ERP Bling, controla comissionamento e dispara o contrato para assinatura eletrônica.

**Princípio inegociável:** nenhuma etapa crítica é automática sem aprovação humana. Todas as
validações que hoje um humano faria (dados cadastrais divergentes, plano legado, valores que não
fecham, foro) são **pontos de pausa para revisão**, não regras que seguem sozinhas.

## 2. Stack

- **Frontend/Backend:** Next.js (App Router) + TypeScript. API routes para a lógica de servidor.
- **Banco/Auth/Storage:** Supabase (Postgres, Supabase Auth, Supabase Storage).
- **Deploy:** Vercel.
- **Geração de .docx:** biblioteca `docx` (JS) — o gerador já existe em
  `scripts/gerar_contrato.js` e deve ser portado para uma API route/serviço, sem reescrever a lógica.
- Sem planilhas: o pedido de venda vira formulário; os dados entram estruturados no Postgres.

## 3. Papéis e permissões

Três papéis (Supabase Auth + RLS por papel):

- **Vendedor:** cria e edita os próprios pedidos de venda; acompanha o status; vê a própria comissão.
- **Jurídico:** revisa o contrato gerado (baixa, edita, sobe nova versão); dispara para assinatura;
  vê todos os pedidos.
- **Admin:** aprova pedidos antes da geração do contrato; configura regras de comissão e parâmetros;
  acesso total; gerencia usuários.

Aplique Row Level Security no Supabase para que vendedor só enxergue os próprios pedidos, e
jurídico/admin enxerguem todos.

## 4. Máquina de estados do pedido (fluxo aprovado)

```
RASCUNHO
  → (vendedor preenche e envia)        → EM_APROVACAO
  → (admin aprova)                     → APROVADO
  → (sistema gera contrato,            → EM_REVISAO_JURIDICA
     automático e imediato)
  → (jurídico revisa/edita/sobe,       → EM_REVISAO_JURIDICA
     repete quantas vezes precisar)       (permanece no mesmo estado)
  → (jurídico ou admin libera)         → PRONTO_PARA_ASSINATURA
  → (dispara Clicksign — Fase 3)       → ENVIADO_PARA_ASSINATURA
  → (webhook Clicksign confirma)       → ASSINADO
  → (fechamento)                       → CONCLUIDO
```

**`APROVADO` continua existindo como status real e auditável — só não tem fila/tela própria.**
Assim que o admin aprova, o sistema grava a transição `EM_APROVACAO → APROVADO` (dispara a
integração com o Bling, seção 7.1) e, na sequência, dentro da mesma ação, tenta gerar o contrato e
grava `APROVADO → EM_REVISAO_JURIDICA`. Do ponto de vista de quem usa o sistema isso é instantâneo —
não existe uma tela para "aprovar" e depois outra ação humana para "agora gera o contrato". Mas se a
geração do `.docx` falhar (erro no gerador, dado faltando), o pedido **fica parado em `APROVADO`**,
visível com um indicador de erro e um botão "tentar gerar novamente" — não é descartado nem volta
sozinho para `EM_APROVACAO`.

Dentro de `EM_REVISAO_JURIDICA`, jurídico pode baixar, editar e subir nova versão quantas vezes for
necessário — isso **não** gera novas transições de estado (o pedido permanece em
`EM_REVISAO_JURIDICA`), só novas linhas em `contratos` (versão N+1, nunca sobrescreve).

Regras de transição:
- Admin pode **reprovar** em EM_APROVACAO → volta a RASCUNHO com comentário.
- Jurídico ou admin libera `EM_REVISAO_JURIDICA` → `PRONTO_PARA_ASSINATURA` quando o contrato estiver
  aprovado internamente. **Trava obrigatória (bloqueante, não é alerta revisável):** essa transição só
  é permitida se o pedido tiver **pelo menos um representante legal do CONTRATANTE** cadastrado com
  nome completo, e-mail e CPF preenchidos (ver seção 6.1 "Signatários"). Sem isso, o sistema impede a
  liberação — não há fluxo de assinatura possível sem um destinatário para notificar.
- Se o jurídico identificar um problema que exige refazer o contrato do zero (não só editar o .docx),
  pode **rejeitar** e o pedido volta a `APROVADO`, o que dispara nova geração automática (nova versão)
  e retorno imediato a `EM_REVISAO_JURIDICA`.
- Toda transição registra: quem, quando, de/para, comentário. Trilha de auditoria imutável.
- Antes da Fase 3, o estado para em PRONTO_PARA_ASSINATURA e a assinatura é feita manualmente fora do
  sistema (deixe o botão "Enviar para assinatura" como stub que só muda o estado e registra).

## 5. Modelo de dados (Postgres/Supabase)

Tabelas mínimas (ajuste tipos conforme necessário):

- **users** (via Supabase Auth) + **profiles** (user_id, nome, papel: vendedor|juridico|admin).
- **clientes** (id, tipo: clube|agente, razao_social, cnpj, endereco, foro_preferencial). Dados
  cadastrais ficam aqui e são reutilizáveis entre pedidos. Representante(s) legal(is) do cliente NÃO
  ficam mais aqui como campos singulares — viraram a tabela `signatarios_cliente` abaixo (um cliente
  pode ter mais de um representante legal e mais de uma testemunha ao longo do tempo).
- **signatarios_cliente** (id, cliente_id, tipo: representante_legal|testemunha, nome_completo,
  email, cpf, criado_em). Cadastro reutilizável por cliente — alimenta o autocomplete/seleção na hora
  de montar um pedido, mas pode ser criado direto no formulário do pedido (e fica salvo aqui para o
  próximo pedido do mesmo cliente).
- **pedido_signatarios** (id, pedido_id, signatario_cliente_id, tipo: representante_legal|testemunha).
  Define quais signatários do cliente valem para ESTE pedido — um pedido pode ter N representantes
  legais e N testemunhas do lado do cliente.
- **representantes_footure** (id, nome, cargo, email, cpf, ativo). Lookup fixo, não editável pelo
  usuário comum — seed inicial: Emílio César dos Santos Fialho e Eduardo Robaina Dias.
- **pedido_representantes_footure** (id, pedido_id, representante_footure_id). Um pedido pode
  selecionar Emílio, Eduardo, ou os dois como representantes da CONTRATADA.
- **pedido_testemunhas_footure** (id, pedido_id, nome_completo, email, cpf). Testemunhas do lado
  Footure são específicas de cada pedido (N por pedido), não um cadastro reutilizável como as do
  cliente.
- **pedidos** (id, cliente_id, vendedor_id, status, perfil, produtos[] {footlink, api},
  plano, licencas_pagas, licencas_gratuitas, forma_pagamento: avista|parcelado, valor_mensal,
  valor_total, valor_licenca_adicional, valor_mensal_api, valor_mensal_software, primeiro_pagamento,
  dia_vencimento, convencao_parcelas: calendario|ciclo, vigencia_inicio, vigencia_fim,
  divulga_parceria: bool, multa_tipo, multa_texto, foro, condicao_especial, plano_legado_detectado,
  plano_legado_nome_original, geracao_contrato_erro, bling_pedido_id, criado_em, atualizado_em).
  `geracao_contrato_erro` guarda a mensagem de erro quando a geração automática falha (ver trava de
  `APROVADO` na seção 4) — fica NULL no caminho feliz. `local` da assinatura NÃO é
  campo — é sempre fixo "Porto Alegre/RS" (sede da Footure), hardcoded no gerador.
- **contratos** (id, pedido_id, versao, arquivo_path (Storage), gerado_em, gerado_por, motivo_versao,
  status_revisao). Cada edição do jurídico cria nova versão (não sobrescreve); `motivo_versao` guarda
  por que essa versão nova foi criada (texto livre do jurídico).
- **transicoes** (id, pedido_id, de, para, ator_id, comentario, criado_em) — auditoria.
- **regras_comissao** (id, ativo, percentual, base_calculo: valor_total|valor_recebido,
  escopo_tipo: global|por_vendedor|por_plano|por_pagamento, escopo_valor, vigencia_inicio) — Fase 2.
- **comissoes** (id, pedido_id, vendedor_id, regra_id, base, percentual, valor_calculado,
  status: previsto|confirmado|pago, criado_em) — Fase 2.
- **integracoes_bling** / **integracoes_clicksign** (tokens OAuth, refresh, config) — Fases 2 e 3.

## 6. FASE 1 — Núcleo (construir completo e funcional)

### 6.1 Formulário de pedido de venda
Reproduz exatamente os campos que a planilha capturava (a skill os lista). Campos, com validação
client + server:

- **Perfil:** clube | agente (define a linhagem do contrato).
- **Cliente:** selecionar existente ou cadastrar novo (razão social, CNPJ, endereço). **Importante:**
  os dados do cliente são editáveis no momento do pedido — historicamente o dado do pedido diverge do
  cadastro correto (CNPJ de filial vs. matriz). O sistema deve permitir corrigir e destacar que esses
  dados vão para o contrato.
- **Signatários do cliente:** N representantes legais + N testemunhas, cada um com nome completo,
  e-mail e CPF. Selecionáveis a partir do histórico do cliente (`signatarios_cliente`) ou cadastráveis
  na hora — o que for criado aqui fica salvo no cliente para reaproveitar em pedidos futuros. Pelo
  menos um representante legal é **obrigatório** para o pedido poder ser liberado para assinatura
  (ver trava na seção 4/6.5) — mas não bloqueia o envio para aprovação nem a geração do contrato,
  só a etapa de liberação.
- **Representante(s) da Footure (CONTRATADA):** selecionar Emílio, Eduardo, ou os dois (lookup fixo,
  não é texto livre).
- **Testemunhas da Footure:** N testemunhas específicas deste pedido (nome completo, e-mail, CPF).
- **Vigência do contrato:** data de início e data de fim, ambas editáveis no formulário (a data de fim
  sugerida automaticamente como início + 12 meses, mas o vendedor pode ajustar — cobre tanto o caso de
  datas fixas acordadas com o cliente quanto o caso padrão).
- **Produtos contratados:** Assinatura Footlink (sempre) + API (opcional). Se API, exibir campos de
  valor da API e valor do software separadamente — **a discriminação dos dois valores no contrato é
  obrigatória sempre que há API, independentemente da forma de pagamento** (à vista ou parcelado).
- **Plano:** dropdown que depende do perfil.
  - Clube: Starter, Basic, Essential, Elite, Multi-Club (+ Feminino como licença especial).
  - Agente: Single, Starter, Growth, Pro, Prime.
- **Nomenclatura legada (regra crítica):** se o vendedor digitar/importar um nome legado de agente
  ("Brasil", "Latam", "Global"), o sistema **não converte sozinho**. Mostra um aviso sugerindo o
  plano novo correspondente (Brasil→Starter, Latam→Pro, Global→Prime) e **exige confirmação** antes
  de prosseguir. O contrato sempre usa o nome novo. Growth e Single não têm equivalente legado.
- **Licenças:** pagas (número) + gratuitas (número, ex.: Feminino).
- **Forma de pagamento:** à vista | parcelado (12x).
- **Valores:** valor mensal, valor total, valor de licença adicional. Se API: valor mensal da API +
  valor mensal do software.
- **Datas:** primeiro pagamento, dia de vencimento recorrente, convenção de parcelas
  (calendário | ciclo — default calendário).
- **Multa de rescisão:** parâmetro negociável. Opções: sem multa | 2 mensalidades | 3 mensalidades
  (default parcelado) | retenção total (default à vista) | texto customizado. Guardar o texto final.
  O texto de "2 mensalidades" segue o mesmo padrão do texto de "3 mensalidades" (ver
  `references/clausulas.md`), só trocando o numeral ("02 (duas)" no lugar de "03 (três)") — não existe
  contrato-modelo real com essa opção, é construído por analogia.
- **Divulgação de parceria:** sim | não (controla a cláusula de redes sociais).
- **Foro:** default Porto Alegre/RS; editável se o cliente impuser.
- **Condição especial:** texto livre.

### 6.2 Validações (pontos de atenção, exibidos ao humano — não bloqueiam sozinhas)
Implemente como **alertas revisáveis**, não travas automáticas — com **uma única exceção dura**
(item 7, abaixo), que é bloqueante por necessidade técnica (sem e-mail não há para quem enviar a
assinatura), não por julgamento de negócio:
1. Dados cadastrais do cliente conferidos? (destacar CNPJ/endereço para revisão).
2. Representante legal preenchido? Se faltar, avisar e permitir prosseguir sem ele até a etapa de
   aprovação/geração — mas ver item 7 para o momento em que isso passa a bloquear.
3. Plano legado detectado → exige confirmação (ver acima).
4. Coerência de valores: valor_mensal × 12 ≈ valor_total? Se divergir (desconto, licença grátis,
   condição especial), destacar e pedir ciência do aprovador — não recalcular sozinho.
5. Licenças gratuitas refletidas no texto de "Licenças Contempladas".
6. Foro divergente do default → destacar.
7. **(Trava dura, não é alerta)** Ao tentar liberar o pedido de `EM_REVISAO_JURIDICA` para
   `PRONTO_PARA_ASSINATURA`: precisa existir pelo menos um `signatario_cliente` do tipo
   `representante_legal` vinculado ao pedido, com e-mail e CPF preenchidos. Sem isso, o botão de
   liberação fica desabilitado com a mensagem explicando o motivo.

### 6.3 Aprovação (admin)
Tela do admin lista pedidos EM_APROVACAO com todos os dados + os alertas da 6.2. Admin aprova
(→ APROVADO) ou reprova com comentário (→ RASCUNHO).

### 6.4 Geração do contrato
Ao aprovar, o sistema monta o objeto de dados normalizado e chama o gerador (porte de
`scripts/gerar_contrato.js` para uma API route), **na mesma transição que já leva o pedido direto a
`EM_REVISAO_JURIDICA`** (não existe parada intermediária — ver seção 4). O gerador já sabe:
- escolher a linhagem por perfil (clube = robusta com SLA 98%, garantia de features, LGPD reforçada
  controladora/operadora; agente = enxuta com obrigação financeira integral);
- montar a Cláusula Sexta (features) a partir de `references/features.md` (rótulos) ×
  `references/planos.md` (valores por plano);
- gerar tabela de parcelas (parcelado) ou parcela única (à vista);
- discriminar valor composto e boletos distintos quando houver API — **tanto no parcelado quanto no
  à vista** (o script original só discrimina no parcelado; a versão à vista com API discriminada não
  existe em nenhum contrato-modelo e precisa de texto novo, análogo ao padrão Corinthians, adaptado
  para parcela única — **validar esse texto com jurídico antes de usar em produção**, já que não há
  contrato assinado real para conferir);
- aplicar cabeçalho com logo, rodapé com metadados, página exclusiva de assinaturas;
- multa conforme o parâmetro do pedido; foro; divulgação condicional.

**Bloco de assinaturas — isso não é mera parametrização do script original.** O
`gerar_contrato.js` atual tem uma linha fixa de CONTRATANTE, uma de CONTRATADA e uma tabela fixa de
exatamente 2 testemunhas lado a lado. Com N representantes legais e N testemunhas por lado (seção
6.1), esse bloco precisa de lógica nova: uma linha de assinatura por representante do cliente, uma
por representante Footure selecionado (Emílio e/ou Eduardo), e uma célula de testemunha por
testemunha cadastrada (cliente + Footure). Trate esse bloco como código novo a escrever, não como
"portar sem reescrever".

As cláusulas opcionais descritas em `references/clausulas.md` mas ausentes do `gerar_contrato.js`
atual (compliance, não-vínculo, estatuto, DPA estendida tipo Corinthians cláusula 21ª) ficam **fora
do escopo da Fase 1** — o script é portado como está para essas cláusulas.

O `.docx` é salvo no Supabase Storage; cria registro em `contratos` (versão 1); estado →
`EM_REVISAO_JURIDICA`.

> **Fidelidade obrigatória:** o contrato gerado deve reproduzir os modelos reais. A skill já foi
> validada contra 4 contratos assinados (Goiás/clube parcelado, Elenko/agente, Bragantino/à vista,
> Corinthians/API). Não altere o texto das cláusulas ao portar — só parametrize. Exceção: o bloco de
> assinaturas (N signatários) e a variação à vista+API, descritos acima, que exigem lógica nova.

### 6.5 Revisão jurídica (contrato editável)
O pedido já chega em `EM_REVISAO_JURIDICA` assim que o contrato é gerado (seção 6.4) — não é uma
transição separada que o jurídico precisa disparar. A partir daí, jurídico baixa o `.docx`, edita
fora do sistema (precisa validar com o cliente), e **sobe nova versão** quantas vezes for necessário
(cria `contratos` versão N+1 a cada upload, preserva as anteriores, guarda `motivo_versao`) — o
pedido permanece em `EM_REVISAO_JURIDICA` durante esse vai-e-vem, sem gerar novas transições de
estado. Quando aprovado internamente, jurídico/admin marca `PRONTO_PARA_ASSINATURA` — sujeito à
trava de representante legal (seção 6.2, item 7). Nesta fase, o envio para assinatura é manual
(stub).

### 6.6 Telas mínimas Fase 1
- Login (Supabase Auth) + roteamento por papel.
- Vendedor: lista de pedidos + formulário de novo/editar pedido + status.
- Admin: fila de aprovação + configurações + gestão de usuários.
- Jurídico: fila de contratos para revisão + upload de nova versão + histórico de versões.
- Detalhe do pedido: dados + linha do tempo (transições) + versões de contrato + alertas + signatários
  (representantes legais e testemunhas do cliente, representante(s) e testemunhas da Footure).
- Cadastro de cliente: além de razão social/CNPJ/endereço, gestão dos `signatarios_cliente`
  (adicionar/editar representantes legais e testemunhas reutilizáveis entre pedidos).

## 7. FASE 2 — Bling + Comissionamento (deixar portas na Fase 1)

### 7.1 Integração Bling (ERP)
- **API v3, OAuth 2.0.** Endpoint principal: `POST /pedidos/vendas`. Docs:
  https://developer.bling.com.br/ (autenticação, aplicativos, pedido de venda).
- Fluxo: quando o pedido chega a `APROVADO` (decidido — não é mais um ponto em aberto), o sistema cria
  o pedido de venda correspondente no Bling e guarda o ID retornado em `pedidos.bling_pedido_id`
  (campo já reservado na Fase 1, seção 5).
- Guardar tokens OAuth em `integracoes_bling` com refresh automático.
- **Porta na Fase 1:** uma função `criarPedidoBling(pedido)` como stub documentado, com o mapeamento
  de campos pedido→payload Bling esboçado, sem chamar a API ainda.

### 7.2 Comissionamento (no nosso sistema, não no Bling)
- Regra: **% sobre a venda, parametrizável.** Admin configura em `regras_comissao`: percentual, base
  de cálculo (valor total | valor recebido), e escopo (global, por vendedor, por plano, por forma de
  pagamento). Suporta múltiplas regras com vigência.
- Ao fechar um pedido, o sistema calcula a comissão aplicando a regra vigente e grava em `comissoes`
  (status previsto → confirmado → pago). **Controle de pagamento é manual nesta fase:** admin marca a
  comissão como paga manualmente (data + observação), sem integração automática com banco/Bling —
  não há conciliação automática de recebimento. O campo `base_calculo: valor_recebido` continua
  disponível como opção de regra, mas nesta fase o "valor recebido" é uma afirmação manual do admin,
  não um dado rastreado automaticamente pelo sistema (evolução futura, fora do escopo da Fase 2).
- Dashboard de comissão: vendedor vê a própria; admin vê todas, com filtros, totais e o status de
  pagamento (previsto/confirmado/pago) de cada uma, com ação para o admin alternar o status.
- **Default até o admin configurar:** 10% sobre valor total, escopo global — marcado como
  "parâmetro provisório, confirmar antes de produção".
- **Porta na Fase 1:** criar as tabelas e a tela de configuração (vazia/somente-admin) e a função de
  cálculo `calcularComissao(pedido, regras)` testável, sem exibir números em produção ainda.

## 8. FASE 3 — Assinatura eletrônica (Clicksign)

- **Ferramenta escolhida: Clicksign** (já usada pela Footure; API brasileira; autenticação por
  e-mail/WhatsApp/SMS/PIX; custo-benefício superior ao DocuSign para o volume). Docs:
  https://developer.clicksign.com/
- Fluxo: em PRONTO_PARA_ASSINATURA, jurídico/admin dispara → sistema envia o `.docx`/PDF final para a
  Clicksign, cria o envelope, adiciona signatários lendo `pedido_signatarios` (representantes legais +
  testemunhas do cliente), `pedido_representantes_footure` (Emílio e/ou Eduardo) e
  `pedido_testemunhas_footure` — cada um já com nome, e-mail e CPF prontos desde a Fase 1 (é por isso
  que a trava de representante legal da seção 6.2 existe: sem esses dados, não há como montar o
  envelope) — e move para ENVIADO_PARA_ASSINATURA.
- **Webhook:** receber eventos de assinatura da Clicksign; ao concluir, mover para ASSINADO e guardar
  o documento assinado + log no Storage.
- Guardar credenciais em `integracoes_clicksign`.
- **Porta na Fase 1:** função `enviarParaAssinatura(contrato)` como stub que só transiciona o estado
  e registra a intenção; endpoint de webhook criado mas inativo.

## 9. Ordem de execução para o Antigravity

1. Scaffold Next.js + TS + Supabase + Vercel; configurar Auth e as tabelas da seção 5.
2. Implementar papéis + RLS.
3. Formulário de pedido (6.1) + validações revisáveis (6.2).
4. Fluxo de estados (seção 4) + telas por papel (6.6) + auditoria.
5. Portar `gerar_contrato.js` para API route (6.4) + Storage + versionamento (6.5).
6. Testar Fase 1 ponta a ponta com os 4 casos reais (clube parcelado, agente, à vista, API) e
   comparar com os contratos-modelo antes de seguir.
7. Só então: Fase 2 (Bling + comissão), depois Fase 3 (Clicksign).

## 10. Critérios de aceite da Fase 1
- Vendedor cria um pedido de clube Essential parcelado e um de agente Pro; ambos passam pelo fluxo
  até `EM_REVISAO_JURIDICA` com a versão 1 do contrato já anexada.
- O `.docx` gerado reproduz fielmente os modelos validados (features corretas por plano, parcelas,
  multa, foro, LGPD reforçada em clube, página de assinatura, logo, rodapé).
- Plano legado "Latam" num pedido de agente dispara a confirmação antes de gerar.
- Divergência valor_mensal×12 ≠ valor_total gera alerta ao admin, sem recalcular sozinho.
- Jurídico consegue subir uma versão editada e o histórico preserva a anterior.
- Nenhuma transição crítica ocorre sem ação humana registrada na auditoria.
- Um vendedor não enxerga pedidos de outro vendedor (RLS); jurídico e admin enxergam todos.
- Admin reprova um pedido em EM_APROVACAO → volta a RASCUNHO com comentário visível ao vendedor.
- Um pedido sem nenhum representante legal do cliente cadastrado não consegue ser liberado para
  PRONTO_PARA_ASSINATURA — o botão fica bloqueado com mensagem explicativa.
- Um pedido com Emílio e Eduardo selecionados como representantes Footure mostra os dois blocos de
  assinatura da CONTRATADA no `.docx` gerado.
- Se a geração do contrato falhar após a aprovação, o pedido permanece visível em `APROVADO` com opção
  de tentar gerar novamente — não desaparece nem retorna sozinho para `EM_APROVACAO`.
```

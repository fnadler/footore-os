# Prompt — Normalização de Nomenclatura de Planos (pedido ↔ contrato) · Footlink

> **Objetivo:** garantir que o plano informado no **pedido de venda** corresponda exatamente ao plano
> impresso no **contrato**, mesmo quando o vendedor digitar um nome de geração anterior ou ambíguo.
> A garantia não vem de "traduzir texto" — vem de um **registro canônico único** que o formulário do
> pedido e o gerador de contrato consomem. Cole este prompt no Claude do Antigravity com o arquivo
> `plan-registry.json` (neste pacote) na raiz do projeto.

> **Arquivo-fonte:** `plan-registry.json` — a FONTE ÚNICA da verdade dos nomes de plano. Não
> hardcodar planos em outro lugar; tudo (dropdown do formulário, geração do contrato, importação de
> dados legados) lê deste registro.

---

## 1. Princípio (por que isto existe)

O nome do plano aparece em dois lugares que **precisam bater**: o seletor no formulário do pedido e a
Cláusula Sexta + o cabeçalho da tabela no contrato. Se cada um usar sua própria lista, divergem. A
solução: **uma key canônica** (ex.: `agente:scout-prime`) que:

- o **formulário** grava no pedido (nunca texto livre);
- o **gerador de contrato** recebe e usa para imprimir o nome (`printed`) e montar as features.

Assim a correspondência é estrutural, não depende de o texto ser digitado igual.

## 2. Regras invioláveis

1. **Chave = perfil + plano.** Os rótulos Basic, Essential e Elite existem em clube E agente, com
   configuração e preço diferentes. O plano isolado nunca identifica — sempre resolver com o perfil.
   Toda key é prefixada pelo perfil (`clube:` / `agente:`).
2. **O formulário grava a `key`, não o rótulo.** O dropdown mostra `canonical`; o banco guarda `key`.
   Isso elimina ambiguidade na origem.
3. **Nome de geração anterior nunca é convertido em silêncio.** Se a entrada casar com um `legado`, a
   normalização retorna `needs_confirmation` com a sugestão; um humano confirma antes de gerar.
4. **Ambiguidade é sempre `needs_confirmation`.** Em especial: para AGENTE, o termo **"prime"** sozinho
   é ambíguo — pode ser o atual **Scout Prime** ou o legado **Prime** (que virou **Scout Elite**).
   Só `scout prime` explícito resolve direto. Ver `_ambiguidade_prime` no registro.
5. **O contrato imprime `printed`** (ex.: "PLANO FOOTLINK SCOUT PRIME"). Nome legado nunca vai para o
   documento.

## 3. O que construir

### 3.1 Camada de normalização (`lib/plans/normalize.ts`)
Carrega `plan-registry.json` e expõe:

```ts
type NormalizeResult =
  | { status: "ok"; key: string; canonical: string; printed: string }
  | { status: "needs_confirmation"; candidates: {key:string;canonical:string}[]; reason: string }
  | { status: "unknown"; reason: string };

function normalizePlan(perfil: "clube"|"agente", raw: string): NormalizeResult;
```

Algoritmo (dentro do escopo do `perfil`):
1. Sanitizar `raw`: minúsculas, trim, remover "plano footlink" e espaços extras.
2. **Match exato** em `aliases_exatos` → `{status:"ok", ...}` — **exceto** se o termo estiver também
   em `ambiguous_bare` (ex.: "prime" no agente): então `needs_confirmation` com os candidatos
   (Scout Prime e Scout Elite).
3. **Match em `legado`** → `needs_confirmation` com o candidato sugerido (a key daquele plano), razão
   "nome de geração anterior".
4. Sem match → `unknown`.

### 3.2 Formulário do pedido (seletor de plano)
- O select de plano é populado do registro, **filtrado pelo `perfil`** já escolhido (perfil primeiro,
  depois plano). Mostra `canonical`; grava `key`.
- Não há digitação livre de plano no fluxo normal. `normalizePlan` serve para: importação de dados
  legados, migração de pedidos antigos, ou um campo de busca que aceite nome antigo — sempre passando
  por confirmação quando `needs_confirmation`.

### 3.3 Ponto de uso na geração
O gerador de contrato recebe a `key` do pedido, busca no registro `printed` (cabeçalho da tabela e
nome do plano) e usa a mesma `key` para indexar a configuração de features. Nenhuma conversão de texto
no momento de gerar.

## 4. Dados (resumo do `plan-registry.json`)

**Clube:** Scout Starter · Scout Basic · Scout Essential · Scout Elite · Scout Multi-Club (+ licença
especial Feminino). Assunção: só ganharam o prefixo Scout (ladder inalterado — confirmar).

**Agente:** Scout Single · Scout Basic · Scout Essential · Scout Prime · Scout Elite.
Mapa legado (→ atual), sempre com confirmação:
- Brasil → Scout Basic · Starter → Scout Basic
- Growth → Scout Essential
- Pro → Scout Prime · Latam → Scout Prime
- Prime → Scout Elite · Global → Scout Elite
- "prime" sozinho = **ambíguo** (Scout Prime vs Scout Elite) → confirmar.

## 5. Critérios de aceite

- `normalizePlan("agente","latam")` → needs_confirmation sugerindo `agente:scout-prime`.
- `normalizePlan("agente","prime")` → needs_confirmation com candidatos `agente:scout-prime` e
  `agente:scout-elite`.
- `normalizePlan("agente","scout prime")` → ok, `agente:scout-prime`.
- `normalizePlan("clube","essential")` → ok, `clube:scout-essential` (nunca resolve para agente).
- `normalizePlan("agente","growth")` → needs_confirmation sugerindo `agente:scout-essential`.
- Um pedido gravado com `key` gera contrato cujo cabeçalho é o `printed` correspondente — sem exceção.

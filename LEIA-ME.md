# Footlink — Sistema de Fechamento de Venda (pacote inicial p/ Antigravity)

Este pacote tem tudo que o `PROMPT.md` cita. Estrutura pensada para você **descompactar na raiz do
projeto** que vai criar no Google Antigravity.

## Onde salvar cada coisa

```
footlink-sistema/                 ← raiz do seu projeto no Antigravity
├── PROMPT.md                     ← cole o conteúdo dele como instrução inicial do Claude no Antigravity
└── _docs/                        ← material de apoio; NÃO é código do app, é referência p/ o Claude ler
    ├── referencia-skill/         ← a lógica de contrato que o sistema REUSA
    │   ├── SKILL.md              ← só para o Claude ENTENDER as regras (não virar código)
    │   ├── references/           ← cláusulas, features e planos: fonte da verdade do contrato
    │   │   ├── clausulas.md
    │   │   ├── features.md
    │   │   └── planos.md
    │   ├── scripts/
    │   │   ├── gerar_contrato.js ← PORTAR para uma API route do Next (núcleo da geração)
    │   │   └── parcelas.py       ← lógica das parcelas p/ RE-IMPLEMENTAR em TS (ver nota abaixo)
    │   └── assets/
    │       └── footlink-logo.png ← logo do cabeçalho do contrato
    └── contratos-modelo/         ← gabaritos: o que o sistema deve REPRODUZIR
        ├── GOIAS_...docx         (clube, Essential, parcelado)
        ├── ELENKO_...docx        (agente, Pro, parcelado)
        ├── BRAGANTINO_...docx    (clube, Elite, à vista)
        └── CORINTHIANS_...docx   (clube, Elite, com API)
```

## Como usar no Antigravity

1. Crie o projeto e descompacte este pacote na raiz.
2. Abra o `PROMPT.md` e use o conteúdo como instrução inicial do Claude no Antigravity.
3. Garanta que o Claude tenha acesso à pasta `_docs/` — ele vai ler as referências e os
   contratos-modelo para construir e validar a geração.

## Notas importantes (leia antes de rodar)

- **`_docs/` não é código do app.** É material de referência. O Claude do Antigravity vai construir o
  app Next.js do zero (seguindo o PROMPT) e usar `_docs/` como fonte. Não copie `_docs/` para dentro
  de `src/` — deixe como apoio.

- **`gerar_contrato.js` é o único script que vira código de verdade.** Ele deve ser portado para uma
  API route do Next (ex.: `app/api/contratos/gerar/route.ts`), mantendo a lógica das cláusulas
  intacta. É JS puro com a lib `docx`; adapta bem para TS.

- **`parcelas.py` é Python — NÃO vai para o projeto como está.** Está aqui só para o Claude ver a
  lógica das duas convenções de parcela (calendário/ciclo) e **re-implementá-la em TypeScript**. O
  projeto é 100% TS; não haverá Python rodando.

- **`parse_pedido.py` foi deixado de fora de propósito.** Ele lia a planilha .xlsx do processo antigo,
  que o sistema elimina (o pedido vira formulário). Não é necessário e só confundiria.

- **`SKILL.md` é instrução para o Claude do chat, não para o sistema.** Serve para o Claude do
  Antigravity entender as regras de negócio (linhagens, validações, mapa de planos legados). Não deve
  virar arquivo do app.

- **Os contratos-modelo são os gabaritos de aceite.** Depois de portar o gerador, gere os mesmos 4
  casos pelo sistema e compare com estes .docx. Se baterem, a Fase 1 do módulo de contrato está
  correta. Estão listados na seção 10 do PROMPT (critérios de aceite).

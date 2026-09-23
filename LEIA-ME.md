# Pacote — Módulo de Geração de Contrato Footlink (para o Antigravity)

Descompacte na raiz do projeto que você está construindo no Antigravity.

```
footlink-contrato-antigravity/
├── PROMPT_GERACAO_CONTRATO.md   ← cole o conteúdo como instrução do Claude no Antigravity
├── LEIA-ME.md                    ← este arquivo
├── _skill/                       ← FONTE DA VERDADE (referência; não é código do app)
│   ├── SKILL.md                  ← regras gerais (ler para entender)
│   ├── references/               ← cláusulas, features, planos (viram dados/constantes)
│   │   ├── clausulas.md
│   │   ├── features.md
│   │   └── planos.md
│   ├── scripts/
│   │   ├── gerar_contrato.js     ← PORTAR para API route TS (lógica intacta)
│   │   ├── parcelas.py           ← RE-IMPLEMENTAR em TS (não rodar Python)
│   │   └── parse_pedido.py       ← ignorar (o pedido vem do formulário/banco, não de .xlsx)
│   └── assets/footlink-logo.png  ← logo do cabeçalho (mover p/ assets do projeto)
└── _validacao/                   ← gabaritos: o módulo portado deve reproduzir
    ├── PANTANAL_teste.docx        (clube Scout Basic, PIX, parcelado)
    └── ELENKO_teste.docx          (agente Scout Prime, boleto, parcelado)
```

## Notas

- **`_skill/` é referência, não app.** O Claude do Antigravity constrói o módulo em TS seguindo o
  PROMPT e usa `_skill/` como fonte. Não copie `_skill/` para dentro de `src/`.
- **`gerar_contrato.js` é o único que vira código** (portado para TS). É Node + lib `docx`, adapta bem.
- **`parcelas.py` é só a lógica** — reescrever em TS.
- **`parse_pedido.py` não é usado** — no sistema o pedido vem do formulário/banco, não de planilha.
- **Valide contra `_validacao/`** antes de avançar. Se os dois casos baterem, o motor está correto.

## Contexto do fluxo maior

Este módulo é o motor de contrato dentro do sistema de fechamento de venda (Fase 1). O restante do
sistema — formulário de pedido, aprovação, papéis, e as Fases 2 (Bling + comissionamento) e 3
(assinatura Clicksign) — está no spec geral entregue anteriormente. Este pacote foca só na geração do
contrato a partir do pedido aprovado, já com a skill atualizada (linha Scout, linhagem enxuta padrão,
chave perfil+plano, PIX, divulgação em 3 níveis, API em tabela separada, numeração dinâmica).

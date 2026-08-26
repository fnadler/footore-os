-- Footlink — Sistema de Fechamento de Venda
-- 0006_meio_pagamento_parcelas.sql: meio de pagamento (dado interno/CRM,
-- não muda o texto do contrato — Cláusula Oitava continua sempre "boleto
-- bancário", decisão registrada na conversa) + número de parcelas variável
-- (era fixo em 12 no gerador).

create type meio_pagamento as enum ('boleto', 'pix', 'transferencia_bancaria', 'cartao_credito', 'cartao_debito');

alter table pedidos add column meio_pagamento meio_pagamento not null default 'boleto';
alter table pedidos add column numero_parcelas integer;

-- Backfill: todo pedido parcelado existente até aqui foi gerado com 12
-- parcelas fixas (era o único valor possível antes desta migration).
update pedidos set numero_parcelas = 12 where forma_pagamento = 'parcelado' and numero_parcelas is null;

alter table pedidos add constraint numero_parcelas_valido check (
  (forma_pagamento = 'parcelado' and numero_parcelas is not null and numero_parcelas > 0)
  or (forma_pagamento = 'avista' and numero_parcelas is null)
);

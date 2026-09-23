-- Footlink — Sistema de Fechamento de Venda
-- 0013_clicksign_envelope.sql: Fase 3 (assinatura eletrônica via Clicksign,
-- PROMPT.md seção 8). Guarda a referência do envelope criado a partir da
-- versão do contrato enviada para assinatura, e o path do documento final
-- assinado (preenchido pelo webhook quando o envelope fecha).

alter table contratos add column clicksign_envelope_id text;
alter table contratos add column arquivo_assinado_path text;

create unique index contratos_clicksign_envelope_id_idx
  on contratos (clicksign_envelope_id)
  where clicksign_envelope_id is not null;

-- Footlink — Sistema de Fechamento de Venda
-- 0015_clicksign_document_id.sql: Fase 3 (Clicksign). Descoberto testando o
-- webhook real: a chave que a Clicksign manda no evento `document_closed`
-- (`document.key`) é o id do recurso `document` (POST
-- /envelopes/:id/documents), NÃO o id do `envelope` — são recursos
-- diferentes na API v3. `clicksign_envelope_id` (0013) continua útil pra
-- outras operações no envelope; esta coluna é o que o webhook realmente usa
-- pra casar de volta com o pedido.
alter table contratos add column clicksign_document_id text;

create unique index contratos_clicksign_document_id_idx
  on contratos (clicksign_document_id)
  where clicksign_document_id is not null;

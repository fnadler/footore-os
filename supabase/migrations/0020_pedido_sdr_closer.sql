-- Footlink — Sistema de Fechamento de Venda
-- 0020_pedido_sdr_closer.sql: SDR e Closer do pedido — definem a comissão que
-- cada um recebe na venda (cálculo em si vem depois, junto do bloco de
-- configuração de comissionamento). Podem ser a mesma pessoa. Qualquer
-- vendedor ou admin pode ser selecionado (não só quem tem o pedido) — por
-- isso são colunas próprias, não reaproveitam vendedor_id.
alter table pedidos add column sdr_id uuid references profiles (user_id);
alter table pedidos add column closer_id uuid references profiles (user_id);

-- pedidos->profiles agora tem 3 caminhos de FK (vendedor_id, sdr_id,
-- closer_id) — o app usa hints de relacionamento (`profiles!pedidos_..._fkey`)
-- pra desambiguar, então força o PostgREST a recarregar o schema já.
notify pgrst, 'reload schema';

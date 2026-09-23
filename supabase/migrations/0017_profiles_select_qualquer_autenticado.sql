-- Footlink — Sistema de Fechamento de Venda
-- 0017_profiles_select_qualquer_autenticado.sql: `profiles` só guarda nome e
-- papel (nada sensível — nem e-mail, nem CPF) — não há motivo pra restringir
-- a leitura entre colegas internos da Footure. A policy antiga só deixava um
-- vendedor ver o próprio perfil, então a linha do tempo do pedido (seção 5 da
-- tela de detalhe) mostrava "por —" pra qualquer transição feita por
-- admin/jurídico quando vista por um vendedor, mesmo com ator_id gravado
-- certo no banco — era um bug de exibição (RLS bloqueando o join), não falta
-- de dado.
drop policy profiles_select on profiles;

create policy profiles_select on profiles
  for select
  using (auth.uid() is not null);

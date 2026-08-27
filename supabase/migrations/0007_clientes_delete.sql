-- 0007_clientes_delete.sql: falta uma policy de delete pra clientes — sem
-- ela, RLS bloqueia qualquer exclusão (mesmo autenticado) por padrão.
-- A regra de negócio ("só exclui cliente sem pedido vinculado") é aplicada
-- na Server Action antes do delete; a FK pedidos.cliente_id (sem cascade)
-- é o backstop caso algo tente pular a checagem de aplicação.

create policy clientes_delete on clientes
  for delete
  using (auth.uid() is not null);

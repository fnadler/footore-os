-- Footlink — Sistema de Fechamento de Venda
-- 0002_rls.sql: Row Level Security por papel (ver PROMPT.md secao 3).
--
-- RLS aqui resolve VISIBILIDADE e "essa pessoa pode mexer nesta linha, de forma
-- geral". A legalidade de uma transição de estado específica (ex.: só jurídico
-- libera para assinatura, e só com representante legal cadastrado) é
-- responsabilidade da camada de aplicação (src/lib/pedidos/transicoes.ts) — RLS
-- não modela "campo X só muda quando status = Y", isso fica no código.

-- ---------------------------------------------------------------------------
-- Helper: papel do usuário autenticado, sem recursão de RLS.
-- security definer + dono da função (postgres) também dono de `profiles` ⇒
-- a leitura abaixo ignora a própria RLS de `profiles` (padrão recomendado pela
-- Supabase para evitar policies recursivas).
-- ---------------------------------------------------------------------------

create function public.meu_papel()
returns papel_usuario
language sql
stable
security definer
set search_path = public
as $$
  select papel from profiles where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;

create policy profiles_select on profiles
  for select
  using (user_id = auth.uid() or public.meu_papel() in ('juridico', 'admin'));

create policy profiles_update_admin on profiles
  for update
  using (public.meu_papel() = 'admin')
  with check (public.meu_papel() = 'admin');

-- Sem policy de insert/delete para usuários comuns: profiles nasce só pelo
-- trigger on_auth_user_created (security definer, ignora RLS).

-- ---------------------------------------------------------------------------
-- clientes + signatarios_cliente — diretório compartilhado entre vendedores
-- ---------------------------------------------------------------------------

alter table clientes enable row level security;

create policy clientes_select on clientes
  for select
  using (auth.uid() is not null);

create policy clientes_insert on clientes
  for insert
  with check (auth.uid() is not null);

create policy clientes_update on clientes
  for update
  using (auth.uid() is not null);

alter table signatarios_cliente enable row level security;

create policy signatarios_cliente_select on signatarios_cliente
  for select
  using (auth.uid() is not null);

create policy signatarios_cliente_insert on signatarios_cliente
  for insert
  with check (auth.uid() is not null);

create policy signatarios_cliente_update on signatarios_cliente
  for update
  using (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- representantes_footure — lookup fixo (Emílio/Eduardo)
-- ---------------------------------------------------------------------------

alter table representantes_footure enable row level security;

create policy representantes_footure_select on representantes_footure
  for select
  using (auth.uid() is not null);

create policy representantes_footure_write_admin on representantes_footure
  for all
  using (public.meu_papel() = 'admin')
  with check (public.meu_papel() = 'admin');

-- ---------------------------------------------------------------------------
-- pedidos — vendedor só vê/edita os próprios; jurídico e admin veem tudo
-- ---------------------------------------------------------------------------

alter table pedidos enable row level security;

create policy pedidos_select on pedidos
  for select
  using (vendedor_id = auth.uid() or public.meu_papel() in ('juridico', 'admin'));

create policy pedidos_insert on pedidos
  for insert
  with check (vendedor_id = auth.uid() and public.meu_papel() = 'vendedor');

create policy pedidos_update on pedidos
  for update
  using (
    (vendedor_id = auth.uid() and public.meu_papel() = 'vendedor')
    or public.meu_papel() in ('juridico', 'admin')
  );

-- Sem policy de delete: pedidos nunca são apagados, só transicionados.

-- ---------------------------------------------------------------------------
-- Tabelas dependentes de pedidos (signatários do pedido, contratos, transições)
-- herdam a mesma visibilidade via join — mesmo padrão em todas.
-- ---------------------------------------------------------------------------

alter table pedido_signatarios enable row level security;

create policy pedido_signatarios_select on pedido_signatarios
  for select
  using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_signatarios.pedido_id
        and (p.vendedor_id = auth.uid() or public.meu_papel() in ('juridico', 'admin'))
    )
  );

create policy pedido_signatarios_write on pedido_signatarios
  for all
  using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_signatarios.pedido_id
        and (
          (p.vendedor_id = auth.uid() and public.meu_papel() = 'vendedor')
          or public.meu_papel() in ('juridico', 'admin')
        )
    )
  )
  with check (
    exists (
      select 1 from pedidos p
      where p.id = pedido_signatarios.pedido_id
        and (
          (p.vendedor_id = auth.uid() and public.meu_papel() = 'vendedor')
          or public.meu_papel() in ('juridico', 'admin')
        )
    )
  );

alter table pedido_representantes_footure enable row level security;

create policy pedido_representantes_footure_select on pedido_representantes_footure
  for select
  using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_representantes_footure.pedido_id
        and (p.vendedor_id = auth.uid() or public.meu_papel() in ('juridico', 'admin'))
    )
  );

create policy pedido_representantes_footure_write on pedido_representantes_footure
  for all
  using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_representantes_footure.pedido_id
        and (
          (p.vendedor_id = auth.uid() and public.meu_papel() = 'vendedor')
          or public.meu_papel() in ('juridico', 'admin')
        )
    )
  )
  with check (
    exists (
      select 1 from pedidos p
      where p.id = pedido_representantes_footure.pedido_id
        and (
          (p.vendedor_id = auth.uid() and public.meu_papel() = 'vendedor')
          or public.meu_papel() in ('juridico', 'admin')
        )
    )
  );

alter table pedido_testemunhas_footure enable row level security;

create policy pedido_testemunhas_footure_select on pedido_testemunhas_footure
  for select
  using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_testemunhas_footure.pedido_id
        and (p.vendedor_id = auth.uid() or public.meu_papel() in ('juridico', 'admin'))
    )
  );

create policy pedido_testemunhas_footure_write on pedido_testemunhas_footure
  for all
  using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_testemunhas_footure.pedido_id
        and (
          (p.vendedor_id = auth.uid() and public.meu_papel() = 'vendedor')
          or public.meu_papel() in ('juridico', 'admin')
        )
    )
  )
  with check (
    exists (
      select 1 from pedidos p
      where p.id = pedido_testemunhas_footure.pedido_id
        and (
          (p.vendedor_id = auth.uid() and public.meu_papel() = 'vendedor')
          or public.meu_papel() in ('juridico', 'admin')
        )
    )
  );

alter table contratos enable row level security;

create policy contratos_select on contratos
  for select
  using (
    exists (
      select 1 from pedidos p
      where p.id = contratos.pedido_id
        and (p.vendedor_id = auth.uid() or public.meu_papel() in ('juridico', 'admin'))
    )
  );

-- Só jurídico/admin sobem novas versões (a v1 nasce junto com a transição de
-- aprovação, disparada pelo admin). Sem policy de update: versões são imutáveis.
create policy contratos_insert on contratos
  for insert
  with check (public.meu_papel() in ('juridico', 'admin'));

alter table transicoes enable row level security;

create policy transicoes_select on transicoes
  for select
  using (
    exists (
      select 1 from pedidos p
      where p.id = transicoes.pedido_id
        and (p.vendedor_id = auth.uid() or public.meu_papel() in ('juridico', 'admin'))
    )
  );

-- Auditoria imutável: qualquer papel pode registrar transição própria (a
-- legalidade da transição em si é validada em código antes do insert); sem
-- policy de update/delete.
create policy transicoes_insert on transicoes
  for insert
  with check (ator_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Fase 2 — comissão: config é admin-only; cada vendedor vê a própria comissão
-- ---------------------------------------------------------------------------

alter table regras_comissao enable row level security;

create policy regras_comissao_admin on regras_comissao
  for all
  using (public.meu_papel() = 'admin')
  with check (public.meu_papel() = 'admin');

alter table comissoes enable row level security;

create policy comissoes_select on comissoes
  for select
  using (vendedor_id = auth.uid() or public.meu_papel() = 'admin');

create policy comissoes_write_admin on comissoes
  for all
  using (public.meu_papel() = 'admin')
  with check (public.meu_papel() = 'admin');

-- ---------------------------------------------------------------------------
-- Fase 2/3 — credenciais de integração: só admin enxerga
-- ---------------------------------------------------------------------------

alter table integracoes_bling enable row level security;

create policy integracoes_bling_admin on integracoes_bling
  for all
  using (public.meu_papel() = 'admin')
  with check (public.meu_papel() = 'admin');

alter table integracoes_clicksign enable row level security;

create policy integracoes_clicksign_admin on integracoes_clicksign
  for all
  using (public.meu_papel() = 'admin')
  with check (public.meu_papel() = 'admin');

-- Footlink — Sistema de Fechamento de Venda
-- 0001_init.sql: extensões, enums, tabelas e triggers básicos.
-- Ver PROMPT.md secao 5 para o racional de cada tabela/coluna.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type papel_usuario as enum ('vendedor', 'juridico', 'admin');

create type tipo_cliente as enum ('clube', 'agente'); -- também usado como "perfil" do pedido

create type status_pedido as enum (
  'rascunho',
  'em_aprovacao',
  'aprovado',
  'em_revisao_juridica',
  'pronto_para_assinatura',
  'enviado_para_assinatura',
  'assinado',
  'concluido'
);

create type forma_pagamento as enum ('avista', 'parcelado');

create type convencao_parcelas as enum ('calendario', 'ciclo');

create type tipo_signatario as enum ('representante_legal', 'testemunha');

create type multa_tipo as enum (
  'sem_multa',
  'duas_mensalidades',
  'tres_mensalidades',
  'retencao_total',
  'customizado'
);

create type status_revisao_contrato as enum ('pendente', 'aprovado');

create type base_calculo_comissao as enum ('valor_total', 'valor_recebido');

create type escopo_comissao as enum ('global', 'por_vendedor', 'por_plano', 'por_pagamento');

create type status_comissao as enum ('previsto', 'confirmado', 'pago');

-- ---------------------------------------------------------------------------
-- profiles — papel de cada usuário (Supabase Auth cuida de auth.users)
-- ---------------------------------------------------------------------------

create table profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  nome        text not null,
  papel       papel_usuario not null default 'vendedor',
  criado_em   timestamptz not null default now()
);

-- Provisiona a profile automaticamente quando um usuário é criado no Auth.
-- Papel default 'vendedor' — admin promove depois pela tela de gestão de usuários.
create function public.criar_profile_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, nome, papel)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', new.email), 'vendedor');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_profile_novo_usuario();

-- ---------------------------------------------------------------------------
-- clientes + signatários reutilizáveis
-- ---------------------------------------------------------------------------

create table clientes (
  id                  uuid primary key default gen_random_uuid(),
  tipo                tipo_cliente not null,
  razao_social        text not null,
  cnpj                text not null,
  endereco            text not null,
  foro_preferencial   text not null default 'Porto Alegre/RS',
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

create table signatarios_cliente (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null references clientes (id) on delete cascade,
  tipo           tipo_signatario not null,
  nome_completo  text not null,
  email          text not null,
  cpf            text not null,
  criado_em      timestamptz not null default now()
);

create index signatarios_cliente_cliente_id_idx on signatarios_cliente (cliente_id);

-- Lookup fixo dos representantes da CONTRATADA (Footure). Seed em supabase/seed.sql
-- só popula nome/cargo — email/cpf ficam NULL até o admin preencher com o dado
-- real (não é dado que a implementação tem/deveria inventar); necessários antes
-- de a Fase 3 (Clicksign) montar envelopes com esses representantes.
create table representantes_footure (
  id      uuid primary key default gen_random_uuid(),
  nome    text not null unique,
  cargo   text not null,
  email   text,
  cpf     text,
  ativo   boolean not null default true
);

-- ---------------------------------------------------------------------------
-- pedidos
-- ---------------------------------------------------------------------------

create table pedidos (
  id                        uuid primary key default gen_random_uuid(),
  cliente_id                uuid not null references clientes (id),
  vendedor_id               uuid not null references auth.users (id),
  status                    status_pedido not null default 'rascunho',
  perfil                    tipo_cliente not null,
  produtos                  text[] not null default array['footlink'],
  plano                     text not null,
  licencas_pagas            integer not null default 0,
  licencas_gratuitas        integer not null default 0,
  forma_pagamento           forma_pagamento not null,
  valor_mensal              numeric(12, 2) not null,
  valor_total               numeric(12, 2) not null,
  valor_licenca_adicional   numeric(12, 2),
  valor_mensal_api          numeric(12, 2),
  valor_mensal_software     numeric(12, 2),
  primeiro_pagamento        date not null,
  dia_vencimento            integer,
  convencao_parcelas        convencao_parcelas not null default 'calendario',
  vigencia_inicio           date not null,
  vigencia_fim              date not null,
  divulga_parceria          boolean not null default false,
  multa_tipo                multa_tipo not null default 'tres_mensalidades',
  multa_texto               text not null,
  foro                      text not null default 'Porto Alegre/RS',
  condicao_especial         text,
  plano_legado_detectado    boolean not null default false,
  plano_legado_nome_original text,
  geracao_contrato_erro     text,
  bling_pedido_id           text,
  criado_em                 timestamptz not null default now(),
  atualizado_em             timestamptz not null default now(),
  constraint produtos_validos check (produtos <@ array['footlink', 'api']),
  constraint dia_vencimento_valido check (dia_vencimento is null or dia_vencimento between 1 and 31),
  constraint vigencia_coerente check (vigencia_fim > vigencia_inicio)
);

create index pedidos_vendedor_id_idx on pedidos (vendedor_id);
create index pedidos_cliente_id_idx on pedidos (cliente_id);
create index pedidos_status_idx on pedidos (status);

-- Quais signatários do cliente valem para este pedido (N representantes + N testemunhas).
create table pedido_signatarios (
  id                     uuid primary key default gen_random_uuid(),
  pedido_id              uuid not null references pedidos (id) on delete cascade,
  signatario_cliente_id  uuid not null references signatarios_cliente (id),
  tipo                   tipo_signatario not null,
  unique (pedido_id, signatario_cliente_id)
);

-- Emílio e/ou Eduardo selecionados como representante(s) da CONTRATADA neste pedido.
create table pedido_representantes_footure (
  id                         uuid primary key default gen_random_uuid(),
  pedido_id                  uuid not null references pedidos (id) on delete cascade,
  representante_footure_id   uuid not null references representantes_footure (id),
  unique (pedido_id, representante_footure_id)
);

-- Testemunhas do lado Footure — específicas do pedido, não reutilizáveis.
create table pedido_testemunhas_footure (
  id             uuid primary key default gen_random_uuid(),
  pedido_id      uuid not null references pedidos (id) on delete cascade,
  nome_completo  text not null,
  email          text not null,
  cpf            text not null
);

-- ---------------------------------------------------------------------------
-- contratos (versionado) + transições (auditoria imutável)
-- ---------------------------------------------------------------------------

create table contratos (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references pedidos (id) on delete cascade,
  versao           integer not null,
  arquivo_path     text not null,
  gerado_em        timestamptz not null default now(),
  gerado_por       uuid not null references auth.users (id),
  motivo_versao    text,
  status_revisao   status_revisao_contrato not null default 'pendente',
  unique (pedido_id, versao)
);

create index contratos_pedido_id_idx on contratos (pedido_id);

create table transicoes (
  id          uuid primary key default gen_random_uuid(),
  pedido_id   uuid not null references pedidos (id) on delete cascade,
  de          status_pedido,
  para        status_pedido not null,
  ator_id     uuid not null references auth.users (id),
  comentario  text,
  criado_em   timestamptz not null default now()
);

create index transicoes_pedido_id_idx on transicoes (pedido_id);

-- ---------------------------------------------------------------------------
-- Fase 2 — Comissionamento (tabelas prontas, telas/uso ficam de fora da Fase 1)
-- ---------------------------------------------------------------------------

create table regras_comissao (
  id                uuid primary key default gen_random_uuid(),
  ativo             boolean not null default true,
  percentual        numeric(5, 2) not null,
  base_calculo      base_calculo_comissao not null default 'valor_total',
  escopo_tipo       escopo_comissao not null default 'global',
  escopo_valor      text,
  vigencia_inicio   date not null default current_date,
  criado_em         timestamptz not null default now()
);

create table comissoes (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references pedidos (id),
  vendedor_id      uuid not null references auth.users (id),
  regra_id         uuid references regras_comissao (id),
  base             numeric(12, 2) not null,
  percentual       numeric(5, 2) not null,
  valor_calculado  numeric(12, 2) not null,
  status           status_comissao not null default 'previsto',
  pago_em          date,
  pago_observacao  text,
  criado_em        timestamptz not null default now()
);

create index comissoes_vendedor_id_idx on comissoes (vendedor_id);

-- ---------------------------------------------------------------------------
-- Fase 2/3 — credenciais de integração (portas, não usadas na Fase 1)
-- ---------------------------------------------------------------------------

create table integracoes_bling (
  id             uuid primary key default gen_random_uuid(),
  access_token   text,
  refresh_token  text,
  expires_at     timestamptz,
  config         jsonb not null default '{}'::jsonb,
  atualizado_em  timestamptz not null default now()
);

create table integracoes_clicksign (
  id             uuid primary key default gen_random_uuid(),
  access_token   text,
  config         jsonb not null default '{}'::jsonb,
  atualizado_em  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Trigger genérico para manter atualizado_em em dia
-- ---------------------------------------------------------------------------

create function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger clientes_set_atualizado_em
  before update on clientes
  for each row execute function public.set_atualizado_em();

create trigger pedidos_set_atualizado_em
  before update on pedidos
  for each row execute function public.set_atualizado_em();

create trigger integracoes_bling_set_atualizado_em
  before update on integracoes_bling
  for each row execute function public.set_atualizado_em();

create trigger integracoes_clicksign_set_atualizado_em
  before update on integracoes_clicksign
  for each row execute function public.set_atualizado_em();

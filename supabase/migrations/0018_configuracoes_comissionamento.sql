-- Footlink — Sistema de Fechamento de Venda
-- 0018_configuracoes_comissionamento.sql: primeiro "bloco" de configurações
-- independentes (admin/configuracoes) — parâmetros globais usados depois pra
-- calcular a comissão de SDR/Closer. Tabela singleton (id boolean travado em
-- true, só existe uma linha) — mais simples que o modelo de regras por
-- escopo (regras_comissao, Fase 2) pro que foi pedido agora.

create table configuracoes_comissionamento (
  id                          boolean primary key default true,
  percentual_imposto          numeric(5, 2) not null default 0,
  percentual_comissao_total   numeric(5, 2) not null default 0,
  percentual_comissao_sdr     numeric(5, 2) not null default 0,
  percentual_comissao_closer  numeric(5, 2) not null default 0,
  atualizado_por              uuid references profiles (user_id),
  atualizado_em               timestamptz not null default now(),
  constraint configuracoes_comissionamento_singleton check (id),
  constraint configuracoes_comissionamento_percentuais check (
    percentual_imposto between 0 and 100
    and percentual_comissao_total between 0 and 100
    and percentual_comissao_sdr between 0 and 100
    and percentual_comissao_closer between 0 and 100
  )
);

insert into configuracoes_comissionamento (id) values (true);

alter table configuracoes_comissionamento enable row level security;

-- Só admin — são parâmetros financeiros usados pra calcular comissão de
-- terceiros, não é informação de vendedor/jurídico.
create policy configuracoes_comissionamento_select on configuracoes_comissionamento
  for select
  using (public.meu_papel() = 'admin');

create policy configuracoes_comissionamento_update on configuracoes_comissionamento
  for update
  using (public.meu_papel() = 'admin')
  with check (public.meu_papel() = 'admin');

create trigger configuracoes_comissionamento_set_atualizado_em
  before update on configuracoes_comissionamento
  for each row execute function public.set_atualizado_em();

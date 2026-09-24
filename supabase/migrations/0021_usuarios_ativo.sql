-- Footlink — Sistema de Fechamento de Venda
-- 0021_usuarios_ativo.sql: inativação de usuário — flag de aplicação, não
-- bloqueio no Supabase Auth (decisão explícita: mais simples, aceita que um
-- usuário inativo com sessão válida ainda poderia bater direto na API do
-- Supabase por fora do app; RLS não foi endurecida pra cobrir esse caso).
-- Checada em obterSessao() (trata inativo como não-logado) e no login (barra
-- e desloga na hora, com mensagem clara, em vez de deixar entrar e travar
-- silenciosamente na primeira ação).
alter table profiles add column ativo boolean not null default true;

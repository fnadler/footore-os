-- Footlink — Sistema de Fechamento de Venda
-- 0005_fk_profiles.sql: FKs extras pra permitir embed PostgREST de profiles.
--
-- pedidos.vendedor_id e transicoes.ator_id já referenciam auth.users(id) —
-- correto pra integridade (é lá que o Supabase Auth garante o ID). Mas o
-- PostgREST só embute relacionamento (`select("..., profiles(nome)")`)
-- quando existe uma FK apontando DIRETO pra tabela embutida; auth.users não
-- conta (schema diferente, nem sempre exposto). profiles.user_id é 1:1 com
-- auth.users.id (mesmo trigger que cria um, cria o outro), então essas FKs
-- extras são seguras e não mudam a integridade — só habilitam o embed.

alter table pedidos
  add constraint pedidos_vendedor_id_profiles_fkey foreign key (vendedor_id) references profiles (user_id);

alter table transicoes
  add constraint transicoes_ator_id_profiles_fkey foreign key (ator_id) references profiles (user_id);

alter table contratos
  add constraint contratos_gerado_por_profiles_fkey foreign key (gerado_por) references profiles (user_id);

-- Força o PostgREST a recarregar o cache de schema agora, em vez de esperar
-- o próximo reload automático.
notify pgrst, 'reload schema';

-- Footlink — Sistema de Fechamento de Venda
-- 0011_plano_key_canonica.sql: PROMPT_NORMALIZACAO_PLANOS.md — pedidos.plano passa
-- a guardar a KEY canônica do registro (src/lib/plans/plan-registry.json), não mais
-- o nome solto do tier. Garante que o pedido e o contrato usem a MESMA chave, em
-- vez de duas listas que podem divergir.
--
-- A migration 0010 já deixou pedidos.plano com os nomes de tier ATUAIS (Basic/
-- Essential/Prime/Elite/Single/Starter/Multi-Club) — esta migration só troca o
-- nome solto pela key prefixada por perfil.

update pedidos set plano = case
  when perfil = 'clube' and plano = 'Starter'     then 'clube:scout-starter'
  when perfil = 'clube' and plano = 'Basic'       then 'clube:scout-basic'
  when perfil = 'clube' and plano = 'Essential'   then 'clube:scout-essential'
  when perfil = 'clube' and plano = 'Elite'       then 'clube:scout-elite'
  when perfil = 'clube' and plano = 'Multi-Club'  then 'clube:scout-multi-club'
  when perfil = 'agente' and plano = 'Single'     then 'agente:scout-single'
  when perfil = 'agente' and plano = 'Basic'      then 'agente:scout-basic'
  when perfil = 'agente' and plano = 'Essential'  then 'agente:scout-essential'
  when perfil = 'agente' and plano = 'Prime'      then 'agente:scout-prime'
  when perfil = 'agente' and plano = 'Elite'      then 'agente:scout-elite'
  else plano
end
where plano not like '%:%'; -- idempotente: pedidos já migrados (plano já é uma key) ficam intactos

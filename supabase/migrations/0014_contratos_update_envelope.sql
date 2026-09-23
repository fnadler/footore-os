-- Footlink — Sistema de Fechamento de Venda
-- 0014_contratos_update_envelope.sql: Fase 3 (Clicksign). A tabela `contratos`
-- nunca teve policy de UPDATE (0002_rls.sql: "versões são imutáveis" — correto
-- pra arquivo_path/versao, que a aplicação nunca reescreve). Mas
-- 0013_clicksign_envelope.sql adicionou duas colunas que SÃO atualizadas depois
-- da linha existir (clicksign_envelope_id, no envio; arquivo_assinado_path, no
-- webhook de conclusão) — sem policy, esse update é bloqueado silenciosamente
-- pelo RLS sob uma sessão normal (só funcionava via service role).
create policy contratos_update on contratos
  for update
  using (public.meu_papel() in ('juridico', 'admin'))
  with check (public.meu_papel() in ('juridico', 'admin'));

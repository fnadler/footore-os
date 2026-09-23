-- Footlink — Sistema de Fechamento de Venda
-- 0016_transicoes_ator_id_nulo.sql: Fase 3 (Clicksign). A transição
-- ENVIADO_PARA_ASSINATURA -> ASSINADO é disparada pelo webhook (service
-- role, sem sessão de usuário) — não existe um `auth.uid()` humano pra essa
-- transição específica. `transicoes.ator_id` era NOT NULL, o que travava o
-- insert com "null value in column ator_id violates not-null constraint".
-- A UI (src/app/pedidos/[id]/page.tsx) já trata ator ausente com fallback "—".
alter table transicoes alter column ator_id drop not null;

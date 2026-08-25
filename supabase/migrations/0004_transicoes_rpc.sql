-- Footlink — Sistema de Fechamento de Venda
-- 0004_transicoes_rpc.sql: grava transição + atualiza status atomicamente,
-- e valida o grafo de estados da seção 4 do PROMPT.md como defesa em
-- profundidade (a UI/Server Actions já checam antes de chamar, mas isso
-- garante que ninguém force uma transição inválida chamando o RPC direto).
--
-- security invoker (padrão) — a RLS de `pedidos`/`transicoes` continua valendo
-- por baixo: um vendedor só consegue mesmo transicionar pedido próprio.

create function public.registrar_transicao(
  p_pedido_id uuid,
  p_para status_pedido,
  p_comentario text default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_de status_pedido;
  v_papel papel_usuario;
  v_permitido boolean;
begin
  select status into v_de from pedidos where id = p_pedido_id for update;
  if v_de is null then
    raise exception 'Pedido % não encontrado', p_pedido_id;
  end if;

  v_papel := public.meu_papel();

  v_permitido := case
    when v_de = 'rascunho' and p_para = 'em_aprovacao' and v_papel = 'vendedor' then true
    when v_de = 'em_aprovacao' and p_para = 'aprovado' and v_papel = 'admin' then true
    when v_de = 'em_aprovacao' and p_para = 'rascunho' and v_papel = 'admin' then true
    -- aprovado -> em_revisao_juridica: geração automática do contrato, disparada
    -- pelo mesmo admin que aprovou, ou por admin/jurídico tentando de novo se a
    -- geração tinha falhado antes (pedido fica visível em APROVADO com erro).
    when v_de = 'aprovado' and p_para = 'em_revisao_juridica' and v_papel in ('admin', 'juridico') then true
    when v_de = 'em_revisao_juridica' and p_para = 'pronto_para_assinatura' and v_papel in ('juridico', 'admin') then true
    when v_de = 'em_revisao_juridica' and p_para = 'aprovado' and v_papel in ('juridico', 'admin') then true
    when v_de = 'pronto_para_assinatura' and p_para = 'enviado_para_assinatura' and v_papel in ('juridico', 'admin') then true
    -- enviado_para_assinatura -> assinado: webhook Clicksign (Fase 3), via
    -- service role — sem checagem de papel de propósito (chamada de sistema).
    when v_de = 'enviado_para_assinatura' and p_para = 'assinado' then true
    when v_de = 'assinado' and p_para = 'concluido' and v_papel in ('juridico', 'admin') then true
    else false
  end;

  if not v_permitido then
    raise exception 'Transição % -> % não permitida para o papel %', v_de, p_para, coalesce(v_papel::text, '(nenhum)');
  end if;

  insert into transicoes (pedido_id, de, para, ator_id, comentario)
  values (p_pedido_id, v_de, p_para, auth.uid(), p_comentario);

  update pedidos set status = p_para where id = p_pedido_id;
end;
$$;

grant execute on function public.registrar_transicao(uuid, status_pedido, text) to authenticated;

-- Footlink — Sistema de Fechamento de Venda
-- 0019_admin_pode_tudo.sql: admin deve poder fazer qualquer ação que
-- vendedor/jurídico fazem, incluindo criar/editar pedido de venda — hoje só
-- vendedor pode (auditoria completa feita antes desta migration). Fecha os
-- dois pontos que dependem do banco: RLS de insert em `pedidos` e as 3
-- transições de "reabrir para edição" (volta pra rascunho) no
-- registrar_transicao que eram vendedor-only. O resto (server actions, rotas
-- /vendedor/*, botão Editar) é ajustado em código.

drop policy pedidos_insert on pedidos;

create policy pedidos_insert on pedidos
  for insert
  with check (vendedor_id = auth.uid() and public.meu_papel() in ('vendedor', 'admin'));

create or replace function public.registrar_transicao(
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
    when v_de = 'rascunho' and p_para = 'em_aprovacao' and v_papel in ('vendedor', 'admin') then true
    when v_de = 'em_aprovacao' and p_para = 'aprovado' and v_papel = 'admin' then true
    when v_de = 'em_aprovacao' and p_para = 'rascunho' and v_papel in ('admin', 'vendedor') then true
    when v_de = 'aprovado' and p_para = 'em_revisao_juridica' and v_papel in ('admin', 'juridico') then true
    when v_de = 'aprovado' and p_para = 'rascunho' and v_papel in ('vendedor', 'admin') then true
    when v_de = 'em_revisao_juridica' and p_para = 'pronto_para_assinatura' and v_papel in ('juridico', 'admin') then true
    when v_de = 'em_revisao_juridica' and p_para = 'aprovado' and v_papel in ('juridico', 'admin') then true
    when v_de = 'em_revisao_juridica' and p_para = 'rascunho' and v_papel in ('vendedor', 'admin') then true
    when v_de = 'pronto_para_assinatura' and p_para = 'enviado_para_assinatura' and v_papel in ('juridico', 'admin') then true
    when v_de = 'pronto_para_assinatura' and p_para = 'em_revisao_juridica' and v_papel in ('juridico', 'admin') then true
    when v_de = 'enviado_para_assinatura' and p_para = 'em_revisao_juridica' and v_papel in ('juridico', 'admin') then true
    when v_de = 'enviado_para_assinatura' and p_para = 'assinado' then true
    when v_de = 'assinado' and p_para = 'concluido' and v_papel in ('juridico', 'admin') then true
    when p_para = 'cancelado' and v_de not in ('concluido', 'cancelado') and v_papel in ('vendedor', 'admin', 'juridico') then true
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

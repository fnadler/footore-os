-- Footlink — Sistema de Fechamento de Venda
-- 0003_storage.sql: bucket privado de contratos + policies.
--
-- Convenção de path: contratos/{pedido_id}/v{versao}.docx — o primeiro segmento
-- do path é sempre o pedido_id, o que permite reaproveitar a mesma regra de
-- visibilidade de `pedidos` sem duplicar lógica.

insert into storage.buckets (id, name, public)
values ('contratos', 'contratos', false)
on conflict (id) do nothing;

create policy contratos_storage_select on storage.objects
  for select
  using (
    bucket_id = 'contratos'
    and exists (
      select 1 from pedidos p
      where p.id::text = (storage.foldername(name))[1]
        and (p.vendedor_id = auth.uid() or public.meu_papel() in ('juridico', 'admin'))
    )
  );

-- Upload de novas versões: mesma regra de quem pode inserir em `contratos`
-- (jurídico/admin) — a v1, gerada na aprovação, também é gravada por um admin.
create policy contratos_storage_insert on storage.objects
  for insert
  with check (
    bucket_id = 'contratos'
    and public.meu_papel() in ('juridico', 'admin')
    and exists (
      select 1 from pedidos p where p.id::text = (storage.foldername(name))[1]
    )
  );

-- Sem policy de update/delete: cada versão é um objeto novo, nunca sobrescrito.

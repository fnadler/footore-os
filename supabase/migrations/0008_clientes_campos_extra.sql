-- 0008_clientes_campos_extra.sql: nome fantasia, apelido (clubes) e logo/escudo
-- do cliente, mais o bucket de Storage pra guardar a imagem.

alter table clientes add column nome_fantasia text;
alter table clientes add column apelido text;
alter table clientes add column logo_path text;

-- Bucket público — logo/escudo não é dado sensível, e público simplifica exibir
-- a imagem direto por URL, sem precisar de signed URL como em `contratos`.
insert into storage.buckets (id, name, public)
values ('logos-clientes', 'logos-clientes', true)
on conflict (id) do nothing;

create policy logos_clientes_storage_select on storage.objects
  for select
  using (bucket_id = 'logos-clientes');

create policy logos_clientes_storage_insert on storage.objects
  for insert
  with check (bucket_id = 'logos-clientes' and auth.uid() is not null);

create policy logos_clientes_storage_update on storage.objects
  for update
  using (bucket_id = 'logos-clientes' and auth.uid() is not null);

create policy logos_clientes_storage_delete on storage.objects
  for delete
  using (bucket_id = 'logos-clientes' and auth.uid() is not null);

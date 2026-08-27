import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarCliente, urlLogoCliente } from "@/lib/clientes/consultas";
import { ClienteForm } from "@/components/clientes/cliente-form";

export default async function EditarClientePage({ params }: PageProps<"/clientes/[id]/editar">) {
  const { id } = await params;
  const supabase = await createClient();
  const cliente = await buscarCliente(supabase, id);
  if (!cliente) notFound();

  const logoUrl = urlLogoCliente(supabase, cliente.logo_path);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Editar cliente</h1>
      <ClienteForm
        cliente={{
          id: cliente.id,
          tipo: cliente.tipo,
          razaoSocial: cliente.razao_social,
          nomeFantasia: cliente.nome_fantasia,
          apelido: cliente.apelido,
          cnpj: cliente.cnpj,
          endereco: cliente.endereco,
          foroPreferencial: cliente.foro_preferencial,
          logoUrl,
        }}
      />
    </div>
  );
}

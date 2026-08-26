import { createClient } from "@/lib/supabase/server";
import { listarClientes, listarRepresentantesFooture, listarSignatariosDoCliente } from "@/lib/pedidos/consultas";
import { PedidoForm } from "@/components/pedido/pedido-form";

export default async function NovoPedidoPage() {
  const supabase = await createClient();
  const [clientes, representantesFooture] = await Promise.all([
    listarClientes(supabase),
    listarRepresentantesFooture(supabase),
  ]);

  const signatariosPorCliente: Record<string, { id: string; nomeCompleto: string; email: string; cpf: string }[]> = {};
  await Promise.all(
    clientes.map(async (c) => {
      const signatarios = await listarSignatariosDoCliente(supabase, c.id);
      signatariosPorCliente[c.id] = signatarios.map((s) => ({
        id: s.id,
        nomeCompleto: s.nome_completo,
        email: s.email,
        cpf: s.cpf,
      }));
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Novo pedido</h1>
      <PedidoForm
        clientes={clientes.map((c) => ({ id: c.id, tipo: c.tipo, razaoSocial: c.razao_social, cnpj: c.cnpj, endereco: c.endereco }))}
        signatariosPorCliente={signatariosPorCliente}
        representantesFooture={representantesFooture.map((r) => ({ id: r.id, nome: r.nome }))}
      />
    </div>
  );
}

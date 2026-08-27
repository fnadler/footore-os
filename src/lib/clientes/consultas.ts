import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Supa = SupabaseClient<Database>;

function logSeErro(contexto: string, error: { message: string } | null) {
  if (error) console.error(`[clientes/consultas] ${contexto}:`, error.message);
}

export async function listarClientesComContagemPedidos(supabase: Supa) {
  const [{ data: clientes, error: erroClientes }, { data: pedidos, error: erroPedidos }] = await Promise.all([
    supabase.from("clientes").select("*").order("razao_social", { ascending: true }),
    supabase.from("pedidos").select("cliente_id"),
  ]);
  logSeErro("listarClientesComContagemPedidos:clientes", erroClientes);
  logSeErro("listarClientesComContagemPedidos:pedidos", erroPedidos);

  const contagem = new Map<string, number>();
  for (const p of pedidos ?? []) {
    contagem.set(p.cliente_id, (contagem.get(p.cliente_id) ?? 0) + 1);
  }

  return (clientes ?? []).map((c) => ({ ...c, totalPedidos: contagem.get(c.id) ?? 0 }));
}

export async function buscarCliente(supabase: Supa, clienteId: string) {
  const { data, error } = await supabase.from("clientes").select("*").eq("id", clienteId).single();
  logSeErro(`buscarCliente(${clienteId})`, error);
  return data ?? null;
}

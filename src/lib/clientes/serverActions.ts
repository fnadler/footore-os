"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { exigirPapel } from "@/lib/auth/session";

const ClientePayloadSchema = z.object({
  clienteId: z.string().uuid().optional(), // presente = edição
  tipo: z.enum(["clube", "agente"]),
  razaoSocial: z.string().min(1),
  cnpj: z.string().min(1),
  endereco: z.string().min(1),
  foroPreferencial: z.string().min(1),
});

export interface SalvarClienteState {
  erro?: string;
}

/** Cria (ou atualiza, se clienteId vier no payload) um cliente. */
export async function salvarClienteAction(_prev: SalvarClienteState, formData: FormData): Promise<SalvarClienteState> {
  await exigirPapel("vendedor", "admin");
  const bruto = JSON.parse(String(formData.get("payload") ?? "{}"));
  const parsed = ClientePayloadSchema.safeParse(bruto);
  if (!parsed.success) {
    return { erro: `Dados inválidos: ${parsed.error.issues.map((i) => i.message).join("; ")}` };
  }
  const payload = parsed.data;
  const supabase = await createClient();

  const linha = {
    tipo: payload.tipo,
    razao_social: payload.razaoSocial,
    cnpj: payload.cnpj,
    endereco: payload.endereco,
    foro_preferencial: payload.foroPreferencial,
  };

  if (payload.clienteId) {
    const { error } = await supabase.from("clientes").update(linha).eq("id", payload.clienteId);
    if (error) return { erro: `Falha ao salvar cliente: ${error.message}` };
  } else {
    const { error } = await supabase.from("clientes").insert(linha);
    if (error) return { erro: `Falha ao criar cliente: ${error.message}` };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

/** Só remove clientes sem pedido vinculado — a FK (sem cascade) é o backstop caso essa checagem seja pulada. */
export async function excluirClienteAction(clienteId: string) {
  await exigirPapel("vendedor", "admin");
  const supabase = await createClient();

  const { count, error: erroContagem } = await supabase
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", clienteId);
  if (erroContagem) throw new Error(erroContagem.message);
  if ((count ?? 0) > 0) {
    throw new Error("Este cliente possui pedidos vinculados e não pode ser excluído.");
  }

  const { error } = await supabase.from("clientes").delete().eq("id", clienteId);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
}

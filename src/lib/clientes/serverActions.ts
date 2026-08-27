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
  nomeFantasia: z.string().optional(),
  apelido: z.string().optional(), // só faz sentido pra clube — validado na UI, não aqui
  cnpj: z.string().min(1),
  endereco: z.string().min(1),
  foroPreferencial: z.string().min(1),
});

export interface SalvarClienteState {
  erro?: string;
}

/** Cria (ou atualiza, se clienteId vier no payload) um cliente, com upload opcional de logo. */
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
    nome_fantasia: payload.nomeFantasia || null,
    apelido: payload.tipo === "clube" ? payload.apelido || null : null,
    cnpj: payload.cnpj,
    endereco: payload.endereco,
    foro_preferencial: payload.foroPreferencial,
  };

  let clienteId = payload.clienteId;
  if (clienteId) {
    const { error } = await supabase.from("clientes").update(linha).eq("id", clienteId);
    if (error) return { erro: `Falha ao salvar cliente: ${error.message}` };
  } else {
    const { data, error } = await supabase.from("clientes").insert(linha).select("id").single();
    if (error || !data) return { erro: `Falha ao criar cliente: ${error?.message}` };
    clienteId = data.id;
  }

  const imagem = formData.get("imagem") as File | null;
  if (imagem && imagem.size > 0) {
    const path = `${clienteId}/logo`;
    const buffer = Buffer.from(await imagem.arrayBuffer());
    const { error: erroUpload } = await supabase.storage
      .from("logos-clientes")
      .upload(path, buffer, { contentType: imagem.type, upsert: true });
    if (erroUpload) return { erro: `Cliente salvo, mas falhou ao enviar a imagem: ${erroUpload.message}` };

    const { error: erroUpdate } = await supabase.from("clientes").update({ logo_path: path }).eq("id", clienteId);
    if (erroUpdate) return { erro: `Cliente salvo, mas falhou ao registrar a imagem: ${erroUpdate.message}` };
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

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Supa = SupabaseClient<Database>;

// Tabela singleton (id sempre true, uma única linha, criada pela migration)
// — usada depois pra calcular a comissão de SDR/Closer sobre o pedido.
export async function buscarConfiguracaoComissionamento(supabase: Supa) {
  const { data, error } = await supabase.from("configuracoes_comissionamento").select("*").eq("id", true).single();
  if (error || !data) throw new Error(`Configuração de comissionamento não encontrada: ${error?.message}`);
  return data;
}

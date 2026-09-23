// Script avulso, SOMENTE LEITURA — lista pedidos em PRONTO_PARA_ASSINATURA e
// todos os destinatários que um envelope Clicksign incluiria, pra conferência
// humana antes de disparar o envio de verdade (Fase 3).
//
// Uso: npx tsx -r dotenv/config scripts/inspecionar-pedido-assinatura.ts dotenv_config_path=.env.local
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes.");

const supabase = createClient<Database>(url, serviceRoleKey);

async function main() {
  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("id, plano, perfil, clientes(razao_social)")
    .eq("status", "pronto_para_assinatura");
  if (error) throw error;
  if (!pedidos || pedidos.length === 0) {
    console.log("Nenhum pedido em PRONTO_PARA_ASSINATURA encontrado.");
    return;
  }

  for (const p of pedidos) {
    const cliente = p.clientes as unknown as { razao_social: string } | null;
    console.log(`\n=== Pedido ${p.id} — ${cliente?.razao_social ?? "?"} (${p.perfil}, ${p.plano}) ===`);

    const [{ data: signatariosCliente }, { data: repsFooture }, { data: testemunhasFooture }] = await Promise.all([
      supabase
        .from("pedido_signatarios")
        .select("tipo, signatarios_cliente(nome_completo, email, cpf)")
        .eq("pedido_id", p.id),
      supabase.from("pedido_representantes_footure").select("representantes_footure(nome, email, cpf)").eq("pedido_id", p.id),
      supabase.from("pedido_testemunhas_footure").select("nome_completo, email, cpf").eq("pedido_id", p.id),
    ]);

    for (const r of signatariosCliente ?? []) {
      const s = r.signatarios_cliente as unknown as { nome_completo: string; email: string; cpf: string } | null;
      const papel = r.tipo === "representante_legal" ? "legal_representative (representante do CLIENTE)" : "witness (testemunha do CLIENTE)";
      console.log(`- ${s?.nome_completo ?? "?"} <${s?.email ?? "?"}> cpf=${s?.cpf ?? "?"} — papel: ${papel}`);
    }
    for (const r of repsFooture ?? []) {
      const rep = r.representantes_footure as unknown as { nome: string; email: string | null; cpf: string | null } | null;
      console.log(`- ${rep?.nome ?? "?"} <${rep?.email ?? "(SEM E-MAIL)"}> cpf=${rep?.cpf ?? "(SEM CPF)"} — papel: legal_representative (representante da FOOTURE)`);
    }
    for (const t of testemunhasFooture ?? []) {
      console.log(`- ${t.nome_completo} <${t.email}> cpf=${t.cpf} — papel: witness (testemunha da FOOTURE)`);
    }
  }
}

main();

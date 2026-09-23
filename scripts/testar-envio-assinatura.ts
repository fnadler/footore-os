// Script avulso pra testar o envio real pra Clicksign (Fase 3) fora da UI —
// chama a mesma função de orquestração que o botão "Enviar para assinatura"
// usa (src/lib/pedidos/acoes.ts), só que com service role (bypassa RLS).
//
// Uso: npx tsx -r dotenv/config scripts/testar-envio-assinatura.ts dotenv_config_path=.env.local -- <pedido_id>
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types";
import { enviarPedidoParaAssinatura } from "../src/lib/pedidos/acoes";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes.");

const pedidoId = process.argv[2];
if (!pedidoId) throw new Error("Uso: ... scripts/testar-envio-assinatura.ts -- <pedido_id>");

const supabase = createClient<Database>(url, serviceRoleKey);

enviarPedidoParaAssinatura(supabase, pedidoId, "Teste manual de integração Clicksign (sandbox).")
  .then(() => console.log("OK — pedido movido para ENVIADO_PARA_ASSINATURA."))
  .catch((erro) => {
    console.error("FALHOU:", erro);
    process.exit(1);
  });
